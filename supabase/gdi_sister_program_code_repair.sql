-- GDI sister/test pilot code repair.
--
-- Purpose:
-- - Rename only Breonna's/sister GDI test pilot away from Blue Ribbon-facing codes.
-- - Preserve the same pilot row id and move program-code references so existing
--   participant, family link, progress, assessment, reward, and gallery data stays
--   connected.
-- - Do not touch Horace / Blue Ribbon Results Academy rows.
--
-- Safety model:
-- - Dry-run report is always shown first.
-- - The apply block is disabled by default. To execute after reviewing the dry-run,
--   change `apply_changes` from false to true inside the DO block.
-- - The apply block refuses to run unless exactly one target row is identified with
--   admin_email = breonna.stills@yahoo.com AND program_name = GDI Camp.
-- - The apply block refuses to run if the generated codes collide with pilot_programs
--   or program_code_aliases.
-- - This script intentionally does not alias any CAMP-BLUERIBBONRESULTSACADEMY-2026,
--   CAMP-BLUERIBBONAB-2026, or Blue Ribbon Results Academy code to GDI.

begin;

-- DRY-RUN REPORT
-- 1. exact program row being changed
-- 2. exact old codes
-- 3. exact new-code preview with unique suffix candidate
-- 4. participant/family-link/reference counts affected
-- 5. confirmation that Horace / Blue Ribbon Results Academy rows are outside scope
with target_candidates as (
  select p.*
  from public.pilot_programs p
  where lower(p.admin_email) = 'breonna.stills@yahoo.com'
    and p.program_name = 'GDI Camp'
    and p.program_code not in (
      'CAMP-BLUERIBBONRESULTSACADEMY-2026',
      'CAMP-BLUERIBBONAB-2026'
    )
    and p.program_name <> 'Blue Ribbon Results Academy'
),
target as (
  select *
  from target_candidates
  order by created_at desc nulls last
),
target_count as (
  select count(*)::integer as row_count from target
),
suffix_preview as (
  select upper(substr(encode(gen_random_bytes(3), 'hex'), 1, 4)) as suffix
),
selected as (
  select
    t.*,
    s.suffix,
    'CAMP-GDI-2026-' || s.suffix as new_program_code,
    'FAM-GDI-2026-' || s.suffix as new_family_access_code,
    'FAC-GDI-2026-' || s.suffix as new_facilitator_access_code
  from target t
  cross join suffix_preview s
  where (select row_count from target_count) = 1
),
protected_scope as (
  select count(*)::integer as protected_rows_found
  from public.pilot_programs p
  where p.program_code in (
      'CAMP-BLUERIBBONRESULTSACADEMY-2026',
      'CAMP-BLUERIBBONAB-2026'
    )
    or p.program_name = 'Blue Ribbon Results Academy'
)
select
  'DRY_RUN' as report_type,
  target_count.row_count as target_row_count,
  case
    when target_count.row_count = 1 then 'OK: exactly one target row identified with Breonna admin email and GDI Camp display name.'
    when target_count.row_count = 0 then 'STOP: no target row found with both Breonna admin email and GDI Camp display name.'
    else 'STOP: multiple candidate rows found.'
  end as target_status,
  selected.id as target_program_id,
  selected.admin_email as target_admin_email,
  selected.program_name as before_display_name,
  'GDI Camp' as after_display_name,
  selected.group_name as before_group_name,
  'Morning Group' as after_group_name,
  selected.program_code as old_program_code,
  selected.new_program_code,
  selected.family_access_code as old_family_access_code,
  selected.new_family_access_code,
  selected.facilitator_access_code as old_facilitator_access_code,
  selected.new_facilitator_access_code,
  case when target_count.row_count = 1 then (select count(*) from public.participants x where x.program_code = selected.program_code) end as participants,
  case when target_count.row_count = 1 then (select count(*) from public.student_family_links x where x.camp_program_code = selected.program_code) end as student_family_links_camp,
  case when target_count.row_count = 1 then (select count(*) from public.student_family_links x where x.family_program_code = selected.program_code) end as student_family_links_family,
  case when target_count.row_count = 1 then (select count(*) from public.module_results x where x.program_code = selected.program_code) end as module_results,
  case when target_count.row_count = 1 then (select count(*) from public.assessment_results_v2 x where x.program_code = selected.program_code) end as assessment_results_v2,
  case when target_count.row_count = 1 then (select count(*) from public.assessment_results x where x.program_code = selected.program_code) end as assessment_results,
  case when target_count.row_count = 1 then (select count(*) from public.question_attempts x where x.program_code = selected.program_code) end as question_attempts,
  case when target_count.row_count = 1 then (select count(*) from public.student_gallery_items x where x.program_code = selected.program_code) end as student_gallery_items,
  case when target_count.row_count = 1 then (select count(*) from public.program_goals x where x.program_code = selected.program_code) end as program_goals,
  case when target_count.row_count = 1 then (select count(*) from public.family_child_goals x where x.family_program_code = selected.program_code) end as family_child_goals,
  case when target_count.row_count = 1 then (select count(*) from public.kid_play_sessions x where x.organization_id = selected.id) end as kid_play_sessions_by_program_id,
  protected_scope.protected_rows_found as blue_ribbon_rows_found_but_not_targeted,
  'Horace / Blue Ribbon Results Academy selector excluded from target scope.' as blue_ribbon_confirmation
