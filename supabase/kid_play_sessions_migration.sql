-- Kid Play Shell session tracking (camp shared devices, family home, facilitator roster).
-- Phase 1: schema + RLS only — app writes via kidPlaySessionService.
-- Safe to run multiple times.

create table if not exists public.kid_play_sessions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.participants (id) on delete cascade,
  participant_id uuid references public.participants (id) on delete set null,
  organization_id uuid references public.pilot_programs (id) on delete set null,
  launched_by_user_id uuid,
  session_source text not null,
  device_mode text not null,
  status text not null default 'active',
  started_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  ended_at timestamptz,
  ended_reason text,
  device_label text,
  resume_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint kid_play_sessions_session_source_check check (
    session_source in (
      'family_home',
      'camp_roster_launch',
      'facilitator_roster_launch',
      'school_access_code',
      'future_child_pin'
    )
  ),
  constraint kid_play_sessions_device_mode_check check (
    device_mode in (
      'home_device',
      'shared_camp_device',
      'shared_school_device',
      'child_owned_device'
    )
  ),
  constraint kid_play_sessions_status_check check (
    status in ('active', 'ended', 'expired', 'moved')
  )
);

comment on table public.kid_play_sessions is
  'Per-device kid gameplay sessions for Kid Play Shell timeout and resume rules.';
comment on column public.kid_play_sessions.child_id is
  'Primary child participant row for this play session.';
comment on column public.kid_play_sessions.participant_id is
  'Optional alias when launch path uses a distinct participant id.';
comment on column public.kid_play_sessions.organization_id is
  'Optional pilot_programs.id — not used alone for timeout policy.';
comment on column public.kid_play_sessions.launched_by_user_id is
  'Reserved for future authenticated parent/facilitator user id.';
comment on column public.kid_play_sessions.resume_payload is
  'Opaque client resume state (route, week, mission slug, etc.).';

create index if not exists kid_play_sessions_child_status_idx
  on public.kid_play_sessions (child_id, status);

create index if not exists kid_play_sessions_participant_status_idx
  on public.kid_play_sessions (participant_id, status)
  where participant_id is not null;

create index if not exists kid_play_sessions_active_activity_idx
  on public.kid_play_sessions (last_activity_at desc)
  where status = 'active';

create index if not exists kid_play_sessions_organization_idx
  on public.kid_play_sessions (organization_id)
  where organization_id is not null;

alter table public.kid_play_sessions enable row level security;

drop policy if exists "kid_play_sessions_anon_select" on public.kid_play_sessions;
create policy "kid_play_sessions_anon_select"
  on public.kid_play_sessions for select
  to anon, authenticated
  using (true);

drop policy if exists "kid_play_sessions_anon_insert" on public.kid_play_sessions;
create policy "kid_play_sessions_anon_insert"
  on public.kid_play_sessions for insert
  to anon, authenticated
  with check (true);

drop policy if exists "kid_play_sessions_anon_update" on public.kid_play_sessions;
create policy "kid_play_sessions_anon_update"
  on public.kid_play_sessions for update
  to anon, authenticated
  using (true)
  with check (true);
