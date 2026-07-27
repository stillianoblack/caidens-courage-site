-- Additive metadata only. Outcome metrics continue to use canonical source tables.
create table if not exists public.pilot_rollout_state (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null unique references public.pilot_programs(id) on delete cascade,
  status text not null default 'Draft'
    check (status in ('Draft','Setup','Ready','Active','Needs attention','Reporting','Complete','Archived')),
  status_reason text null,
  checklist jsonb not null default '{}'::jsonb,
  baseline_window_start date null,
  baseline_window_end date null,
  program_window_start date null,
  program_window_end date null,
  post_window_start date null,
  post_window_end date null,
  reporting_date date null,
  matched_data_target integer not null default 0 check (matched_data_target >= 0),
  completion_target numeric not null default 0 check (completion_target >= 0 and completion_target <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pilot_rollout_notes (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.pilot_programs(id) on delete cascade,
  note_date date not null default current_date,
  owner_name text not null,
  note_type text not null
    check (note_type in ('Facilitator follow-up','Principal follow-up','Parent communication','Technical issue','Training need','Expansion opportunity')),
  note_status text not null default 'Open',
  note text not null,
  next_action_date date null,
  created_at timestamptz not null default now()
);

create table if not exists public.pilot_outcome_reports (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.pilot_programs(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft','final')),
  reporting_start date null,
  reporting_end date null,
  include_student_appendix boolean not null default false,
  include_notes boolean not null default true,
  include_charts boolean not null default true,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists pilot_rollout_notes_program_date_idx
  on public.pilot_rollout_notes(program_id, note_date desc);
create index if not exists pilot_rollout_notes_next_action_idx
  on public.pilot_rollout_notes(next_action_date)
  where next_action_date is not null;
create index if not exists pilot_outcome_reports_program_created_idx
  on public.pilot_outcome_reports(program_id, created_at desc);

alter table public.pilot_rollout_state enable row level security;
alter table public.pilot_rollout_notes enable row level security;
alter table public.pilot_outcome_reports enable row level security;

revoke all on public.pilot_rollout_state from anon, authenticated;
revoke all on public.pilot_rollout_notes from anon, authenticated;
revoke all on public.pilot_outcome_reports from anon, authenticated;
grant all on public.pilot_rollout_state to service_role;
grant all on public.pilot_rollout_notes to service_role;
grant all on public.pilot_outcome_reports to service_role;

comment on table public.pilot_rollout_state is
  'Admin-only rollout metadata. Accessed exclusively through authenticated server functions.';
comment on table public.pilot_rollout_notes is
  'Admin-only operational notes. No automated outreach is triggered.';
comment on table public.pilot_outcome_reports is
  'Metadata for protected in-memory pilot outcome report generation; PDF files are not stored publicly.';
