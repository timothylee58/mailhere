export {
  AGENCY_REGISTRY,
  AGENCY_LABELS,
  AGENCY_COUNTRY,
  COUNTRIES,
  COUNTRY_LABELS,
  agenciesForCountry,
  type Country,
} from "@/convex/agencyRegistry";

export type Agency = string;

export function formatDeadline(ts?: number): string {
  if (!ts) return "—";
  // No fixed locale — renders in the viewer's own browser locale.
  return new Date(ts).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function daysUntil(ts?: number): number | null {
  if (!ts) return null;
  return Math.ceil((ts - Date.now()) / 86_400_000);
}
