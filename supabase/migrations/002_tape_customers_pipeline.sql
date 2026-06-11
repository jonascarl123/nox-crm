alter table tape_customers
  add column if not exists pipeline_stage text,
  add column if not exists ntp_app_status text,
  add column if not exists has_install boolean not null default false,
  add column if not exists install_completed_date date;

create index if not exists tape_customers_pipeline_stage_idx
  on tape_customers (pipeline_stage);
