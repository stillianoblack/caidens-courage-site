-- Camp achievement screenshots: Storage bucket + metadata table
-- 1. Create Storage bucket "camp-achievements" in Supabase Dashboard (public read optional).
-- 2. Run this script in the SQL Editor. Safe to run multiple times.

create table if not exists public.camp_achievement_screenshots (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants (id) on delete cascade,
  week_id text not null,
  mission_id text not null,
  character_id text,
  mission_title text,
  badge_unlocked text,
  coins_earned integer not null default 0,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists camp_achievement_screenshots_participant_idx
  on public.camp_achievement_screenshots (participant_id);

create index if not exists camp_achievement_screenshots_week_mission_idx
  on public.camp_achievement_screenshots (participant_id, week_id, mission_id);

alter table public.camp_achievement_screenshots enable row level security;

drop policy if exists "camp_achievement_screenshots_anon_select" on public.camp_achievement_screenshots;
create policy "camp_achievement_screenshots_anon_select"
  on public.camp_achievement_screenshots for select
  to anon, authenticated
  using (true);

drop policy if exists "camp_achievement_screenshots_anon_insert" on public.camp_achievement_screenshots;
create policy "camp_achievement_screenshots_anon_insert"
  on public.camp_achievement_screenshots for insert
  to anon, authenticated
  with check (true);

-- Storage policies (bucket: camp-achievements)
drop policy if exists "anon upload camp achievement files" on storage.objects;
create policy "anon upload camp achievement files"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'camp-achievements');

drop policy if exists "public read camp achievement files" on storage.objects;
create policy "public read camp achievement files"
  on storage.objects
  for select
  to public
  using (bucket_id = 'camp-achievements');
