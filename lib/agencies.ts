export const AGENCIES = ["ssm", "lhdn", "kwsp", "socso"] as const;
export type Agency = (typeof AGENCIES)[number] | "other";

export const AGENCY_LABELS: Record<Agency, string> = {
  ssm: "SSM",
  lhdn: "LHDN",
  kwsp: "KWSP",
  socso: "SOCSO",
  other: "Other",
};

export function formatDeadline(ts?: number): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function daysUntil(ts?: number): number | null {
  if (!ts) return null;
  return Math.ceil((ts - Date.now()) / 86_400_000);
}
