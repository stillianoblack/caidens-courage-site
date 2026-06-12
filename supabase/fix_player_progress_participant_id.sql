-- Fix legacy auth-user schema on player progress tables.
-- Run in Supabase SQL Editor AFTER player_mission_progress_setup.sql
-- when inserts fail with: null value in column "user_id" violates not-null constraint
--
-- Safe to re-run. Migrates tables to participant_id-only (Family Portal active child).

-- ---------------------------------------------------------------------------
-- 1. Ensure participant_id columns exist
-- ---------------------------------------------------------------------------
alter table public.player_progress
  add column if not exists participant_id uuid references public.participants (id) on delete cascade;

alter table public.player_wallets
  add column if not exists participant_id uuid references public.participants (id) on delete cascade;

alter table public.player_badges
  add column if not exists participant_id uuid references public.participants (id) on delete cascade;

-- ---------------------------------------------------------------------------
-- 2. Remove broken legacy rows that only have user_id (no participant_id)
-- ---------------------------------------------------------------------------
delete from public.player_progress where participant_id is null;
delete from public.player_wallets where participant_id is null;
delete from public.player_badges where participant_id is null;

-- ---------------------------------------------------------------------------
-- 3. Drop NOT NULL on legacy user_id columns (if they exist)
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'player_progress' and column_name = 'user_id'
  ) then
    alter table public.player_progress alter column user_id drop not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'player_wallets' and column_name = 'user_id'
  ) then
    alter table public.player_wallets alter column user_id drop not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'player_badges' and column_name = 'user_id'
  ) then
    alter table public.player_badges alter column user_id drop not null;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 4. Require participant_id going forward
-- ---------------------------------------------------------------------------
alter table public.player_progress
  alter column participant_id set not null;

alter table public.player_badges
  alter column participant_id set not null;

-- ---------------------------------------------------------------------------
-- 5. player_wallets — switch primary key from user_id to participant_id
-- ---------------------------------------------------------------------------
alter table public.player_wallets
  drop constraint if exists player_wallets_pkey;

alter table public.player_wallets
  alter column participant_id set not null;

alter table public.player_wallets
  add constraint player_wallets_participant_id_pkey primary key (participant_id);

-- ---------------------------------------------------------------------------
-- 6. Drop legacy user_id unique constraints / indexes
-- ---------------------------------------------------------------------------
alter table public.player_progress
  drop constraint if exists player_progress_user_id_mission_id_key;

alter table public.player_badges
  drop constraint if exists player_badges_user_id_mission_id_badge_name_key;

alter table public.player_badges
  drop constraint if exists player_badges_user_id_badge_name_key;

drop index if exists public.player_progress_user_id_mission_id_key;
drop index if exists public.player_badges_user_id_badge_name_key;
drop index if exists public.player_badges_user_id_mission_id_badge_name_key;

-- ---------------------------------------------------------------------------
-- 7. Participant-based indexes (duplicate protection + lookups)
-- ---------------------------------------------------------------------------
create unique index if not exists player_progress_participant_mission_unique
  on public.player_progress (participant_id, mission_id);

create unique index if not exists player_badges_participant_badge_unique
  on public.player_badges (participant_id, badge_name);

create index if not exists player_progress_participant_week_idx
  on public.player_progress (participant_id, week_id);

-- ---------------------------------------------------------------------------
-- 8. Re-apply anon RLS (same pattern as module_results)
-- ---------------------------------------------------------------------------
alter table public.player_progress enable row level security;
alter table public.player_wallets enable row level security;
alter table public.player_badges enable row level security;

drop policy if exists "player_progress_anon_insert" on public.player_progress;
create policy "player_progress_anon_insert"
  on public.player_progress for insert to anon, authenticated with check (true);

drop policy if exists "player_progress_anon_select" on public.player_progress;
create policy "player_progress_anon_select"
  on public.player_progress for select to anon, authenticated using (true);

drop policy if exists "player_wallets_anon_insert" on public.player_wallets;
create policy "player_wallets_anon_insert"
  on public.player_wallets for insert to anon, authenticated with check (true);

drop policy if exists "player_wallets_anon_select" on public.player_wallets;
create policy "player_wallets_anon_select"
  on public.player_wallets for select to anon, authenticated using (true);

drop policy if exists "player_wallets_anon_update" on public.player_wallets;
create policy "player_wallets_anon_update"
  on public.player_wallets for update to anon, authenticated using (true) with check (true);

drop policy if exists "player_badges_anon_insert" on public.player_badges;
create policy "player_badges_anon_insert"
  on public.player_badges for insert to anon, authenticated with check (true);

drop policy if exists "player_badges_anon_select" on public.player_badges;
create policy "player_badges_anon_select"
  on public.player_badges for select to anon, authenticated using (true);

-- Drop legacy auth.uid() policies
drop policy if exists "player_progress_select_own" on public.player_progress;
drop policy if exists "player_progress_insert_own" on public.player_progress;
drop policy if exists "player_wallets_select_own" on public.player_wallets;
drop policy if exists "player_wallets_insert_own" on public.player_wallets;
drop policy if exists "player_wallets_update_own" on public.player_wallets;
drop policy if exists "player_badges_select_own" on public.player_badges;
drop policy if exists "player_badges_insert_own" on public.player_badges;
