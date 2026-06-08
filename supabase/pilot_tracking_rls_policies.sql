-- Pilot tracking RLS repair.
-- Run in Supabase SQL editor if participants/module_results/assessment_results_v2 are not
-- accepting app writes from the published site. Safe to re-run.

alter table public.participants add column if not exists adult_role text;

alter table public.participants enable row level security;
alter table public.module_results enable row level security;
alter table public.assessment_results_v2 enable row level security;

drop policy if exists "participants_anon_insert" on public.participants;
create policy "participants_anon_insert"
  on public.participants for insert
  to anon, authenticated
  with check (true);

drop policy if exists "participants_anon_select" on public.participants;
create policy "participants_anon_select"
  on public.participants for select
  to anon, authenticated
  using (true);

drop policy if exists "module_results_anon_insert" on public.module_results;
create policy "module_results_anon_insert"
  on public.module_results for insert
  to anon, authenticated
  with check (true);

drop policy if exists "module_results_anon_select" on public.module_results;
create policy "module_results_anon_select"
  on public.module_results for select
  to anon, authenticated
  using (true);

drop policy if exists "assessment_results_v2_anon_insert" on public.assessment_results_v2;
create policy "assessment_results_v2_anon_insert"
  on public.assessment_results_v2 for insert
  to anon, authenticated
  with check (true);

drop policy if exists "assessment_results_v2_anon_select" on public.assessment_results_v2;
create policy "assessment_results_v2_anon_select"
  on public.assessment_results_v2 for select
  to anon, authenticated
  using (true);
