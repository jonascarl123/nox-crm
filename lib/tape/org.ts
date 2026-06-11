import { relationTitle, type TapeRecord } from "./record";

export type OrgFields = {
  dealerName: string | null;
  officeName: string | null;
  division: string | null;
  /** Enerflo-style sales region (Apollo, Panel Pushers, etc.) — not in Tape customer data. */
  region: string | null;
  /** Enerflo-style sales team (Dauntless, Solar X, etc.) — not in Tape customer data. */
  team: string | null;
  state: string | null;
  market: string | null;
};

/** Strip trailing "(Division)" from rep titles like "Xander Davis (Drivin)". */
export function parseRepName(title: string | null): string | null {
  if (!title) return null;
  const cleaned = title.replace(/\s*\([^)]+\)\s*$/, "").trim();
  return cleaned || null;
}

/** Extract division from rep title parens, e.g. "(Drivin)" → "Drivin". */
export function parseRepDivision(title: string | null): string | null {
  if (!title) return null;
  const match = title.match(/\(([^)]+)\)\s*$/);
  return match?.[1]?.trim() || null;
}

/** Parse office titles like "OWE [AZ, Phoenix]" into state and market city. */
export function parseOfficeTitle(title: string | null): {
  officeName: string | null;
  state: string | null;
  market: string | null;
} {
  if (!title) {
    return { officeName: null, state: null, market: null };
  }

  const bracketMatch = title.match(/^(.+?)\s*\[([^,]+),\s*(.+)\]\s*$/);
  if (bracketMatch) {
    return {
      officeName: title.trim(),
      state: bracketMatch[2].trim(),
      market: bracketMatch[3].trim(),
    };
  }

  return { officeName: title.trim(), state: null, market: null };
}

export function extractOrgFromRecord(record: TapeRecord): OrgFields {
  const dealerName = relationTitle(record, "dealer");
  const officeTitle = relationTitle(record, "office");
  const closerTitle = relationTitle(record, "primary_sales_rep");
  const parsedOffice = parseOfficeTitle(officeTitle);

  const division =
    dealerName?.trim() ||
    parseRepDivision(closerTitle) ||
    parseRepDivision(relationTitle(record, "setter"));

  return {
    dealerName: dealerName?.trim() || null,
    officeName: parsedOffice.officeName,
    division: division ? titleCaseDivision(division) : null,
    region: null,
    team: null,
    state: parsedOffice.state,
    market: parsedOffice.market,
  };
}

function titleCaseDivision(value: string): string {
  const lower = value.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function cleanRepTitle(title: string | null): string | null {
  return parseRepName(title);
}
