import { v } from "convex/values";
import { AgentMail } from "@agentmail/convex";
import { FirecrawlClient } from "@firecrawl/firecrawl-convex";
import { getAuthUserId } from "@convex-dev/auth/server";
import { components, internal } from "./_generated/api";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { chatJSON } from "./openai";
import { agencyValidator } from "./schema";

const firecrawl = new FirecrawlClient(components.firecrawl);
const agentmail = new AgentMail(components.agentmail);

const SOURCES: {
  key: string;
  name: string;
  agency: "ssm" | "lhdn" | "kwsp" | "socso";
  url: string;
}[] = [
  {
    key: "ssm",
    name: "SSM — Announcements",
    agency: "ssm",
    url: "https://www.ssm.com.my/Pages/Announcement.aspx",
  },
  {
    key: "lhdn",
    name: "LHDN — Media Releases",
    agency: "lhdn",
    url: "https://www.hasil.gov.my/en/media/media-release/",
  },
  {
    key: "kwsp",
    name: "KWSP — News",
    agency: "kwsp",
    url: "https://www.kwsp.gov.my/en/w/news",
  },
];

// --- seeds + bookkeeping ---

export const seedSources = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    for (const s of SOURCES) {
      const existing = await ctx.db
        .query("regulatorSources")
        .withIndex("by_key", (q) => q.eq("key", s.key))
        .unique();
      if (!existing) {
        await ctx.db.insert("regulatorSources", { ...s, enabled: true });
      }
    }
    return null;
  },
});

export const listSources = internalQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db.query("regulatorSources").order("asc").take(20);
  },
});

export const markSourceRun = internalMutation({
  args: { key: v.string(), itemCount: v.number() },
  returns: v.null(),
  handler: async (ctx, { key, itemCount }) => {
    const doc = await ctx.db
      .query("regulatorSources")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    if (doc) {
      await ctx.db.patch(doc._id, {
        lastRunAt: Date.now(),
        lastItemCount: itemCount,
      });
    }
    return null;
  },
});

export const circularByUrl = internalQuery({
  args: { url: v.string() },
  returns: v.union(v.id("circulars"), v.null()),
  handler: async (ctx, { url }) => {
    const doc = await ctx.db
      .query("circulars")
      .withIndex("by_url", (q) => q.eq("url", url))
      .unique();
    return doc?._id ?? null;
  },
});

export const insertCircular = internalMutation({
  args: {
    url: v.string(),
    title: v.string(),
    agency: agencyValidator,
    sourceKey: v.string(),
    publishedAt: v.optional(v.number()),
    categories: v.array(agencyValidator),
    summary: v.string(),
    deadline: v.optional(v.number()),
  },
  returns: v.id("circulars"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("circulars", {
      ...args,
      detectedAt: Date.now(),
    });
  },
});

export const alreadyNotified = internalQuery({
  args: {
    businessId: v.id("businesses"),
    circularId: v.id("circulars"),
  },
  returns: v.boolean(),
  handler: async (ctx, { businessId, circularId }) => {
    const doc = await ctx.db
      .query("notifications")
      .withIndex("by_business_circular", (q) =>
        q.eq("businessId", businessId).eq("circularId", circularId),
      )
      .unique();
    return doc !== null;
  },
});

