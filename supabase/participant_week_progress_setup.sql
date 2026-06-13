-- Freeze grade level per week when a child starts that week's adventures.
-- Safe to run multiple times.

create table if not exists public.participant_week_progress (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants (id) on delete cascade,
  week_id text not null,
  week_grade_level text,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (participant_id, week_id)
);

create index if not exists participant_week_progress_participant_idx
  on public.participant_week_progress (participant_id);

alter table public.participant_week_progress enable row level security;
