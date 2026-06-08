-- Focus Flame Academy pilot program intake
-- Run in Supabase SQL editor. Safe to re-run (IF NOT EXISTS).

create table if not exists public.pilot_programs (
  id uuid primary key default gen_random_uuid(),
  program_name text not null,
  program_code text not null unique,
  program_type text not null,
  admin_first_name text not null,
  admin_email text not null,
  estimated_students integer,
  age_range text,
  group_name text,
  family_access_code text not null unique,
  facilitator_access_code text not null unique,
  pricing_tier text not null,
  payment_status text not null default 'pending',
  pilot_status text not null default 'active',
  agreed_to_terms boolean not null default false,
  agreed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists pilot_programs_program_code_idx
  on public.pilot_programs (program_code);

alter table public.pilot_programs enable row level security;

drop policy if exists "pilot_programs_anon_insert" on public.pilot_programs;
create policy "pilot_programs_anon_insert"
  on public.pilot_programs for insert
  to anon, authenticated
  with check (true);

drop policy if exists "pilot_programs_anon_select" on public.pilot_programs;
create policy "pilot_programs_anon_select"
  on public.pilot_programs for select
  to anon, authenticated
  using (true);
