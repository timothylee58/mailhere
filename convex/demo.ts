import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

// Demo helper: pushes a synthetic forwarded notice through the real pipeline
// so the extraction → classify → draft → reply flow can be shown end-to-end.
export const simulateInbound = action({
  args: {
    subject: v.string(),
    text: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const inboxId = await ctx.runQuery(internal.settings.getSetting, {
      key: "agentmail_inbox_id",
    });
    if (!inboxId) throw new Error("Inbox not provisioned yet");

    const business = await ctx.runQuery(internal.businesses.mineInternal, {
      userId,
    });
    const from = business?.contactEmail ?? "demo@example.com";

    await ctx.scheduler.runAfter(0, internal.pipeline.processInbound, {
      inboxId,
      messageId: `demo-${crypto.randomUUID()}`,
      threadId: `demo-${crypto.randomUUID()}`,
      subject: args.subject,
      from,
      text: args.text,
    });
    return null;
  },
});
