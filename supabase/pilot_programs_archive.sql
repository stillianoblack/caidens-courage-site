-- Archive metadata for pilot programs.
-- Archive state uses existing pilot_status = 'archived' (active portals already filter pilot_status = 'active').

alter table public.pilot_programs
  add column if not exists archived_at timestamptz null;

alter table public.pilot_programs
  add column if not exists archived_by text null;

comment on column public.pilot_programs.archived_at is 'When the pilot was archived (hidden from active portal unlock).';
comment on column public.pilot_programs.archived_by is 'Admin email or label that archived the pilot.';
