import { createServerSupabase } from "@/lib/supabase/server";
import type { TapeCustomer } from "@/lib/tape/types";
import {
  DEAL_STEP_ORDER,
  INSTALL_MILESTONE_ORDER,
  type DealStepKey,
  type DealStepStatus,
  type InstallMilestoneKey,
  type InstallMilestoneStatus,
} from "./constants";
import {
  inferDealStepsFromTape,
  inferInstallMilestonesFromTape,
  milestoneSubLabel,
} from "./infer";
import type {
  DealWorkflowState,
  DealWorkflowStepRow,
  InstallMilestoneRow,
  InstallWorkflowState,
  ProjectRow,
} from "./types";

function isMissingTable(error: { message?: string } | null): boolean {
  const msg = error?.message ?? "";
  return msg.includes("does not exist") || msg.includes("schema cache");
}

async function getProjectByTapeRecordId(
  tapeRecordId: number
): Promise<ProjectRow | null> {
  const supabase = createServerSupabase();
  const result = await supabase
    .from("projects")
    .select("*")
    .eq("tape_record_id", tapeRecordId)
    .maybeSingle();

  if (result.error) {
    if (isMissingTable(result.error)) return null;
    throw new Error(result.error.message);
  }
  return result.data as ProjectRow | null;
}

async function createProjectForTape(
  customer: TapeCustomer
): Promise<ProjectRow> {
  const supabase = createServerSupabase();
  const result = await supabase
    .from("projects")
    .insert({
      tape_record_id: customer.tapeRecordId,
      pipeline_stage: customer.pipelineStage,
    })
    .select("*")
    .single();

  if (result.error) throw new Error(result.error.message);
  return result.data as ProjectRow;
}

export async function ensureProjectForTape(
  customer: TapeCustomer
): Promise<ProjectRow | null> {
  try {
    const existing = await getProjectByTapeRecordId(customer.tapeRecordId);
    if (existing) return existing;
    return await createProjectForTape(customer);
  } catch (err) {
    if (err instanceof Error && isMissingTable({ message: err.message })) {
      return null;
    }
    throw err;
  }
}

async function seedDealWorkflowSteps(
  projectId: string,
  customer: TapeCustomer
): Promise<Record<DealStepKey, DealStepStatus>> {
  const supabase = createServerSupabase();
  const inferred = inferDealStepsFromTape(
    customer.jobStatus,
    customer.ntpAppStatus
  );

  const rows = DEAL_STEP_ORDER.map((step_key) => ({
    project_id: projectId,
    step_key,
    status: inferred[step_key],
    completed_at: inferred[step_key] === "complete" ? new Date().toISOString() : null,
  }));

  const result = await supabase.from("deal_workflow_steps").insert(rows).select("*");
  if (result.error) throw new Error(result.error.message);

  return rowsToDealSteps((result.data ?? []) as DealWorkflowStepRow[]);
}

async function seedInstallMilestones(
  projectId: string,
  customer: TapeCustomer
): Promise<InstallMilestoneRow[]> {
  const supabase = createServerSupabase();
  const inferred = inferInstallMilestonesFromTape(customer);

  const rows = INSTALL_MILESTONE_ORDER.map(({ key, label, sortOrder }) => ({
    project_id: projectId,
    milestone_key: key,
    sort_order: sortOrder,
    label,
    status: inferred[key],
    completed_at: inferred[key] === "DONE" ? new Date().toISOString() : null,
  }));

  const result = await supabase.from("install_milestones").insert(rows).select("*");
  if (result.error) throw new Error(result.error.message);
  return (result.data ?? []) as InstallMilestoneRow[];
}

function rowsToDealSteps(
  rows: DealWorkflowStepRow[]
): Record<DealStepKey, DealStepStatus> {
  const steps = {} as Record<DealStepKey, DealStepStatus>;
  for (const key of DEAL_STEP_ORDER) {
    steps[key] = "pending";
  }
  for (const row of rows) {
    steps[row.step_key] = row.status;
  }
  return steps;
}

function rowsToInstallMilestones(
  rows: InstallMilestoneRow[]
): InstallWorkflowState["milestones"] {
  return [...rows]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((row) => ({
      id: row.id,
      key: row.milestone_key,
      label: row.label,
      sortOrder: row.sort_order,
      status: row.status,
      ownerName: row.owner_name,
      dueDate: row.due_date,
      notes: row.notes,
      sub: milestoneSubLabel(
        row.status,
        row.completed_at?.slice(0, 10) ?? row.due_date
      ),
    }));
}

