import type {
  DealStepKey,
  DealStepStatus,
  InstallMilestoneKey,
  InstallMilestoneStatus,
} from "./constants";

export type ProjectRow = {
  id: string;
  tape_record_id: number | null;
  pipeline_stage: string | null;
  created_at: string;
  updated_at: string;
};

export type DealWorkflowStepRow = {
  id: number;
  project_id: string;
  step_key: DealStepKey;
  status: DealStepStatus;
  completed_at: string | null;
};

export type InstallMilestoneRow = {
  id: number;
  project_id: string;
  milestone_key: InstallMilestoneKey;
  sort_order: number;
  label: string;
  status: InstallMilestoneStatus;
  owner_name: string | null;
  due_date: string | null;
  notes: string | null;
  completed_at: string | null;
};

export type DealWorkflowState = {
  projectId: string;
  steps: Record<DealStepKey, DealStepStatus>;
};

export type InstallMilestoneState = {
  id: number;
  key: InstallMilestoneKey;
  label: string;
  sortOrder: number;
  status: InstallMilestoneStatus;
  ownerName: string | null;
  dueDate: string | null;
  notes: string | null;
  sub?: string;
};

export type InstallWorkflowState = {
  projectId: string;
  milestones: InstallMilestoneState[];
};
