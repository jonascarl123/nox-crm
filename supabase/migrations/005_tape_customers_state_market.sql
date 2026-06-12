alter table tape_customers
  add column if not exists state text,
  add column if not exists market text;
