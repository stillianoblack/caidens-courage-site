-- Public marketing pilot waitlist (Focus Flame Lab + B-4 tools)
-- Run in Supabase SQL editor. Safe to re-run (IF NOT EXISTS).

create table if not exists public.pilot_waitlist (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  parent_name text not null,
  parent_email text not null,
  child_age text,
  source text not null,
  interest_type text not null check (
    interest_type in ('focus_flame_lab', 'b4_tools', 'general_pilot')
  ),
  page_path text
);

alter table public.pilot_waitlist
  add column if not exists page_path text;

create index if not exists pilot_waitlist_created_at_idx
  on public.pilot_waitlist (created_at desc);

create index if not exists pilot_waitlist_interest_type_idx
  on public.pilot_waitlist (interest_type);

alter table public.pilot_waitlist enable row level security;

-- Public may submit waitlist entries only — no SELECT/UPDATE/DELETE policies.
drop policy if exists "pilot_waitlist_anon_insert" on public.pilot_waitlist;
create policy "pilot_waitlist_anon_insert"
  on public.pilot_waitlist for insert
  to anon, authenticated
  with check (true);

revoke all on public.pilot_waitlist from anon, authenticated;
grant insert on public.pilot_waitlist to anon, authenticated;
