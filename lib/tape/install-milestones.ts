import type { TapeCustomer } from "./types";

export type MilestoneStatus = "DONE" | "IN_PROGRESS" | "PENDING";

export type InstallMilestone = {
  name: string;
  status: MilestoneStatus;
  sub?: string;
};

const MILESTONE_NAMES = [
  "Site Survey Scheduled",
  "Site Survey Complete",
  "Design",
  "Permit",
  "Install",
  "Inspection",
  "PTO Approved",
] as const;

function keywordIndex(job: string, keywords: string[]): boolean {
  return keywords.some((k) => job.includes(k));
}

/** Derive install milestone progress from Tape fields. */
export function deriveInstallMilestones(
  customer: TapeCustomer
): InstallMilestone[] {
  const job = (customer.jobStatus ?? "").toLowerCase();
  const ntp = (customer.ntpAppStatus ?? "").toLowerCase();
  const cancelled = customer.pipelineStage === "cancelled";

  let currentIdx = 0;
  if (customer.installCompletedDate || keywordIndex(job, ["install complete", "installed"])) {
    currentIdx = 5;
  } else if (keywordIndex(job, ["install", "scheduled install"])) {
    currentIdx = 4;
  } else if (keywordIndex(job, ["permit"])) {
    currentIdx = 3;
  } else if (keywordIndex(job, ["design", "cad"])) {
    currentIdx = 2;
  } else if (keywordIndex(job, ["survey complete", "site survey complete"])) {
    currentIdx = 1;
  } else if (keywordIndex(job, ["survey", "site survey"])) {
    currentIdx = 0;
  }

  if (ntp.includes("approved") || ntp.includes("complete")) {
    currentIdx = MILESTONE_NAMES.length - 1;
  }

  return MILESTONE_NAMES.map((name, i) => {
    let status: MilestoneStatus = "PENDING";
    if (cancelled) {
      status = "PENDING";
    } else if (i < currentIdx) {
      status = "DONE";
    } else if (i === currentIdx) {
      status = "IN_PROGRESS";
    }

    let sub: string | undefined;
    if (status === "DONE") sub = "Completed";
    else if (status === "IN_PROGRESS") sub = "In progress";

    if (name === "Install" && customer.installCompletedDate && status === "DONE") {
      sub = `Completed ${customer.installCompletedDate}`;
    }

    return { name, status, sub };
  });
}

export function installProgressPercent(milestones: InstallMilestone[]): number {
  const done = milestones.filter((m) => m.status === "DONE").length;
  const inProgress = milestones.some((m) => m.status === "IN_PROGRESS") ? 0.5 : 0;
  return Math.round(((done + inProgress) / milestones.length) * 100);
}
