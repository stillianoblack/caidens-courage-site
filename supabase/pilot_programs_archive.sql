-- Archive metadata for pilot programs (soft delete).
-- Archive state uses pilot_status = 'archived' (portals filter pilot_status = 'active').
-- Does NOT delete participants, assessments, module results, gallery items, or certificates.

alter table public.pilot_programs
  add column if not exists archived_at timestamptz null;

alter table public.pilot_programs
  add column if not exists archived_by text null;

comment on column public.pilot_programs.archived_at is 'When the pilot was archived (hidden from active portal unlock).';
comment on column public.pilot_programs.archived_by is 'Admin email or label that archived the pilot.';

create index if not exists pilot_programs_pilot_status_idx
  on public.pilot_programs (pilot_status);

create index if not exists pilot_programs_archived_at_idx
  on public.pilot_programs (archived_at desc nulls last)
  where archived_at is not null;

-- Admin archive/restore updates (anon client used by Admin Portal).
drop policy if exists "pilot_programs_anon_update" on public.pilot_programs;
create policy "pilot_programs_anon_update"
  on public.pilot_programs for update
  to anon, authenticated
  using (true)
  with check (true);
