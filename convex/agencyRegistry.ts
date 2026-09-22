// Single source of truth for country + regulator-agency presets. Both the
// backend (schema validator, extraction prompts, crawler sources) and the
// frontend (registration form, labels) read from this file — see
// lib/agencies.ts for the frontend re-export.

export const COUNTRIES = ["MY", "US", "UK", "SG"] as const;
export type Country = (typeof COUNTRIES)[number];

export const COUNTRY_LABELS: Record<Country, string> = {
  MY: "Malaysia",
  US: "United States",
  UK: "United Kingdom",
  SG: "Singapore",
};

type AgencyEntry = {
  code: string;
  label: string;
  /** Announcements/news page the crawler can scrape for this agency, if any. */
  sourceUrl?: string;
};

export const AGENCY_REGISTRY: Record<Country, AgencyEntry[]> = {
  MY: [
    {
      code: "my_ssm",
      label: "SSM — Companies Commission",
      sourceUrl: "https://www.ssm.com.my/Pages/Announcement.aspx",
    },
    {
      code: "my_lhdn",
      label: "LHDN — Inland Revenue Board",
      sourceUrl: "https://www.hasil.gov.my/en/media/media-release/",
    },
    {
      code: "my_kwsp",
      label: "KWSP — Employees Provident Fund",
      sourceUrl: "https://www.kwsp.gov.my/en/w/news",
    },
    { code: "my_socso", label: "SOCSO — Social Security Organisation" },
  ],
  US: [
    {
      code: "us_irs",
      label: "IRS — Internal Revenue Service",
      sourceUrl: "https://www.irs.gov/newsroom",
    },
    {
      code: "us_sec",
      label: "SEC — Securities and Exchange Commission",
      sourceUrl: "https://www.sec.gov/news/pressreleases",
    },
  ],
  UK: [
    {
      code: "uk_hmrc",
      label: "HMRC — Tax authority",
      sourceUrl: "https://www.gov.uk/government/organisations/hm-revenue-customs",
    },
    {
      code: "uk_companieshouse",
      label: "Companies House",
      sourceUrl: "https://www.gov.uk/government/organisations/companies-house",
    },
  ],
  SG: [
    {
      code: "sg_acra",
      label: "ACRA — Accounting and Corporate Regulatory Authority",
      sourceUrl: "https://www.acra.gov.sg/announcements",
    },
    {
      code: "sg_iras",
      label: "IRAS — Inland Revenue Authority of Singapore",
      sourceUrl: "https://www.iras.gov.sg/news-events/newsroom",
    },
  ],
};

export const ALL_AGENCY_CODES: string[] = COUNTRIES.flatMap((c) =>
  AGENCY_REGISTRY[c].map((a) => a.code),
);

export const AGENCY_LABELS: Record<string, string> = {
  ...Object.fromEntries(
    COUNTRIES.flatMap((c) => AGENCY_REGISTRY[c].map((a) => [a.code, a.label])),
  ),
  other: "Other",
};

export const AGENCY_COUNTRY: Record<string, Country> = Object.fromEntries(
  COUNTRIES.flatMap((c) => AGENCY_REGISTRY[c].map((a) => [a.code, c])),
);

export function agenciesForCountry(country: Country): AgencyEntry[] {
  return AGENCY_REGISTRY[country];
}
