export type TapeDealStep =
  | "consumption"
  | "design"
  | "proposal"
  | "financing"
  | "contracting"
  | "submission";

export type TapeStepStatus = "complete" | "active" | "pending";

export const TAPE_DEAL_STEP_ORDER: TapeDealStep[] = [
  "consumption",
  "design",
  "proposal",
  "financing",
  "contracting",
  "submission",
];

export const TAPE_DEAL_STEP_LABELS: Record<TapeDealStep, string> = {
  consumption: "Consumption",
  design: "Designs",
  proposal: "Proposal",
  financing: "Financing",
  contracting: "Contracting",
  submission: "Project Submission",
};

/** Rough step inference from Tape job / NTP fields for demo navigation. */
export function inferDealSteps(
  jobStatus: string | null,
  ntpAppStatus: string | null
): Record<TapeDealStep, TapeStepStatus> {
  const job = (jobStatus ?? "").toLowerCase();
  const ntp = (ntpAppStatus ?? "").toLowerCase();

  let activeIdx = 0;
  if (job.includes("contract") || job.includes("signed")) activeIdx = 5;
  else if (job.includes("financ") || job.includes("loan")) activeIdx = 4;
  else if (job.includes("proposal") || job.includes("quote")) activeIdx = 3;
  else if (job.includes("design") || job.includes("cad")) activeIdx = 2;
  else if (job.includes("consumption") || job.includes("usage")) activeIdx = 1;
  else if (ntp.includes("approved") || ntp.includes("complete")) activeIdx = 5;

  const steps = {} as Record<TapeDealStep, TapeStepStatus>;
  for (let i = 0; i < TAPE_DEAL_STEP_ORDER.length; i++) {
    const key = TAPE_DEAL_STEP_ORDER[i];
    if (i < activeIdx) steps[key] = "complete";
    else if (i === activeIdx) steps[key] = "active";
    else steps[key] = "pending";
  }
  return steps;
}

export function activeDealStep(
  steps: Record<TapeDealStep, TapeStepStatus>
): TapeDealStep {
  return (
    TAPE_DEAL_STEP_ORDER.find((s) => steps[s] === "active") ??
    TAPE_DEAL_STEP_ORDER[0]
  );
}
