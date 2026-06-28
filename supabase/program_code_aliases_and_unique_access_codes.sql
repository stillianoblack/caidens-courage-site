-- Program identity/access-code hardening.
--
-- Rollback-safe/additive deployment notes:
-- - This migration does not rename, overwrite, update, delete, or backfill existing
--   pilot_programs.program_code, family_access_code, facilitator_access_code, or
--   participants.family_claim_code values.
-- - It creates uniqueness guards that should already match the original table
--   contract, then adds program_code_aliases as a compatibility lookup table.
-- - Alias rows map an old/alternate code to an existing canonical program row.
--   The old code remains an alias only; the canonical program_code stays unchanged.
-- - This base migration intentionally does not seed ambiguous Blue Ribbon/GDI aliases.
--   Use a selected-program repair migration when a specific pilot row must be renamed.
-- - If duplicate production data exists, the preflight blocks raise an exception
--   before any unique index is created. Resolve duplicates manually, then rerun.

do $$
begin
  if exists (
    select 1
    from public.pilot_programs
    where program_code is not null
    group by program_code
    having count(*) > 1
  ) then
    raise exception 'Preflight failed: duplicate pilot_programs.program_code values exist.';
  end if;

  if exists (
    select 1
    from public.pilot_programs
    where family_access_code is not null
    group by family_access_code
    having count(*) > 1
  ) then
    raise exception 'Preflight failed: duplicate pilot_programs.family_access_code values exist.';
  end if;

  if exists (
    select 1
    from public.pilot_programs
    where facilitator_access_code is not null
    group by facilitator_access_code
    having count(*) > 1
  ) then
    raise exception 'Preflight failed: duplicate pilot_programs.facilitator_access_code values exist.';
  end if;

  if exists (
    select 1
    from public.participants
    where family_claim_code is not null
    group by family_claim_code
    having count(*) > 1
  ) then
    raise exception 'Preflight failed: duplicate participants.family_claim_code values exist.';
  end if;
end $$;

create unique index if not exists pilot_programs_program_code_unique
  on public.pilot_programs (program_code);

create unique index if not exists pilot_programs_family_access_code_unique
  on public.pilot_programs (family_access_code);

create unique index if not exists pilot_programs_facilitator_access_code_unique
  on public.pilot_programs (facilitator_access_code)
  where facilitator_access_code is not null;

create unique index if not exists participants_family_claim_code_unique
  on public.participants (family_claim_code)
  where family_claim_code is not null;

create table if not exists public.program_code_aliases (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references public.pilot_programs (id),
  program_code text not null references public.pilot_programs (program_code),
  alias_code text not null unique,
  alias_type text not null default 'legacy',
  created_at timestamptz not null default now(),
  created_by text
);

create index if not exists program_code_aliases_program_code_idx
  on public.program_code_aliases (program_code);

create index if not exists program_code_aliases_program_id_idx
  on public.program_code_aliases (program_id);

alter table public.program_code_aliases enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'program_code_aliases'
      and policyname = 'program_code_aliases_anon_select'
  ) then
    create policy "program_code_aliases_anon_select"
      on public.program_code_aliases for select
      using (true);
  end if;
end $$;

-- Live verification queries to run after deployment:
-- 1. Confirm the alias table exists without changing pilot_programs code values.
-- select table_name
-- from information_schema.tables
-- where table_schema = 'public'
--   and table_name = 'program_code_aliases';
--
-- 2. Confirm existing Blue Ribbon facilitator/family codes still resolve directly.
-- with canonical as (
--   select *
--   from public.pilot_programs
--   where program_code = 'CAMP-BLUERIBBONAB-2026'
--   limit 1
-- ),
-- input_codes as (
--   select 'existing_family_code' as scenario, family_access_code as access_code from canonical
--   union all
--   select 'existing_facilitator_code', facilitator_access_code from canonical
-- ),
-- resolved as (
--   select
--     i.scenario,
--     i.access_code,
--     coalesce(direct.program_code, alias.program_code) as resolved_program_code,
--     case when direct.program_code is not null then 'direct' else 'alias' end as resolution_source
--   from input_codes i
--   left join public.pilot_programs direct
--     on i.access_code in (
--       direct.program_code,
--       direct.family_access_code,
--       direct.facilitator_access_code
--     )
--   left join public.program_code_aliases alias
--     on alias.alias_code = i.access_code
-- )
-- select *
-- from resolved
-- where resolved_program_code = 'CAMP-BLUERIBBONAB-2026';
--
-- 3. Confirm no duplicate values exist under the new unique constraints.
-- select 'program_code' as field, program_code as value, count(*)
-- from public.pilot_programs
-- group by program_code
-- having count(*) > 1
-- union all
-- select 'family_access_code', family_access_code, count(*)
-- from public.pilot_programs
-- group by family_access_code
-- having count(*) > 1
-- union all
-- select 'facilitator_access_code', facilitator_access_code, count(*)
-- from public.pilot_programs
-- where facilitator_access_code is not null
-- group by facilitator_access_code
-- having count(*) > 1
-- union all
-- select 'family_claim_code', family_claim_code, count(*)
-- from public.participants
-- where family_claim_code is not null
-- group by family_claim_code
-- having count(*) > 1;
--
-- 4. New program code generation is app-side. Verify with unit tests:
-- npm test -- --watchAll=false --runTestsByPath src/lib/__tests__/portalCodeIdentity.test.ts
