-- Pilot program protection levels.
--
-- Additive only:
-- - Adds pilot_programs.protection_level.
-- - Defaults all existing programs to testing.
-- - Does not rename, delete, or mutate program_code, family_access_code,
--   facilitator_access_code, Blue Ribbon Results Academy data, participants, or results.
-- - No program names, admin emails, or program codes are hardcoded into protection behavior.

alter table public.pilot_programs
  add column if not exists protection_level text;

update public.pilot_programs
set protection_level = 'testing'
where protection_level is null;

alter table public.pilot_programs
  alter column protection_level set default 'testing';

alter table public.pilot_programs
  alter column protection_level set not null;

alter table public.pilot_programs
  drop constraint if exists pilot_programs_protection_level_check;

alter table public.pilot_programs
  add constraint pilot_programs_protection_level_check
  check (protection_level in ('testing', 'internal', 'pilot', 'production'));

comment on column public.pilot_programs.protection_level is
  'Data-driven admin safety level controlling archive/delete/code-regeneration/portal-type changes.';

-- Verification:
-- select program_name, admin_email, program_code, family_access_code, facilitator_access_code, protection_level
-- from public.pilot_programs
-- order by created_at desc;
