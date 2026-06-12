-- Player mission progress, wallets, and badges for Courage in the Dark.
-- Keyed by participants.id (active child) — matches Family Portal child selection.
-- Safe to run multiple times (repairs partial / legacy schemas).
--
-- If inserts fail with "null value in column user_id", also run:
--   supabase/fix_player_progress_participant_id.sql

-- ---------------------------------------------------------------------------
-- player_progress
-- ---------------------------------------------------------------------------
create table if not exists public.player_progress (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants (id) on delete cascade,
  week_id text not null,
  mission_id text not null,
  character_id text,
  mission_title text,
  character_name text,
  coins_earned integer not null default 0,
  badge_unlocked text,
  reward_item text,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (participant_id, mission_id)
);

-- Legacy repair: tables created before week_id / participant_id existed
alter table public.player_progress add column if not exists participant_id uuid references public.participants (id) on delete cascade;
alter table public.player_progress add column if not exists week_id text;
alter table public.player_progress add column if not exists mission_id text;
alter table public.player_progress add column if not exists character_id text;
alter table public.player_progress add column if not exists mission_title text;
alter table public.player_progress add column if not exists character_name text;
alter table public.player_progress add column if not exists coins_earned integer not null default 0;
alter table public.player_progress add column if not exists badge_unlocked text;
alter table public.player_progress add column if not exists reward_item text;
alter table public.player_progress add column if not exists completed_at timestamptz not null default now();
alter table public.player_progress add column if not exists created_at timestamptz not null default now();

update public.player_progress
set week_id = coalesce(week_id, 'week-1')
where week_id is null;

create unique index if not exists player_progress_participant_mission_uidx
  on public.player_progress (participant_id, mission_id)
  where participant_id is not null and mission_id is not null;

create index if not exists player_progress_participant_week_idx
  on public.player_progress (participant_id, week_id)
  where participant_id is not null;

create index if not exists player_progress_mission_id_idx
  on public.player_progress (mission_id);

-- ---------------------------------------------------------------------------
-- player_wallets
-- ---------------------------------------------------------------------------
create table if not exists public.player_wallets (
  participant_id uuid primary key references public.participants (id) on delete cascade,
  total_coins integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.player_wallets add column if not exists participant_id uuid references public.participants (id) on delete cascade;
alter table public.player_wallets add column if not exists total_coins integer not null default 0;
alter table public.player_wallets add column if not exists updated_at timestamptz not null default now();

create unique index if not exists player_wallets_participant_id_uidx
  on public.player_wallets (participant_id)
  where participant_id is not null;

-- ---------------------------------------------------------------------------
-- player_badges
-- ---------------------------------------------------------------------------
create table if not exists public.player_badges (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants (id) on delete cascade,
  week_id text not null,
  mission_id text not null,
  badge_name text not null,
  earned_at timestamptz not null default now(),
  unique (participant_id, mission_id, badge_name)
);

alter table public.player_badges add column if not exists participant_id uuid references public.participants (id) on delete cascade;
alter table public.player_badges add column if not exists week_id text;
alter table public.player_badges add column if not exists mission_id text;
alter table public.player_badges add column if not exists badge_name text;
alter table public.player_badges add column if not exists earned_at timestamptz not null default now();

update public.player_badges
set week_id = coalesce(week_id, 'week-1')
where week_id is null;

create unique index if not exists player_badges_participant_mission_badge_uidx
  on public.player_badges (participant_id, mission_id, badge_name)
  where participant_id is not null and mission_id is not null and badge_name is not null;

create index if not exists player_badges_participant_week_idx
  on public.player_badges (participant_id, week_id)
  where participant_id is not null;

-- ---------------------------------------------------------------------------
-- RLS — anon + authenticated (same pattern as module_results)
-- ---------------------------------------------------------------------------
alter table public.player_progress enable row level security;
alter table public.player_wallets enable row level security;
alter table public.player_badges enable row level security;

drop policy if exists "player_progress_anon_insert" on public.player_progress;
create policy "player_progress_anon_insert"
  on public.player_progress for insert
  to anon, authenticated
  with check (true);

drop policy if exists "player_progress_anon_select" on public.player_progress;
create policy "player_progress_anon_select"
  on public.player_progress for select
  to anon, authenticated
  using (true);

drop policy if exists "player_wallets_anon_insert" on public.player_wallets;
create policy "player_wallets_anon_insert"
  on public.player_wallets for insert
  to anon, authenticated
  with check (true);

drop policy if exists "player_wallets_anon_select" on public.player_wallets;
create policy "player_wallets_anon_select"
  on public.player_wallets for select
  to anon, authenticated
  using (true);

drop policy if exists "player_wallets_anon_update" on public.player_wallets;
create policy "player_wallets_anon_update"
  on public.player_wallets for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "player_badges_anon_insert" on public.player_badges;
create policy "player_badges_anon_insert"
  on public.player_badges for insert
  to anon, authenticated
  with check (true);

drop policy if exists "player_badges_anon_select" on public.player_badges;
create policy "player_badges_anon_select"
  on public.player_badges for select
  to anon, authenticated
  using (true);

-- Drop legacy auth.uid() policies if a prior migration partially ran
drop policy if exists "player_progress_select_own" on public.player_progress;
drop policy if exists "player_progress_insert_own" on public.player_progress;
drop policy if exists "player_wallets_select_own" on public.player_wallets;
drop policy if exists "player_wallets_insert_own" on public.player_wallets;
drop policy if exists "player_wallets_update_own" on public.player_wallets;
drop policy if exists "player_badges_select_own" on public.player_badges;
drop policy if exists "player_badges_insert_own" on public.player_badges;
