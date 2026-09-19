import { v } from "convex/values";
import { AgentMail } from "@agentmail/convex";
import { getAuthUserId } from "@convex-dev/auth/server";
import { components, internal } from "./_generated/api";
import { internalMutation, query } from "./_generated/server";

const agentmail: AgentMail = new AgentMail(components.agentmail, {
  onMessageReceived: internal.email.onMessageReceived,
});

// Fired (via component workpool) for every inbound message. Keep it light —
// schedule the real work in an action so a slow LLM call can't block ingest.
export const onMessageReceived = internalMutation({
  args: { message: v.any(), thread: v.any(), eventId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const message = args.message as {
      inbox_id?: string;
      message_id?: string;
      thread_id?: string;
      subject?: string;
      from?: string;
      text?: string;
      extracted_text?: string;
    };
    await ctx.scheduler.runAfter(0, internal.pipeline.processInbound, {
      inboxId: message.inbox_id ?? "",
      messageId: message.message_id ?? "",
      threadId: message.thread_id ?? "",
      subject: message.subject ?? "(no subject)",
      from: message.from ?? "",
      text: message.extracted_text ?? message.text ?? "",
    });
    return null;
  },
});

// Live inbound feed for the dashboard.
export const listInbox = query({
  args: { inboxId: v.string() },
  returns: v.any(),
  handler: async (ctx, { inboxId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.runQuery(components.agentmail.lib.listInboundMessages, {
      inboxId,
    });
  },
});

export const threadMessages = query({
  args: { threadId: v.string() },
  returns: v.any(),
  handler: async (ctx, { threadId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Authz: the thread must belong to a notice owned by this business.
    const business = await ctx.db
      .query("businesses")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!business) return [];

    const notice = await ctx.db
      .query("notices")
      .withIndex("by_threadId", (q) => q.eq("threadId", threadId))
      .unique();
    if (!notice || notice.businessId !== business._id) return [];

    return await ctx.runQuery(components.agentmail.lib.listInboundMessages, {
      threadId,
    });
  },
});

// Delivery status for an outbound message.
export const sendStatus = query({
  args: { outboundId: v.string() },
  returns: v.any(),
  handler: async (ctx, { outboundId }): Promise<unknown> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await agentmail.status(ctx, outboundId as never);
  },
});

// Where the business should forward its regulator mail.
export const inboxAddress = query({
  args: {},
  returns: v.union(v.string(), v.null()),
  handler: async (ctx) => {
    const doc = await ctx.db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", "agentmail_inbox_address"))
      .unique();
    return doc?.value ?? null;
  },
});
