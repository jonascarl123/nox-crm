-- CRM projects: editable workflow state keyed to Tape records (optional link).

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  tape_record_id bigint unique references tape_customers (tape_record_id) on delete set null,
  pipeline_stage text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_tape_record_id_idx on projects (tape_record_id);

-- Deal workflow (6 steps)
create table if not exists deal_workflow_steps (
  id bigint generated always as identity primary key,
  project_id uuid not null references projects (id) on delete cascade,
  step_key text not null check (
    step_key in (
      'consumption',
      'design',
      'proposal',
      'financing',
      'contracting',
      'submission'
    )
  ),
  status text not null default 'pending' check (
    status in ('pending', 'active', 'complete')
  ),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, step_key)
);

create index if not exists deal_workflow_steps_project_id_idx
  on deal_workflow_steps (project_id);

-- Install milestone tracker (8 milestones)
create table if not exists install_milestones (
  id bigint generated always as identity primary key,
  project_id uuid not null references projects (id) on delete cascade,
  milestone_key text not null check (
    milestone_key in (
      'deal_signed',
      'site_survey_scheduled',
      'site_survey_complete',
      'design',
      'permit',
      'install',
      'inspection',
      'pto_approved'
    )
  ),
  sort_order int not null,
  label text not null,
  status text not null default 'PENDING' check (
    status in ('PENDING', 'IN_PROGRESS', 'DONE')
  ),
  owner_name text,
  due_date date,
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, milestone_key)
);

create index if not exists install_milestones_project_id_idx
  on install_milestones (project_id);

alter table projects enable row level security;
alter table deal_workflow_steps enable row level security;
alter table install_milestones enable row level security;

-- Reads/writes use service role from server actions for now.