export async function getDealWorkflowForTape(
  customer: TapeCustomer
): Promise<DealWorkflowState | null> {
  try {
    const project = await ensureProjectForTape(customer);
    if (!project) return null;

    const supabase = createServerSupabase();
    let result = await supabase
      .from("deal_workflow_steps")
      .select("*")
      .eq("project_id", project.id);

    if (result.error) {
      if (isMissingTable(result.error)) return null;
      throw new Error(result.error.message);
    }

    let rows = (result.data ?? []) as DealWorkflowStepRow[];
    if (rows.length === 0) {
      const steps = await seedDealWorkflowSteps(project.id, customer);
      return { projectId: project.id, steps };
    }

    return { projectId: project.id, steps: rowsToDealSteps(rows) };
  } catch (err) {
    if (err instanceof Error && isMissingTable({ message: err.message })) {
      return null;
    }
    throw err;
  }
}

export async function getInstallWorkflowForTape(
  customer: TapeCustomer
): Promise<InstallWorkflowState | null> {
  try {
    const project = await ensureProjectForTape(customer);
    if (!project) return null;

    const supabase = createServerSupabase();
    let result = await supabase
      .from("install_milestones")
      .select("*")
      .eq("project_id", project.id);

    if (result.error) {
      if (isMissingTable(result.error)) return null;
      throw new Error(result.error.message);
    }

    let rows = (result.data ?? []) as InstallMilestoneRow[];
    if (rows.length === 0) {
      rows = await seedInstallMilestones(project.id, customer);
    }

    return {
      projectId: project.id,
      milestones: rowsToInstallMilestones(rows),
    };
  } catch (err) {
    if (err instanceof Error && isMissingTable({ message: err.message })) {
      return null;
    }
    throw err;
  }
}

export async function updateDealStepInDb(
  projectId: string,
  stepKey: DealStepKey,
  status: DealStepStatus
): Promise<void> {
  const supabase = createServerSupabase();
  const result = await supabase
    .from("deal_workflow_steps")
    .update({
      status,
      completed_at: status === "complete" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("project_id", projectId)
    .eq("step_key", stepKey);

  if (result.error) throw new Error(result.error.message);
}

export async function completeDealStepInDb(
  projectId: string,
  stepKey: DealStepKey
): Promise<Record<DealStepKey, DealStepStatus>> {
  const supabase = createServerSupabase();

  await updateDealStepInDb(projectId, stepKey, "complete");

  const idx = DEAL_STEP_ORDER.indexOf(stepKey);
  const next = DEAL_STEP_ORDER[idx + 1];
  if (next) {
    await updateDealStepInDb(projectId, next, "active");
  }

  const result = await supabase
    .from("deal_workflow_steps")
    .select("*")
    .eq("project_id", projectId);

  if (result.error) throw new Error(result.error.message);
  return rowsToDealSteps((result.data ?? []) as DealWorkflowStepRow[]);
}

export async function updateInstallMilestoneInDb(
  milestoneId: number,
  patch: {
    status?: InstallMilestoneStatus;
    ownerName?: string | null;
    dueDate?: string | null;
    notes?: string | null;
  }
): Promise<void> {
  const supabase = createServerSupabase();
  const result = await supabase
    .from("install_milestones")
    .update({
      ...(patch.status !== undefined
        ? {
            status: patch.status,
            completed_at:
              patch.status === "DONE" ? new Date().toISOString() : null,
          }
        : {}),
      ...(patch.ownerName !== undefined ? { owner_name: patch.ownerName } : {}),
      ...(patch.dueDate !== undefined ? { due_date: patch.dueDate } : {}),
      ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", milestoneId);

  if (result.error) throw new Error(result.error.message);
}

export function installProgressPercent(
  milestones: InstallWorkflowState["milestones"]
): number {
  const done = milestones.filter((m) => m.status === "DONE").length;
  const inProgress = milestones.some((m) => m.status === "IN_PROGRESS")
    ? 0.5
    : 0;
  return Math.round(((done + inProgress) / milestones.length) * 100);
}
