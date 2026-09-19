import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { agencyValidator, noticeStatusValidator } from "./schema";

const noticeDoc = v.object({
  _id: v.id("notices"),
  _creationTime: v.number(),
  businessId: v.optional(v.id("businesses")),
  threadId: v.string(),
  inboundMessageId: v.string(),
  subject: v.string(),
  senderDomain: v.string(),
  receivedAt: v.number(),
  status: noticeStatusValidator,
  agency: v.optional(agencyValidator),
  deadline: v.optional(v.number()),
  requiredAction: v.optional(v.string()),
  summary: v.optional(v.string()),
  replyText: v.optional(v.string()),
  language: v.optional(v.string()),
  resolvedAt: v.optional(v.number()),
  error: v.optional(v.string()),
});

async function myBusiness(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  return await ctx.db
    .query("businesses")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();
}

export const listMine = query({
  args: {},
  returns: v.array(noticeDoc),
  handler: async (ctx) => {
    const business = await myBusiness(ctx);
    if (!business) return [];
    return await ctx.db
      .query("notices")
      .withIndex("by_business", (q) => q.eq("businessId", business._id))
      .order("desc")
      .take(100);
  },
});

export const upcoming = query({
  args: {},
  returns: v.array(noticeDoc),
  handler: async (ctx) => {
    const business = await myBusiness(ctx);
    if (!business) return [];
    return await ctx.db
      .query("notices")
      .withIndex("by_business_deadline", (q) =>
        q.eq("businessId", business._id).gt("deadline", Date.now()),
      )
      .order("asc")
      .take(10);
  },
});

// Toggle a notice's done state — only for the owner's own notices.
export const setResolved = mutation({
  args: { noticeId: v.id("notices"), resolved: v.boolean() },
  returns: v.null(),
  handler: async (ctx, { noticeId, resolved }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    const business = await ctx.db
      .query("businesses")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    const notice = await ctx.db.get(noticeId);
    if (!notice || !business || notice.businessId !== business._id) {
      throw new ConvexError("Notice not found");
    }
    await ctx.db.patch(noticeId, {
      resolvedAt: resolved ? Date.now() : undefined,
    });
    return null;
  },
});
