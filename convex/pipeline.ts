import { v } from "convex/values";
import { AgentMail } from "@agentmail/convex";
import { components, internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { chatJSON, chatText } from "./openai";
import { agencyValidator } from "./schema";

const agentmail = new AgentMail(components.agentmail);

const AGENCIES = ["ssm", "lhdn", "kwsp", "socso"] as const;

type Extraction = {
  isRegulatorNotice: boolean;
  agency: (typeof AGENCIES)[number] | "other" | null;
  deadline: string | null; // YYYY-MM-DD
  requiredAction: string | null;
  summary: string;
  language: "en" | "ms" | "zh" | "other" | null;
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  ms: "Bahasa Malaysia",
  zh: "Mandarin Chinese",
  other: "English",
};

function senderDomain(from: string): string {
  const match = from.match(/@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/);
  return match ? match[1].toLowerCase() : "unknown";
}

// --- persistence steps ---

export const createNoticeStub = internalMutation({
  args: {
    threadId: v.string(),
    inboundMessageId: v.string(),
    subject: v.string(),
    senderDomain: v.string(),
    businessId: v.optional(v.id("businesses")),
  },
  returns: v.id("notices"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("notices", {
      businessId: args.businessId,
      threadId: args.threadId,
      inboundMessageId: args.inboundMessageId,
      subject: args.subject,
      senderDomain: args.senderDomain,
      receivedAt: Date.now(),
      status: "parsing",
    });
  },
});

export const applyExtraction = internalMutation({
  args: {
    noticeId: v.id("notices"),
    agency: v.optional(agencyValidator),
    deadline: v.optional(v.number()),
    requiredAction: v.optional(v.string()),
    summary: v.string(),
    language: v.optional(v.string()),
    status: v.union(
      v.literal("parsed"),
      v.literal("needs_review"),
      v.literal("failed"),
    ),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { noticeId, error, ...fields } = args;
    await ctx.db.patch(noticeId, {
      ...fields,
      ...(error !== undefined ? { error } : {}),
    });
    return null;
  },
});

export const markReplied = internalMutation({
  args: {
    noticeId: v.id("notices"),
    replyText: v.string(),
    outboundId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { noticeId, replyText, outboundId }) => {
    await ctx.db.patch(noticeId, {
      status: "replied",
      replyText,
    });
    return null;
  },
});

export const sendReply = internalMutation({
  args: {
    inboxId: v.string(),
    parentMessageId: v.string(),
    text: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, { inboxId, parentMessageId, text }) => {
    const outboundId = await agentmail.replyToMessage(ctx, inboxId, parentMessageId, {
      text,
      labels: ["compliance-reply"],
    });
    return outboundId as string;
  },
});

// --- the agent: extract → classify → draft → reply ---

export const processInbound = internalAction({
  args: {
    inboxId: v.string(),
    messageId: v.string(),
    threadId: v.string(),
    subject: v.string(),
    from: v.string(),
    text: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const businessId = await ctx.runQuery(
      internal.businesses.findByContactEmail,
      { email: args.from },
    );

    const noticeId = await ctx.runMutation(internal.pipeline.createNoticeStub, {
      threadId: args.threadId,
      inboundMessageId: args.messageId,
      subject: args.subject,
      senderDomain: senderDomain(args.from),
      businessId: businessId ?? undefined,
    });

    try {
      const extraction = await chatJSON<Extraction>(
        `You are a compliance assistant for Malaysian SMEs. Given a forwarded regulator notice email, extract structured data as JSON with exactly these keys:
- "isRegulatorNotice": boolean — true if the underlying message is an official notice/circular/summons from a Malaysian regulator or authority (SSM, LHDN/IRBM, KWSP/EPF, SOCSO/PERKESO, or similar).
- "agency": one of "ssm", "lhdn", "kwsp", "socso", "other", or null.
- "deadline": the compliance deadline as "YYYY-MM-DD", or null.
- "requiredAction": the concrete thing the business must do, in one sentence, or null.
- "summary": what this notice is about in at most two plain-language sentences.
- "language": the language the notice is written in — "en" (English), "ms" (Bahasa Malaysia), "zh" (Mandarin Chinese), or "other".
Forwarded mail has "Fwd:" prefixes, quote chains, and signatures — find the underlying notice. Respond with JSON only.`,
        `Subject: ${args.subject}\n\nBody:\n${args.text.slice(0, 12000)}`,
      );

      const deadline = extraction.deadline
        ? Date.parse(`${extraction.deadline}T00:00:00Z`)
        : undefined;
      const agency = extraction.agency ?? undefined;
      const status =
        extraction.isRegulatorNotice && (extraction.deadline || extraction.requiredAction)
          ? "parsed"
          : "needs_review";

      await ctx.runMutation(internal.pipeline.applyExtraction, {
        noticeId,
        agency,
        deadline: Number.isNaN(deadline) ? undefined : deadline,
        requiredAction: extraction.requiredAction ?? undefined,
        summary: extraction.summary,
        language: extraction.language ?? undefined,
        status,
      });
    } catch (e) {
      await ctx.runMutation(internal.pipeline.applyExtraction, {
        noticeId,
        summary: "Automatic parsing failed.",
        status: "failed",
        error: e instanceof Error ? e.message.slice(0, 500) : "unknown error",
      });
      return null;
    }

    if (!businessId) return null; // unmatched sender — human reviews, no auto-reply

    const notice = await ctx.runQuery(internal.pipeline.getNotice, { noticeId });
    if (!notice || notice.status !== "parsed") return null;

    const replyLanguage =
      LANGUAGE_NAMES[notice.language ?? "en"] ?? "English";
    const replyText = await chatText(
      `You are MailHere, a compliance inbox for Malaysian SMEs. Write a plain-language email reply to the business owner about this regulator notice. Write the entire reply in ${replyLanguage}. Cover: what the notice is, the deadline (write the date clearly, e.g. "15 October 2026"), the exact action they must take, and one short line saying this is automated guidance, not legal advice. Under 150 words. No greeting sign-off beyond "— MailHere".`,
      `Notice subject: ${notice.subject}\nAgency: ${notice.agency ?? "unknown"}\nDeadline: ${notice.deadline ? new Date(notice.deadline).toISOString().slice(0, 10) : "none detected"}\nRequired action: ${notice.requiredAction ?? "unknown"}\nSummary: ${notice.summary ?? ""}`,
    );

    const outboundId = await ctx.runMutation(internal.pipeline.sendReply, {
      inboxId: args.inboxId,
      parentMessageId: args.messageId,
      text: replyText,
    });

    await ctx.runMutation(internal.pipeline.markReplied, {
      noticeId,
      replyText,
      outboundId,
    });
    return null;
  },
});

export const getNotice = internalQuery({
  args: { noticeId: v.id("notices") },
  returns: v.any(),
  handler: async (ctx, { noticeId }) => {
    return await ctx.db.get(noticeId);
  },
});
