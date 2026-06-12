import type { TapeCustomer } from "@/lib/tape/types";
import { INSTALL_MILESTONE_ORDER } from "@/lib/workflow/constants";
import {
  inferInstallMilestonesFromTape,
  milestoneSubLabel,
} from "@/lib/workflow/infer";

export type { InstallMilestoneStatus } from "@/lib/workflow/constants";

/** Fallback milestone list when CRM rows are unavailable. */
export function deriveInstallMilestones(customer: TapeCustomer) {
  const inferred = inferInstallMilestonesFromTape(customer);
  return INSTALL_MILESTONE_ORDER.map(({ key, label }) => ({
    name: label,
    status: inferred[key],
    sub: milestoneSubLabel(inferred[key]),
  }));
}

export { installProgressPercent } from "@/lib/workflow/queries";
