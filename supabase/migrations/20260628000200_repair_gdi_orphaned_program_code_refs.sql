-- Report-first repair for Breonna's GDI pilot orphaned program-code references.
--
-- Root cause:
-- - pilot_programs.program_code was changed from CAMP-BLUERIBBON-2026 to
--   CAMP-GDI-2026 without propagating dependent references.
--
-- Scope:
-- - Repairs only rows that still reference CAMP-BLUERIBBON-2026.
-- - Requires the current target pilot to be exactly Breonna's GDI Camp row.
-- - Aborts if any active pilot row still owns CAMP-BLUERIBBON-2026.
-- - Does not touch Horace / Blue Ribbon Results Academy codes.
-- - Does not touch CAMP-BLUERIBBONRESULTSACADEMY-2026.
-- - Does not create legacy aliases.
-- - Preserves participant ids, student PINs, parent claims, rewards, badges,
--   assessments, progress, and independent family scopes.
-- - student_family_links.family_program_code is updated only by the transaction
--   function when it literally equals CAMP-BLUERIBBON-2026.
--
-- Prerequisite:
-- - Run 20260628000100_pilot_program_code_transaction.sql first.

do $$
declare
  apply_changes constant boolean := true;
  target_count integer;
  old_owner_count integer;
  protected_count integer;
  participants_count integer;
  family_link_count integer;
  repair_result jsonb;
begin
  select count(*)
    into target_count
  from public.pilot_programs
  where lower(admin_email) = 'breonna.stills@yahoo.com'
    and program_name = 'GDI Camp'
    and program_code = 'CAMP-GDI-2026';

  if target_count <> 1 then
    raise exception 'Refusing GDI orphan repair: expected exactly one Breonna GDI Camp target, found %.', target_count;
  end if;

  select count(*)
    into old_owner_count
  from public.pilot_programs
  where program_code = 'CAMP-BLUERIBBON-2026';

  if old_owner_count <> 0 then
    raise exception 'Refusing GDI orphan repair: CAMP-BLUERIBBON-2026 is still owned by a pilot_programs row.';
  end if;

  select count(*)
    into protected_count
  from public.pilot_programs
  where program_name = 'Blue Ribbon Results Academy'
     or program_code = 'CAMP-BLUERIBBONRESULTSACADEMY-2026';

  if protected_count > 0 then
    raise notice 'Blue Ribbon Results Academy rows found and excluded from this repair: %.', protected_count;
  end if;

  select count(*)
    into participants_count
  from public.participants
  where program_code = 'CAMP-BLUERIBBON-2026';

  select count(*)
    into family_link_count
  from public.student_family_links
  where camp_program_code = 'CAMP-BLUERIBBON-2026';

  raise notice 'Breonna GDI orphan repair report: participants.program_code rows = %, student_family_links.camp_program_code rows = %.',
    participants_count,
    family_link_count;

  if not apply_changes then
    raise notice 'Report only. Set apply_changes to true after review to run rename_pilot_program_transaction.';
    return;
  end if;

  repair_result := public.rename_pilot_program_transaction(
    'CAMP-BLUERIBBON-2026',
    'CAMP-GDI-2026'
  );

  raise notice 'Breonna GDI orphan repair result: %', repair_result;
end $$;

-- Verification. Before apply, the first two counts may be non-zero.
-- After apply_changes = true runs successfully, participants_still_on_old_code
-- and family_links_still_on_old_code should both be 0.
select
  (
    select count(*)
    from public.participants
    where program_code = 'CAMP-BLUERIBBON-2026'
  ) as participants_still_on_old_code,
  (
    select count(*)
    from public.student_family_links
    where camp_program_code = 'CAMP-BLUERIBBON-2026'
  ) as family_links_still_on_old_code,
  (
    select count(*)
    from public.pilot_programs
    where lower(admin_email) = 'breonna.stills@yahoo.com'
      and program_name = 'GDI Camp'
      and program_code = 'CAMP-GDI-2026'
  ) as gdi_target_count,
  (
    select count(*)
    from public.pilot_programs
    where program_code = 'CAMP-BLUERIBBON-2026'
  ) as old_code_still_owned_by_program;
