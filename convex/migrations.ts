import { Migrations } from "@convex-dev/migrations";
import { components, internal } from "./_generated/api";
import schema from "./schema";

export const migrations = new Migrations(components.migrations, { schema });

// One-time backfill for the MY-only -> multi-country schema change
// (2026-09-22). See convex/agencyRegistry.ts for the new codes.
const OLD_TO_NEW_AGENCY: Record<string, string> = {
  ssm: "my_ssm",
  lhdn: "my_lhdn",
  kwsp: "my_kwsp",
  socso: "my_socso",
  other: "other",
};

function remapAgency(code: string): string {
  return OLD_TO_NEW_AGENCY[code] ?? code;
}

export const backfillBusinesses = migrations.define({
  table: "businesses",
  migrateOne: async (_ctx, doc: any) => {
    const patch: Record<string, unknown> = {};
    if (doc.country === undefined) patch.country = "MY";
    if (doc.registrationNo === undefined && doc.ssmRegistrationNo !== undefined) {
      patch.registrationNo = doc.ssmRegistrationNo;
    }
    if (doc.ssmRegistrationNo !== undefined) patch.ssmRegistrationNo = undefined;
    if (Array.isArray(doc.categories)) {
      const remapped = doc.categories.map(remapAgency);
      if (JSON.stringify(remapped) !== JSON.stringify(doc.categories)) {
        patch.categories = remapped;
      }
    }
    return Object.keys(patch).length > 0 ? patch : undefined;
  },
});

export const backfillNotices = migrations.define({
  table: "notices",
  migrateOne: async (_ctx, doc: any) => {
    if (doc.agency === undefined) return undefined;
    const remapped = remapAgency(doc.agency);
    return remapped !== doc.agency ? { agency: remapped } : undefined;
  },
});

export const backfillCirculars = migrations.define({
  table: "circulars",
  migrateOne: async (_ctx, doc: any) => {
    const patch: Record<string, unknown> = {};
    const remappedAgency = remapAgency(doc.agency);
    if (remappedAgency !== doc.agency) patch.agency = remappedAgency;
    if (Array.isArray(doc.categories)) {
      const remapped = doc.categories.map(remapAgency);
      if (JSON.stringify(remapped) !== JSON.stringify(doc.categories)) {
        patch.categories = remapped;
      }
    }
    return Object.keys(patch).length > 0 ? patch : undefined;
  },
});

export const backfillRegulatorSources = migrations.define({
  table: "regulatorSources",
  migrateOne: async (_ctx, doc: any) => {
    const patch: Record<string, unknown> = {};
    const remappedAgency = remapAgency(doc.agency);
    if (remappedAgency !== doc.agency) patch.agency = remappedAgency;
    if (OLD_TO_NEW_AGENCY[doc.key] !== undefined) {
      patch.key = OLD_TO_NEW_AGENCY[doc.key];
    }
    return Object.keys(patch).length > 0 ? patch : undefined;
  },
});

export const runAll = migrations.runner([
  internal.migrations.backfillBusinesses,
  internal.migrations.backfillNotices,
  internal.migrations.backfillCirculars,
  internal.migrations.backfillRegulatorSources,
]);
