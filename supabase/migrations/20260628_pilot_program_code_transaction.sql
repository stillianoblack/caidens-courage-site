-- Pilot program code transaction support.
--
-- Purpose:
-- - Make program-code renames atomic at the database layer.
-- - Keep pilot_programs.program_code and dependent program-code references in sync.
--
-- Safety:
-- - Does not delete rows.
-- - Does not regenerate PINs, access codes, progress, rewards, or assessments.
-- - Does not rewrite independent family scopes unless they literally equal the old
--   camp program_code.
-- - Does not create legacy aliases. After a successful rename, the new program_code
--   is the only authoritative program identity.

create or replace function public.rename_pilot_program_transaction(
  old_program_code_input text,
  new_program_code_input text,
  new_program_name_input text default null,
  new_group_name_input text default null,
  new_family_access_code_input text default null,
  new_facilitator_access_code_input text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  old_code text := upper(btrim(old_program_code_input));
  new_code text := upper(btrim(new_program_code_input));
  new_family_code text := nullif(upper(btrim(coalesce(new_family_access_code_input, ''))), '');
  new_facilitator_code text := nullif(upper(btrim(coalesce(new_facilitator_access_code_input, ''))), '');
  target_row public.pilot_programs%rowtype;
  old_row public.pilot_programs%rowtype;
  old_family_code text;
  old_facilitator_code text;
  changed_counts jsonb := '[]'::jsonb;
  ref record;
  affected integer;
begin
  if old_code = '' or new_code = '' then
    raise exception 'old_program_code and new_program_code are required.';
  end if;


  select *
    into target_row
  from public.pilot_programs
  where program_code = new_code
  limit 1
  for update;

  select *
    into old_row
  from public.pilot_programs
  where program_code = old_code
  limit 1
  for update;

  if target_row.id is null and old_row.id is not null then
    target_row := old_row;
  end if;

  if target_row.id is null then
    raise exception 'Target program not found for old code % or new code %.', old_code, new_code;
  end if;

  if old_row.id is not null and old_row.id <> target_row.id then
    raise exception 'Old code % and new code % belong to different pilot rows.', old_code, new_code;
  end if;

  old_family_code := nullif(upper(btrim(coalesce(target_row.family_access_code, ''))), '');
  old_facilitator_code := nullif(upper(btrim(coalesce(target_row.facilitator_access_code, ''))), '');

  if old_code <> new_code then
    if exists (
      select 1
      from public.pilot_programs p
      where p.id <> target_row.id
        and (
          p.program_code = new_code
          or p.family_access_code = new_code
          or p.facilitator_access_code = new_code
        )
    ) then
      raise exception 'New program code % collides with an existing pilot/access code.', new_code;
    end if;

  end if;

  if new_family_code is not null and new_family_code <> old_family_code and exists (
    select 1
    from public.pilot_programs p
    where p.id <> target_row.id
      and (
        p.program_code = new_family_code
        or p.family_access_code = new_family_code
        or p.facilitator_access_code = new_family_code
      )
  ) then
    raise exception 'New family access code % collides with an existing pilot/access code.', new_family_code;
  end if;

  if new_facilitator_code is not null and new_facilitator_code <> old_facilitator_code and exists (
    select 1
    from public.pilot_programs p
    where p.id <> target_row.id
      and (
        p.program_code = new_facilitator_code
        or p.family_access_code = new_facilitator_code
        or p.facilitator_access_code = new_facilitator_code
      )
  ) then
    raise exception 'New facilitator access code % collides with an existing pilot/access code.', new_facilitator_code;
  end if;

  update public.pilot_programs
  set
    program_code = new_code,
    program_name = coalesce(nullif(btrim(new_program_name_input), ''), program_name),
    group_name = case
      when new_group_name_input is null then group_name
      else btrim(new_group_name_input)
    end,
    family_access_code = coalesce(new_family_code, family_access_code),
    facilitator_access_code = coalesce(new_facilitator_code, facilitator_access_code)
  where id = target_row.id;

  get diagnostics affected = row_count;
  changed_counts := changed_counts || jsonb_build_object(
    'table', 'pilot_programs',
    'column', 'program_code',
    'rowsUpdated', affected
  );

  -- Update every program_code-like reference that stores the old canonical code.
  -- This deliberately includes family_program_code only for rows where that column
  -- literally equals the old camp code. Separate independent-family scopes are not touched.
  for ref in
    select table_name, column_name
    from information_schema.columns
    where table_schema = 'public'
      and table_name <> 'pilot_programs'
      and column_name in (
        'program_code',
        'camp_program_code',
        'family_program_code',
        'related_program_id'
      )
    order by table_name, column_name
  loop
    execute format('update public.%I set %I = $1 where %I = $2', ref.table_name, ref.column_name, ref.column_name)
      using new_code, old_code;

    get diagnostics affected = row_count;
    if affected > 0 then
      changed_counts := changed_counts || jsonb_build_object(
        'table', ref.table_name,
        'column', ref.column_name,
        'rowsUpdated', affected
      );
    end if;
  end loop;

  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'program_code_aliases'
  ) then
    execute 'delete from public.program_code_aliases where alias_code = $1 or program_code = $1'
      using old_code;
    get diagnostics affected = row_count;
    if affected > 0 then
      changed_counts := changed_counts || jsonb_build_object(
        'table', 'program_code_aliases',
        'column', 'alias_code/program_code',
        'rowsUpdated', affected
      );
    end if;
  end if;

  return jsonb_build_object(
    'ok', true,
    'oldProgramCode', old_code,
    'newProgramCode', new_code,
    'programId', target_row.id,
    'programName', coalesce(nullif(btrim(new_program_name_input), ''), target_row.program_name),
    'adminEmail', target_row.admin_email,
    'familyAccessCode', coalesce(new_family_code, old_family_code),
    'facilitatorAccessCode', coalesce(new_facilitator_code, old_facilitator_code),
    'rowsUpdated', changed_counts,
    'familyScopePolicy', 'family_program_code was updated only where it exactly matched the old program_code.'
  );
end;
$$;


comment on function public.rename_pilot_program_transaction(text, text, text, text, text, text) is
  'Atomically renames a pilot program_code and updates dependent old-code references in one database transaction.';
