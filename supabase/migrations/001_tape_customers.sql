create table if not exists tape_customers (
  id bigint generated always as identity primary key,
  tape_record_id bigint not null unique,
  pid text,
  prospect_id bigint,
  homeowner_id bigint,
  product_name text,
  customer_name text,
  customer_address text,
  customer_city text,
  customer_state text,
  customer_zip text,
  customer_email text,
  customer_phone text,
  gross_account_value numeric,
  job_status text,
  kw numeric,
  net_epc numeric,
  sow_amount numeric,
  notes text,
  sale_date date,
  cancel_date date,
  closer_1 text,
  setter_1 text,
  closer_2 text,
  raw_tape jsonb not null,
  synced_at timestamptz not null default now()
);

create index if not exists tape_customers_pid_idx on tape_customers (pid);
create index if not exists tape_customers_synced_at_idx on tape_customers (synced_at desc);
