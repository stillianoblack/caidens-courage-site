-- Legacy assessment_results table (student B-4 baseline + adult reflections).
-- Safe to run multiple times.

create table if not exists public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  nickname text,
  child_nickname text,
  student_id text,
  assessment_type text not null,
  program_code text not null,
  program_name text,
  family_code text,
  group_name text,
  feelings_score integer,
  reading_score integer,
  focus_moves_score integer,
  modules_completed text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  first_name text,
  email text,
  role text,
  child_age_range text,
  organization text,
  email_opt_in boolean default false,
  understanding_score integer,
  support_score integer,
  total_score integer,
  total_questions integer,
  adult_assessment_phase text
);

create index if not exists assessment_results_program_code_idx
  on public.assessment_results (program_code);
create index if not exists assessment_results_assessment_type_idx
  on public.assessment_results (assessment_type);
create index if not exists assessment_results_completed_at_idx
  on public.assessment_results (completed_at desc);

alter table public.assessment_results enable row level security;

drop policy if exists "assessment_results_anon_insert" on public.assessment_results;
create policy "assessment_results_anon_insert"
  on public.assessment_results for insert
  to anon, authenticated
  with check (true);

drop policy if exists "assessment_results_anon_select" on public.assessment_results;
create policy "assessment_results_anon_select"
  on public.assessment_results for select
  to anon, authenticated
  using (true);
