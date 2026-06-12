-- Per-participant UI state (onboarding dismissals, tips, etc.)
-- Safe to run multiple times.

create table if not exists public.participant_ui_state (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants (id) on delete cascade,
  state_key text not null,
  state_value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (participant_id, state_key)
);

create index if not exists participant_ui_state_participant_idx
  on public.participant_ui_state (participant_id);

create index if not exists participant_ui_state_key_idx
  on public.participant_ui_state (state_key);

alter table public.participant_ui_state enable row level security;

drop policy if exists "participant_ui_state_anon_select" on public.participant_ui_state;
create policy "participant_ui_state_anon_select"
  on public.participant_ui_state for select
  to anon, authenticated
  using (true);

drop policy if exists "participant_ui_state_anon_insert" on public.participant_ui_state;
create policy "participant_ui_state_anon_insert"
  on public.participant_ui_state for insert
  to anon, authenticated
  with check (true);

drop policy if exists "participant_ui_state_anon_update" on public.participant_ui_state;
create policy "participant_ui_state_anon_update"
  on public.participant_ui_state for update
  to anon, authenticated
  using (true)
  with check (true);
