-- App access control: one row per user allowed to sign in.
-- Users are created by an admin (see Settings → Access). Public sign-up is disabled
-- in the Supabase dashboard, and login uses email OTP (shouldCreateUser: false),
-- so only emails present here can ever authenticate.

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  full_name text,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Authenticated users may read their own profile. All writes go through the
-- service role (server actions / seed script), which bypasses RLS.
drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);

create index if not exists profiles_role_idx on profiles (role);
