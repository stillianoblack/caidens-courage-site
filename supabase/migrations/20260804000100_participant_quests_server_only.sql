-- Participant quest persistence for daily, weekly, and monthly quest progress.
--
-- Access model:
--   The current student compatibility session is not a Supabase Auth identity and
--   therefore cannot be represented safely by auth.uid()-based RLS. Browser roles
--   are denied all privileges. Quest reads and writes must be performed by a
--   server-side endpoint that validates the active student session and program
--   before using the service role.
--
-- Idempotency:
--   This migration is additive and safe to run repeatedly. It does not update or
--   delete application rows. Existing incompatible data causes constraint creation
--   to fail closed instead of being rewritten.

create extension if not exists pgcrypto;

create table if not exists public.participant_quests (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants (id) on delete cascade,
  quest_period text not null,
  quest_key text not null,
  progress_count integer not null default 0,
  target_count integer not null,
  reward_type text,
  reward_value text,
  reward_coins integer not null default 0,
  period_anchor text not null,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint participant_quests_period_check
    check (quest_period in ('daily', 'weekly', 'monthly')),
  constraint participant_quests_progress_nonnegative_check
    check (progress_count >= 0),
  constraint participant_quests_target_positive_check
    check (target_count > 0),
  constraint participant_quests_progress_within_target_check
    check (progress_count <= target_count),
  constraint participant_quests_reward_type_check
    check (reward_type is null or reward_type in ('flame', 'chest', 'badge')),
  constraint participant_quests_reward_coins_nonnegative_check
    check (reward_coins >= 0)
);

-- Reconcile an earlier setup-script table without rewriting application data.
-- SET NOT NULL and constraint validation deliberately fail if existing rows do
-- not satisfy the reviewed contract.
alter table public.participant_quests
  alter column period_anchor set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.participant_quests'::regclass
      and conname = 'participant_quests_period_check'
  ) then
    alter table public.participant_quests
      add constraint participant_quests_period_check
      check (quest_period in ('daily', 'weekly', 'monthly'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.participant_quests'::regclass
      and conname = 'participant_quests_progress_nonnegative_check'
  ) then
    alter table public.participant_quests
      add constraint participant_quests_progress_nonnegative_check
      check (progress_count >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.participant_quests'::regclass
      and conname = 'participant_quests_target_positive_check'
  ) then
    alter table public.participant_quests
      add constraint participant_quests_target_positive_check
      check (target_count > 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.participant_quests'::regclass
      and conname = 'participant_quests_progress_within_target_check'
  ) then
    alter table public.participant_quests
      add constraint participant_quests_progress_within_target_check
      check (progress_count <= target_count);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.participant_quests'::regclass
      and conname = 'participant_quests_reward_type_check'
  ) then
    alter table public.participant_quests
      add constraint participant_quests_reward_type_check
      check (reward_type is null or reward_type in ('flame', 'chest', 'badge'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.participant_quests'::regclass
      and conname = 'participant_quests_reward_coins_nonnegative_check'
  ) then
    alter table public.participant_quests
      add constraint participant_quests_reward_coins_nonnegative_check
      check (reward_coins >= 0);
  end if;
end
$$;

comment on table public.participant_quests is
  'Server-mediated quest progress keyed by participant, period, quest definition key, and period anchor.';
comment on column public.participant_quests.quest_key is
  'Stable key from the application quest definition; it is not a foreign key because definitions are code/CMS configuration.';
comment on column public.participant_quests.period_anchor is
  'Daily ISO date, weekly week ID, or monthly YYYY-MM anchor used to prevent duplicate assignments.';
comment on column public.participant_quests.claimed_at is
  'Null until the server-mediated reward claim completes; claimed/claimable UI state is derived from this and progress counts.';

create index if not exists participant_quests_participant_period_idx
  on public.participant_quests (participant_id, quest_period);

create index if not exists participant_quests_participant_updated_idx
  on public.participant_quests (participant_id, updated_at desc);

create unique index if not exists participant_quests_assignment_uidx
  on public.participant_quests (participant_id, quest_period, quest_key, period_anchor);

alter table public.participant_quests enable row level security;
alter table public.participant_quests force row level security;

-- No browser policy is intentionally created. The compatibility student session
-- does not set a database-verifiable principal, so an RLS policy based only on a
-- caller-supplied participant UUID would permit cross-student access.
revoke all on table public.participant_quests from public;
revoke all on table public.participant_quests from anon;
revoke all on table public.participant_quests from authenticated;
grant select, insert, update, delete on table public.participant_quests to service_role;
