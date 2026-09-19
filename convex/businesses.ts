import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { agencyValidator } from "./schema";

const businessDoc = v.object({
  _id: v.id("businesses"),
  _creationTime: v.number(),
  userId: v.id("users"),
  name: v.string(),
  ssmRegistrationNo: v.optional(v.string()),
  contactEmail: v.string(),
  categories: v.array(agencyValidator),
  createdAt: v.number(),
});

export const mine = query({
  args: {},
  returns: v.union(businessDoc, v.null()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("businesses")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const upsertMine = mutation({
  args: {
    name: v.string(),
    ssmRegistrationNo: v.optional(v.string()),
    contactEmail: v.string(),
    categories: v.array(agencyValidator),
  },
  returns: v.id("businesses"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("businesses")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        ssmRegistrationNo: args.ssmRegistrationNo,
        contactEmail: args.contactEmail,
        categories: args.categories,
      });
      return existing._id;
    }

    return await ctx.db.insert("businesses", {
      userId,
      name: args.name,
      ssmRegistrationNo: args.ssmRegistrationNo,
      contactEmail: args.contactEmail,
      categories: args.categories,
      createdAt: Date.now(),
    });
  },
});

// --- internal helpers used by the pipeline ---

export const findByContactEmail = internalQuery({
  args: { email: v.string() },
  returns: v.union(v.id("businesses"), v.null()),
  handler: async (ctx, { email }) => {
    const normalized = email.trim().toLowerCase();
    const doc = await ctx.db
      .query("businesses")
      .withIndex("by_contactEmail", (q) => q.eq("contactEmail", normalized))
      .unique();
    return doc?._id ?? null;
  },
});

export const listAll = internalQuery({
  args: {},
  returns: v.array(businessDoc),
  handler: async (ctx) => {
    // Bounded read: MSME user base for MVP scale.
    return await ctx.db.query("businesses").order("asc").take(500);
  },
});

export const mineInternal = internalQuery({
  args: { userId: v.id("users") },
  returns: v.union(businessDoc, v.null()),
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("businesses")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const get = internalQuery({
  args: { businessId: v.id("businesses") },
  returns: v.union(businessDoc, v.null()),
  handler: async (ctx, { businessId }) => {
    return await ctx.db.get(businessId);
  },
});
