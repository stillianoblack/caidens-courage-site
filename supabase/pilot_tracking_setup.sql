-- Universal Focus Flame Academy tracking tables.
-- Safe to run multiple times.

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  nickname text,
  first_name text,
  email text,
  role text not null,
  program_code text not null,
  program_name text,
  group_name text,
  organization text,
  child_age_range text,
  email_opt_in boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists participants_program_code_idx on public.participants (program_code);
create index if not exists participants_role_idx on public.participants (role);

alter table public.participants add column if not exists adult_role text;
create index if not exists participants_email_role_program_idx
  on public.participants (lower(email), role, program_code)
  where email is not null;

create index if not exists participants_student_lookup_idx
  on public.participants (lower(nickname), role, program_code, coalesce(group_name, ''))
  where nickname is not null;

create table if not exists public.module_results (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references public.participants (id) on delete set null,
  role text not null,
  program_code text not null,
  group_name text,
  module_id text not null,
  module_title text not null,
  character text not null,
  skill_area text,
  score integer not null default 0,
  max_score integer not null default 0,
  percent_score numeric(5, 2),
  time_spent_seconds integer,
  attempt_number integer not null default 1,
  answers_json jsonb,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists module_results_program_code_idx on public.module_results (program_code);
create index if not exists module_results_module_id_idx on public.module_results (module_id);
create index if not exists module_results_participant_id_idx on public.module_results (participant_id);
create index if not exists module_results_completed_at_idx on public.module_results (completed_at desc);

create table if not exists public.assessment_results_v2 (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references public.participants (id) on delete set null,
  role text not null,
  program_code text not null,
  group_name text,
  assessment_type text not null,
  reading_score integer,
  focus_score integer,
  confidence_score integer,
  understanding_score integer,
  support_score integer,
  total_score integer,
  max_score integer,
  percent_score numeric(5, 2),
  answers_json jsonb,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists assessment_results_v2_program_code_idx
  on public.assessment_results_v2 (program_code);
create index if not exists assessment_results_v2_assessment_type_idx
  on public.assessment_results_v2 (assessment_type);
create index if not exists assessment_results_v2_participant_id_idx
  on public.assessment_results_v2 (participant_id);
create index if not exists assessment_results_v2_completed_at_idx
  on public.assessment_results_v2 (completed_at desc);

alter table public.participants enable row level security;
alter table public.module_results enable row level security;
alter table public.assessment_results_v2 enable row level security;

drop policy if exists "participants_anon_insert" on public.participants;
create policy "participants_anon_insert"
  on public.participants for insert
  to anon, authenticated
  with check (true);

drop policy if exists "participants_anon_select" on public.participants;
create policy "participants_anon_select"
  on public.participants for select
  to anon, authenticated
  using (true);

drop policy if exists "module_results_anon_insert" on public.module_results;
create policy "module_results_anon_insert"
  on public.module_results for insert
  to anon, authenticated
  with check (true);

drop policy if exists "module_results_anon_select" on public.module_results;
create policy "module_results_anon_select"
  on public.module_results for select
  to anon, authenticated
  using (true);

drop policy if exists "assessment_results_v2_anon_insert" on public.assessment_results_v2;
create policy "assessment_results_v2_anon_insert"
  on public.assessment_results_v2 for insert
  to anon, authenticated
  with check (true);

drop policy if exists "assessment_results_v2_anon_select" on public.assessment_results_v2;
create policy "assessment_results_v2_anon_select"
  on public.assessment_results_v2 for select
  to anon, authenticated
  using (true);
