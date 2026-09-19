import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import { internalAction, internalQuery } from "./_generated/server";

const REMINDER_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export const upcomingNotices = internalQuery({
  args: { cutoff: v.number() },
  returns: v.array(v.any()),
  handler: async (ctx, { cutoff }) => {
    const now = Date.now();
    const docs = await ctx.db
      .query("notices")
      .withIndex("by_deadline", (q) =>
        q.gt("deadline", now).lte("deadline", cutoff),
      )
      .take(200);
    return docs.filter((d) => d.businessId);
  },
});

export const alreadyReminded = internalQuery({
  args: {
    businessId: v.id("businesses"),
    noticeId: v.id("notices"),
  },
  returns: v.boolean(),
  handler: async (ctx, { businessId, noticeId }) => {
    const doc = await ctx.db
      .query("notifications")
      .withIndex("by_business_notice", (q) =>
        q.eq("businessId", businessId).eq("noticeId", noticeId),
      )
      .unique();
    return doc !== null;
  },
});

// Daily cron: email businesses about notices due within 7 days.
export const dailyDeadlineCheck = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const inboxId = await ctx.runQuery(internal.settings.getSetting, {
      key: "agentmail_inbox_id",
    });
    if (!inboxId) return null;

    const cutoff = Date.now() + REMINDER_WINDOW_MS;
    const notices = await ctx.runQuery(internal.reminders.upcomingNotices, {
      cutoff,
    });

    for (const n of notices as {
      _id: string;
      businessId: string;
      subject: string;
      deadline: number;
      requiredAction?: string;
    }[]) {
      const already = await ctx.runQuery(internal.reminders.alreadyReminded, {
        businessId: n.businessId as never,
        noticeId: n._id as never,
      });
      if (already) continue;

      const business = await ctx.runQuery(internal.businesses.get, {
        businessId: n.businessId as never,
      });
      if (!business) continue;

      const days = Math.ceil((n.deadline - Date.now()) / 86_400_000);
      const outboundId = await ctx.runMutation(
        internal.crawler.sendDigest,
        {
          inboxId,
          to: business.contactEmail,
          subject: `Reminder: ${n.subject} — due in ${days} day${days === 1 ? "" : "s"}`,
          text:
            `Hi ${business.name},\n\nA compliance deadline is approaching.\n\n` +
            `Notice: ${n.subject}\n` +
            `Deadline: ${new Date(n.deadline).toISOString().slice(0, 10)} (${days} day${days === 1 ? "" : "s"})\n` +
            (n.requiredAction ? `Action needed: ${n.requiredAction}\n` : "") +
            `\n— MailHere`,
        },
      );
      await ctx.runMutation(internal.crawler.recordNotification, {
        businessId: n.businessId as never,
        kind: "deadline_reminder",
        noticeId: n._id as never,
        outboundId,
        status: "queued",
      });
    }
    return null;
  },
});
