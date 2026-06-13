-- Duolingo-style quest tracker progress by participant.
-- Safe to run multiple times.

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
  period_anchor text,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (participant_id, quest_period, quest_key, period_anchor)
);

create index if not exists participant_quests_participant_idx
  on public.participant_quests (participant_id, quest_period);

alter table public.participant_quests enable row level security;