export const recordNotification = internalMutation({
  args: {
    businessId: v.id("businesses"),
    kind: v.union(v.literal("circular"), v.literal("deadline_reminder")),
    circularId: v.optional(v.id("circulars")),
    noticeId: v.optional(v.id("notices")),
    outboundId: v.optional(v.string()),
    status: v.union(v.literal("queued"), v.literal("sent"), v.literal("failed")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("notifications", {
      ...args,
      sentAt: Date.now(),
    });
    return null;
  },
});

export const sendDigest = internalMutation({
  args: {
    inboxId: v.string(),
    to: v.string(),
    subject: v.string(),
    text: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, { inboxId, to, subject, text }) => {
    const outboundId = await agentmail.sendMessage(ctx, inboxId, {
      to,
      subject,
      text,
      labels: ["proactive-digest"],
    });
    return outboundId as string;
  },
});

// --- crawl + classify + notify ---

type ListedItem = { title: string; url: string; publishedAt: string | null };
type Classification = {
  agency: "ssm" | "lhdn" | "kwsp" | "socso" | "other";
  categories: ("ssm" | "lhdn" | "kwsp" | "socso")[];
  deadline: string | null;
  summary: string;
  affectsSMEs: boolean;
};

export const runSource = internalAction({
  args: { sourceKey: v.string(), inboxId: v.string() },
  returns: v.null(),
  handler: async (ctx, { sourceKey, inboxId }) => {
    const sources = await ctx.runQuery(internal.crawler.listSources, {});
    const source = sources.find(
      (s: { key: string }) => s.key === sourceKey,
    ) as
      | { key: string; name: string; agency: string; url: string; enabled: boolean }
      | undefined;
    if (!source || !source.enabled) return null;

    // 1. Scrape the listing page.
    const listing = (await firecrawl.scrape(ctx, source.url, {
      formats: ["markdown", "links"],
      onlyMainContent: true,
      maxAge: 43_200_000, // 12h cache
    })) as { markdown?: string; links?: string[] };

    // 2. OpenAI extracts the announcement items from the page.
    const extracted = await chatJSON<{ items: ListedItem[] }>(
      `Extract the announcement/circular/news items from this Malaysian regulator webpage. Return JSON: {"items":[{"title":string,"url":string,"publishedAt":"YYYY-MM-DD"|null}]}. At most 8 most recent items. Absolute URLs only. JSON only.`,
      `Source: ${source.name}\n\nMarkdown:\n${(listing.markdown ?? "").slice(0, 12000)}\n\nLinks:\n${(listing.links ?? []).slice(0, 60).join("\n")}`,
    );

    let newCount = 0;
    for (const item of (extracted.items ?? []).slice(0, 8)) {
      if (!item.url || !item.title) continue;
      const existing = await ctx.runQuery(internal.crawler.circularByUrl, {
        url: item.url,
      });
      if (existing) continue;

      // 3. Scrape the detail page for this circular.
      let detail = "";
      try {
        const page = (await firecrawl.scrape(ctx, item.url, {
          formats: ["markdown"],
          onlyMainContent: true,
          maxAge: 86_400_000,
        })) as { markdown?: string };
        detail = page.markdown ?? "";
      } catch {
        detail = "";
      }

      // 4. Classify for relevance.
      const cls = await chatJSON<Classification>(
        `Classify this Malaysian regulator publication for SME relevance. JSON keys:
- "agency": "ssm"|"lhdn"|"kwsp"|"socso"|"other"
- "categories": array subset of ["ssm","lhdn","kwsp","socso"] — which regulator areas it affects
- "deadline": "YYYY-MM-DD"|null — compliance deadline if any
- "summary": at most two plain-language sentences
- "affectsSMEs": boolean — true if a Malaysian SME should act or be aware
JSON only.`,
        `Title: ${item.title}\nURL: ${item.url}\nPublished: ${item.publishedAt ?? "unknown"}\n\nContent:\n${detail.slice(0, 10000)}`,
      );
      if (!cls.affectsSMEs) continue;

      const deadline = cls.deadline
        ? Date.parse(`${cls.deadline}T00:00:00Z`)
        : undefined;

      const circularId = await ctx.runMutation(
        internal.crawler.insertCircular,
        {
          url: item.url,
          title: item.title,
          agency: cls.agency,
          sourceKey,
          publishedAt: item.publishedAt
            ? Date.parse(`${item.publishedAt}T00:00:00Z`)
            : undefined,
          categories: cls.categories,
          summary: cls.summary,
          deadline: Number.isNaN(deadline) ? undefined : deadline,
        },
      );
      newCount++;

      // 5. Proactively email matching businesses.
      const businesses = await ctx.runQuery(internal.businesses.listAll, {});
      for (const b of businesses as { _id: string; categories: string[]; contactEmail: string; name: string }[]) {
        const match = b.categories.some((c) => cls.categories.includes(c as never));
        if (!match) continue;
        const dup = await ctx.runQuery(internal.crawler.alreadyNotified, {
          businessId: b._id as never,
          circularId,
        });
        if (dup) continue;

        const outboundId = await ctx.runMutation(
          internal.crawler.sendDigest,
          {
            inboxId,
            to: b.contactEmail,
            subject: `[${cls.agency.toUpperCase()}] ${item.title}`,
            text:
              `Hi ${b.name},\n\nA new ${cls.agency.toUpperCase()} publication may affect your business.\n\n` +
              `${item.title}\n${item.url}\n\n` +
              `Summary: ${cls.summary}\n` +
              (cls.deadline ? `Deadline: ${cls.deadline}\n` : "") +
              `\nYou are receiving this because your registered categories include ${b.categories.join(", ")}.\n— MailHere`,
          },
        );
        await ctx.runMutation(internal.crawler.recordNotification, {
          businessId: b._id as never,
          kind: "circular",
          circularId,
          outboundId,
          status: "queued",
        });
      }
    }

    await ctx.runMutation(internal.crawler.markSourceRun, {
      key: sourceKey,
      itemCount: newCount,
    });
    return null;
  },
});

export const kickoffAll = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await ctx.runMutation(internal.crawler.seedSources, {});
    const inboxId = await ctx.runQuery(internal.settings.getSetting, {
      key: "agentmail_inbox_id",
    });
    if (!inboxId) return null; // inbox not provisioned yet
    const sources = await ctx.runQuery(internal.crawler.listSources, {});
    let i = 0;
    for (const s of sources as { key: string; enabled: boolean }[]) {
      if (!s.enabled) continue;
      await ctx.scheduler.runAfter(
        i * 5000,
        internal.crawler.runSource,
        { sourceKey: s.key, inboxId },
      );
      i++;
    }
    return null;
  },
});

const circularDoc = v.object({
  _id: v.id("circulars"),
  _creationTime: v.number(),
  url: v.string(),
  title: v.string(),
  agency: agencyValidator,
  sourceKey: v.string(),
  publishedAt: v.optional(v.number()),
  categories: v.array(agencyValidator),
  summary: v.string(),
  deadline: v.optional(v.number()),
  detectedAt: v.number(),
});

// Live feed of crawled circulars matching the caller's business categories.
export const circularsForMe = query({
  args: {},
  returns: v.array(circularDoc),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const business = await ctx.db
      .query("businesses")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!business) return [];
    const mine = new Set(business.categories);
    const recent = await ctx.db
      .query("circulars")
      .withIndex("by_detectedAt")
      .order("desc")
      .take(100);
    return recent
      .filter(
        (c) =>
          c.agency !== "other" &&
          (mine.has(c.agency) || c.categories.some((cat) => mine.has(cat))),
      )
      .slice(0, 50);
  },
});

// Manual trigger from the dashboard.
export const crawlNow = action({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.scheduler.runAfter(0, internal.crawler.kickoffAll, {});
    return null;
  },
});
