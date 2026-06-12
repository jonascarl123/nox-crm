/** Canonical deal workflow — single source of truth for the app and DB. */

export type DealStepKey =
  | "consumption"
  | "design"
  | "proposal"
  | "financing"
  | "contracting"
  | "submission";

export type DealStepStatus = "pending" | "active" | "complete";

export const DEAL_STEP_ORDER: DealStepKey[] = [
  "consumption",
  "design",
  "proposal",
  "financing",
  "contracting",
  "submission",
];

export const DEAL_STEP_LABELS: Record<DealStepKey, string> = {
  consumption: "Consumption",
  design: "Designs",
  proposal: "Proposal",
  financing: "Financing",
  contracting: "Contracting",
  submission: "Project Submission",
};

/** Canonical install milestone tracker — includes Deal Signed as step 1. */

export type InstallMilestoneKey =
  | "deal_signed"
  | "site_survey_scheduled"
  | "site_survey_complete"
  | "design"
  | "permit"
  | "install"
  | "inspection"
  | "pto_approved";

export type InstallMilestoneStatus = "PENDING" | "IN_PROGRESS" | "DONE";

export type InstallMilestoneDefinition = {
  key: InstallMilestoneKey;
  label: string;
  sortOrder: number;
};

export const INSTALL_MILESTONE_ORDER: InstallMilestoneDefinition[] = [
  { key: "deal_signed", label: "Deal Signed", sortOrder: 1 },
  { key: "site_survey_scheduled", label: "Site Survey Scheduled", sortOrder: 2 },
  { key: "site_survey_complete", label: "Site Survey Complete", sortOrder: 3 },
  { key: "design", label: "Design", sortOrder: 4 },
  { key: "permit", label: "Permit", sortOrder: 5 },
  { key: "install", label: "Install", sortOrder: 6 },
  { key: "inspection", label: "Inspection", sortOrder: 7 },
  { key: "pto_approved", label: "PTO Approved", sortOrder: 8 },
];

export const INSTALL_MILESTONE_LABELS: Record<InstallMilestoneKey, string> =
  Object.fromEntries(
    INSTALL_MILESTONE_ORDER.map((m) => [m.key, m.label])
  ) as Record<InstallMilestoneKey, string>;

export function defaultDealSteps(): Record<DealStepKey, DealStepStatus> {
  const steps = {} as Record<DealStepKey, DealStepStatus>;
  for (let i = 0; i < DEAL_STEP_ORDER.length; i++) {
    const key = DEAL_STEP_ORDER[i];
    steps[key] = i === 0 ? "active" : "pending";
  }
  return steps;
}

export function activeDealStepKey(
  steps: Record<DealStepKey, DealStepStatus>
): DealStepKey {
  return (
    DEAL_STEP_ORDER.find((s) => steps[s] === "active") ?? DEAL_STEP_ORDER[0]
  );
}
