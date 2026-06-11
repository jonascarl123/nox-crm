alter table tape_customers
  add column if not exists dealer_name text,
  add column if not exists office_name text,
  add column if not exists division text,
  add column if not exists region text,
  add column if not exists team text;

create index if not exists tape_customers_division_idx on tape_customers (division);
create index if not exists tape_customers_region_idx on tape_customers (region);
create index if not exists tape_customers_team_idx on tape_customers (team);
