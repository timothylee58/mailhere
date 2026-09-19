import { v } from "convex/values";
import { AgentMail } from "@agentmail/convex";
import { getAuthUserId } from "@convex-dev/auth/server";
import { components, internal } from "./_generated/api";
import { action, internalAction } from "./_generated/server";

const agentmail = new AgentMail(components.agentmail);

// Provision the shared MailHere AgentMail inbox once, store it in appSettings.
export const ensureInbox = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existing = await ctx.runQuery(internal.settings.getSetting, {
      key: "agentmail_inbox_id",
    });
    if (existing) return null;

    const inbox = (await agentmail.createInbox(ctx, {
      username: "mailhere",
      displayName: "MailHere",
    })) as { inbox_id?: string; email?: string; address?: string };

    const inboxId = inbox.inbox_id ?? "";
    const address = inbox.email ?? inbox.address ?? "";
    if (!inboxId) throw new Error("AgentMail did not return an inbox id");

    await ctx.runMutation(internal.settings.setSetting, {
      key: "agentmail_inbox_id",
      value: inboxId,
    });
    if (address) {
      await ctx.runMutation(internal.settings.setSetting, {
        key: "agentmail_inbox_address",
        value: address,
      });
    }
    return null;
  },
});

// Public trigger: called once from the dashboard after sign-in. Idempotent.
export const ensureSetup = action({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.runMutation(internal.crawler.seedSources, {});
    await ctx.scheduler.runAfter(0, internal.setup.ensureInbox, {});
    return null;
  },
});
