import type { TapeCustomer } from "@/lib/tape/types";
import {
  DEAL_STEP_ORDER,
  INSTALL_MILESTONE_ORDER,
  type DealStepKey,
  type DealStepStatus,
  type InstallMilestoneKey,
  type InstallMilestoneStatus,
} from "./constants";

function keywordMatch(job: string, keywords: string[]): boolean {
  return keywords.some((k) => job.includes(k));
}

/** Seed deal step statuses from Tape job / NTP fields when no CRM rows exist yet. */
export function inferDealStepsFromTape(
  jobStatus: string | null,
  ntpAppStatus: string | null
): Record<DealStepKey, DealStepStatus> {
  const job = (jobStatus ?? "").toLowerCase();
  const ntp = (ntpAppStatus ?? "").toLowerCase();

  let activeIdx = 0;
  if (job.includes("contract") || job.includes("signed")) activeIdx = 5;
  else if (job.includes("financ") || job.includes("loan")) activeIdx = 4;
  else if (job.includes("proposal") || job.includes("quote")) activeIdx = 3;
  else if (job.includes("design") || job.includes("cad")) activeIdx = 2;
  else if (job.includes("consumption") || job.includes("usage")) activeIdx = 1;
  else if (ntp.includes("approved") || ntp.includes("complete")) activeIdx = 5;

  const steps = {} as Record<DealStepKey, DealStepStatus>;
  for (let i = 0; i < DEAL_STEP_ORDER.length; i++) {
    const key = DEAL_STEP_ORDER[i];
    if (i < activeIdx) steps[key] = "complete";
    else if (i === activeIdx) steps[key] = "active";
    else steps[key] = "pending";
  }
  return steps;
}

/**
 * Returns the index (0–7) of the milestone that should be IN_PROGRESS.
 * 0 = Deal Signed, 7 = PTO Approved.
 */
function inProgressMilestoneIndex(customer: TapeCustomer): number {
  const job = (customer.jobStatus ?? "").toLowerCase();
  const ntp = (customer.ntpAppStatus ?? "").toLowerCase();

  if (ntp.includes("approved") || ntp.includes("complete")) return 7;
  if (
    customer.installCompletedDate ||
    keywordMatch(job, ["install complete", "installed"])
  ) {
    return 6;
  }
  if (keywordMatch(job, ["install", "scheduled install"])) return 5;
  if (keywordMatch(job, ["permit"])) return 4;
  if (keywordMatch(job, ["design", "cad"])) return 3;
  if (keywordMatch(job, ["survey complete", "site survey complete"])) return 2;
  if (keywordMatch(job, ["survey", "site survey"])) return 1;
  if (customer.saleDate) return 1;
  return 0;
}

/** Seed install milestone statuses from Tape fields when no CRM rows exist yet. */
export function inferInstallMilestonesFromTape(
  customer: TapeCustomer
): Record<InstallMilestoneKey, InstallMilestoneStatus> {
  const cancelled = customer.pipelineStage === "cancelled";
  const activeIdx = inProgressMilestoneIndex(customer);
  const result = {} as Record<InstallMilestoneKey, InstallMilestoneStatus>;

  for (let i = 0; i < INSTALL_MILESTONE_ORDER.length; i++) {
    const { key } = INSTALL_MILESTONE_ORDER[i];
    if (cancelled) {
      result[key] = "PENDING";
    } else if (i < activeIdx) {
      result[key] = "DONE";
    } else if (i === activeIdx) {
      result[key] = "IN_PROGRESS";
    } else {
      result[key] = "PENDING";
    }
  }

  if (customer.saleDate && !cancelled) {
    result.deal_signed = "DONE";
  }

  return result;
}

export function milestoneSubLabel(
  status: InstallMilestoneStatus,
  completedAt?: string | null
): string | undefined {
  if (status === "DONE") {
    return completedAt ? `Completed ${completedAt}` : "Completed";
  }
  if (status === "IN_PROGRESS") return "In progress";
  return undefined;
}