from target_count
cross join protected_scope
left join selected on true;

-- APPLY BLOCK
do $$
declare
  apply_changes constant boolean := false;
  target_row public.pilot_programs%rowtype;
  target_count integer;
  old_program_code text;
  old_family_access_code text;
  old_facilitator_access_code text;
  suffix text;
  new_program_code text;
  new_family_access_code text;
  new_facilitator_access_code text;
  updated_count integer;
begin
  if not apply_changes then
    raise notice 'DRY RUN ONLY: set apply_changes to true after reviewing the report to apply this repair.';
    return;
  end if;

  if not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'program_code_aliases'
  ) then
    raise exception 'program_code_aliases is required. Run program_code_aliases_and_unique_access_codes.sql first.';
  end if;

  select count(*)
    into target_count
  from public.pilot_programs p
  where lower(p.admin_email) = 'breonna.stills@yahoo.com'
    and p.program_name = 'GDI Camp'
    and p.program_code not in (
      'CAMP-BLUERIBBONRESULTSACADEMY-2026',
      'CAMP-BLUERIBBONAB-2026'
    )
    and p.program_name <> 'Blue Ribbon Results Academy';

  if target_count <> 1 then
    raise exception 'Refusing to apply: expected exactly one row with Breonna admin email and GDI Camp display name, found %.', target_count;
  end if;

  select *
    into target_row
  from public.pilot_programs p
  where lower(p.admin_email) = 'breonna.stills@yahoo.com'
    and p.program_name = 'GDI Camp'
    and p.program_code not in (
      'CAMP-BLUERIBBONRESULTSACADEMY-2026',
      'CAMP-BLUERIBBONAB-2026'
    )
    and p.program_name <> 'Blue Ribbon Results Academy'
  limit 1
  for update;

  old_program_code := target_row.program_code;
  old_family_access_code := target_row.family_access_code;
  old_facilitator_access_code := nullif(btrim(coalesce(target_row.facilitator_access_code, '')), '');

  if exists (
    select 1
    from public.program_code_aliases a
    where a.program_code = old_program_code
  ) then
    raise exception 'Refusing to apply: existing aliases currently reference the old program_code. Resolve those aliases before renaming the canonical code.';
  end if;

  loop
    suffix := upper(substr(encode(gen_random_bytes(3), 'hex'), 1, 4));
    new_program_code := 'CAMP-GDI-2026-' || suffix;
    new_family_access_code := 'FAM-GDI-2026-' || suffix;
    new_facilitator_access_code := 'FAC-GDI-2026-' || suffix;

    exit when not exists (
      select 1
      from public.pilot_programs p
      where p.program_code in (new_program_code, new_family_access_code, new_facilitator_access_code)
         or p.family_access_code in (new_program_code, new_family_access_code, new_facilitator_access_code)
         or p.facilitator_access_code in (new_program_code, new_family_access_code, new_facilitator_access_code)
    )
    and not exists (
      select 1
      from public.program_code_aliases a
      where a.alias_code in (new_program_code, new_family_access_code, new_facilitator_access_code)
    );
  end loop;

  if old_program_code in (
    'CAMP-BLUERIBBONRESULTSACADEMY-2026',
    'CAMP-BLUERIBBONAB-2026'
  ) or target_row.program_name = 'Blue Ribbon Results Academy' then
    raise exception 'Refusing to modify Horace / Blue Ribbon Results Academy code %.', old_program_code;
  end if;

  update public.pilot_programs
  set
    program_name = 'GDI Camp',
    group_name = 'Morning Group',
    program_code = new_program_code,
    family_access_code = new_family_access_code,
    facilitator_access_code = new_facilitator_access_code
  where id = target_row.id
    and program_code = old_program_code;

  get diagnostics updated_count = row_count;
  if updated_count <> 1 then
    raise exception 'Selected GDI pilot update failed; expected 1 row, updated %.', updated_count;
  end if;

  update public.participants
  set program_code = new_program_code,
      program_name = 'GDI Camp',
      group_name = 'Morning Group'
  where program_code = old_program_code;

  update public.module_results
  set program_code = new_program_code,
      program_name = 'GDI Camp',
      group_name = 'Morning Group'
  where program_code = old_program_code;

  update public.assessment_results_v2
  set program_code = new_program_code,
      program_name = 'GDI Camp',
      group_name = 'Morning Group'
  where program_code = old_program_code;

  update public.assessment_results
  set program_code = new_program_code,
      program_name = 'GDI Camp',
      group_name = 'Morning Group'
  where program_code = old_program_code;

  update public.student_gallery_items
  set program_code = new_program_code,
      group_name = 'Morning Group'
  where program_code = old_program_code;

  update public.question_attempts
  set program_code = new_program_code
  where program_code = old_program_code;

  update public.program_goals
  set program_code = new_program_code
  where program_code = old_program_code;

  update public.family_child_goals
  set family_program_code = new_program_code
  where family_program_code = old_program_code;

  update public.student_family_links
  set camp_program_code = new_program_code
  where camp_program_code = old_program_code;

  update public.student_family_links
  set family_program_code = new_program_code
  where family_program_code = old_program_code;

  if old_program_code is not null then
    insert into public.program_code_aliases (program_id, program_code, alias_code, alias_type, created_by)
    values (target_row.id, new_program_code, old_program_code, 'legacy-program', 'gdi-sister-code-repair')
    on conflict (alias_code) do update
    set program_id = excluded.program_id,
        program_code = excluded.program_code,
        alias_type = excluded.alias_type,
        created_by = excluded.created_by;
  end if;

  if old_family_access_code is not null then
    insert into public.program_code_aliases (program_id, program_code, alias_code, alias_type, created_by)
    values (target_row.id, new_program_code, old_family_access_code, 'legacy-family-access', 'gdi-sister-code-repair')
    on conflict (alias_code) do update
    set program_id = excluded.program_id,
        program_code = excluded.program_code,
        alias_type = excluded.alias_type,
        created_by = excluded.created_by;
  end if;

  if old_facilitator_access_code is not null then
    insert into public.program_code_aliases (program_id, program_code, alias_code, alias_type, created_by)
    values (target_row.id, new_program_code, old_facilitator_access_code, 'legacy-facilitator-access', 'gdi-sister-code-repair')
    on conflict (alias_code) do update
    set program_id = excluded.program_id,
        program_code = excluded.program_code,
        alias_type = excluded.alias_type,
        created_by = excluded.created_by;
  end if;

  raise notice 'Applied GDI sister/test pilot repair for program id %.', target_row.id;
  raise notice 'Old program code: %, new program code: %', old_program_code, new_program_code;
  raise notice 'Old family access code: %, new family access code: %', old_family_access_code, new_family_access_code;
  raise notice 'Old facilitator access code: %, new facilitator access code: %', old_facilitator_access_code, new_facilitator_access_code;
end $$;

commit;
