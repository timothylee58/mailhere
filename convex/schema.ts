import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export const agencyValidator = v.union(
  v.literal("ssm"),
  v.literal("lhdn"),
  v.literal("kwsp"),
  v.literal("socso"),
  v.literal("other"),
);

export const noticeStatusValidator = v.union(
  v.literal("received"),
  v.literal("parsing"),
  v.literal("parsed"),
  v.literal("replied"),
  v.literal("needs_review"),
  v.literal("failed"),
);

export default defineSchema({
  ...authTables,

  businesses: defineTable({
    userId: v.id("users"),
    name: v.string(),
    ssmRegistrationNo: v.optional(v.string()),
    contactEmail: v.string(),
    categories: v.array(agencyValidator),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_contactEmail", ["contactEmail"]),

  notices: defineTable({
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
  })
    .index("by_business", ["businessId"])
    .index("by_business_status", ["businessId", "status"])
    .index("by_business_deadline", ["businessId", "deadline"])
    .index("by_deadline", ["deadline"])
    .index("by_threadId", ["threadId"]),

  circulars: defineTable({
    url: v.string(),
    title: v.string(),
    agency: agencyValidator,
    sourceKey: v.string(),
    publishedAt: v.optional(v.number()),
    categories: v.array(agencyValidator),
    summary: v.string(),
    deadline: v.optional(v.number()),
    detectedAt: v.number(),
  })
    .index("by_url", ["url"])
    .index("by_detectedAt", ["detectedAt"])
    .index("by_agency", ["agency"]),

  notifications: defineTable({
    businessId: v.id("businesses"),
    kind: v.union(v.literal("circular"), v.literal("deadline_reminder")),
    circularId: v.optional(v.id("circulars")),
    noticeId: v.optional(v.id("notices")),
    outboundId: v.optional(v.string()),
    sentAt: v.number(),
    status: v.union(v.literal("queued"), v.literal("sent"), v.literal("failed")),
  })
    .index("by_business_circular", ["businessId", "circularId"])
    .index("by_business_notice", ["businessId", "noticeId"]),

  regulatorSources: defineTable({
    key: v.string(),
    name: v.string(),
    agency: agencyValidator,
    url: v.string(),
    enabled: v.boolean(),
    lastRunAt: v.optional(v.number()),
    lastItemCount: v.optional(v.number()),
  }).index("by_key", ["key"]),

  appSettings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),
});
