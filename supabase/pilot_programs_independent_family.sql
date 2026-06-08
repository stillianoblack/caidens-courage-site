-- Independent Family program type support
-- Run in Supabase SQL editor after pilot_programs_setup.sql.
--
-- Stores:
--   program_type = 'independent_family'
--   program_code = 'FAMILY-XXXX-2026'
--   family_access_code = 'FAMILY-XXXX-2026-FAMILY'
--   facilitator_access_code = NULL

alter table public.pilot_programs
  alter column facilitator_access_code drop not null;

comment on column public.pilot_programs.program_type is
  'Program category. Use independent_family for single-family purchases without a facilitator portal.';

comment on column public.pilot_programs.pricing_tier is
  'Billing tier key. independent_family reserved for future $149/year family subscriptions.';

comment on column public.pilot_programs.facilitator_access_code is
  'Facilitator login code. NULL for independent_family programs.';

-- Migrate legacy internal sentinel values to NULL.
update public.pilot_programs
set facilitator_access_code = null
where program_type = 'independent_family'
  and facilitator_access_code like '%-INTERNAL-NO-FACILITATOR';
