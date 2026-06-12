"use server";

import { revalidatePath } from "next/cache";
import type { DealStepKey, InstallMilestoneStatus } from "./constants";
import {
  completeDealStepInDb,
  updateInstallMilestoneInDb,
} from "./queries";

export async function completeDealStepAction(
  projectId: string,
  tapeRecordId: number,
  stepKey: DealStepKey
) {
  await completeDealStepInDb(projectId, stepKey);
  revalidatePath(`/deals/${tapeRecordId}`);
}

export async function updateInstallMilestoneAction(
  tapeRecordId: number,
  milestoneId: number,
  patch: {
    status?: InstallMilestoneStatus;
    ownerName?: string | null;
    dueDate?: string | null;
    notes?: string | null;
  }
) {
  await updateInstallMilestoneInDb(milestoneId, patch);
  revalidatePath(`/installs/${tapeRecordId}`);
}
