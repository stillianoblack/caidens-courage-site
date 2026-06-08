-- Allow participant identity rows to be updated when a returning student completes assessments.
-- Run after pilot_tracking_setup.sql.

drop policy if exists "participants_anon_update" on public.participants;
create policy "participants_anon_update"
  on public.participants for update
  to anon, authenticated
  using (true)
  with check (true);
