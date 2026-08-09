-- REVIEW-FIRST London / GDI duplicate participant merge plan.
--
-- Default mode is DRY RUN ONLY:
--   apply_changes = false
--
-- Scope:
-- - Survivor / visible roster London:
--     1416658d-dc22-4fa3-a48d-c415d12d2a69
-- - Source / progress-bearing London:
--     9c73fe55-4c63-400f-afd2-ec5e813b42a6
--
-- Safety:
-- - Does not remove either participant row.
-- - Does not touch Horace / Blue Ribbon Results Academy.
-- - Moves only rows that point to the exact source participant id, except gallery
--   nickname ownership which is limited to the source nickname and GDI scope codes.
-- - Skips rows that would collide with existing survivor rows and reports them.

create temp table if not exists london_gdi_merge_report (
  section text not null,
  table_name text not null,
  action text not null,
  row_count integer not null default 0,
  details jsonb not null default '{}'::jsonb
) on commit drop;

truncate table london_gdi_merge_report;

do $$
declare
  apply_changes constant boolean := false;
  survivor_id constant uuid := '1416658d-dc22-4fa3-a48d-c415d12d2a69';
  source_id constant uuid := '9c73fe55-4c63-400f-afd2-ec5e813b42a6';
  survivor public.participants%rowtype;
  source public.participants%rowtype;
  source_name text;
  survivor_name text;
  source_has_pin boolean;
  survivor_has_pin boolean;
  pin_can_copy boolean;
  gallery_has_participant_id boolean;
  changed_count integer;
begin
  select *
    into survivor
  from public.participants
  where id = survivor_id;

  select *
    into source
  from public.participants
  where id = source_id;

  if survivor.id is null then
    raise exception 'Abort: survivor participant % was not found.', survivor_id;
  end if;

  if source.id is null then
    raise exception 'Abort: source participant % was not found.', source_id;
  end if;

  survivor_name := lower(concat_ws(' ', survivor.nickname, survivor.first_name, survivor.last_name));
  source_name := lower(concat_ws(' ', source.nickname, source.first_name, source.last_name));

  if survivor_name not like '%london%' then
    raise exception 'Abort: survivor participant % does not look like London. Name fields: %', survivor_id, survivor_name;
  end if;

  if source_name not like '%london%' then
    raise exception 'Abort: source participant % does not look like London. Name fields: %', source_id, source_name;
  end if;

  if survivor.program_code = 'CAMP-BLUERIBBONRESULTSACADEMY-2026'
     or source.program_code = 'CAMP-BLUERIBBONRESULTSACADEMY-2026'
     or exists (
       select 1
       from public.pilot_programs p
       where p.program_code in (survivor.program_code, source.program_code)
         and (
           p.program_code = 'CAMP-BLUERIBBONRESULTSACADEMY-2026'
           or p.program_name = 'Blue Ribbon Results Academy'
         )
     ) then
    raise exception 'Abort: refusing to touch Horace / Blue Ribbon Results Academy data.';
  end if;

  if not exists (
    select 1
    from public.pilot_programs p
    where lower(p.admin_email) = 'breonna.stills@yahoo.com'
      and p.program_name = 'GDI Camp'
      and p.program_code = 'CAMP-GDI-2026'
  ) then
    raise exception 'Abort: expected Breonna GDI Camp program row was not found.';
  end if;

  source_has_pin :=
    nullif(source.student_pin_hash, '') is not null
    or nullif(source.student_pin_fingerprint, '') is not null
    or nullif(source.student_pin_reveal_value, '') is not null;
  survivor_has_pin :=
    nullif(survivor.student_pin_hash, '') is not null
    or nullif(survivor.student_pin_fingerprint, '') is not null
    or nullif(survivor.student_pin_reveal_value, '') is not null;
  pin_can_copy :=
    source_has_pin
    and not survivor_has_pin
    and (
      nullif(source.student_pin_fingerprint, '') is null
      or not exists (
        select 1
        from public.participants p
        where p.id <> survivor_id
          and p.program_code = survivor.program_code
          and p.student_pin_fingerprint = source.student_pin_fingerprint
      )
    );

  insert into london_gdi_merge_report(section, table_name, action, row_count, details)
  values
    (
      'scope',
      'participants',
      case when apply_changes then 'APPLY MODE' else 'DRY RUN ONLY' end,
      2,
      jsonb_build_object(
        'survivor_id', survivor_id,
        'source_id', source_id,
        'survivor_program_code', survivor.program_code,
        'source_program_code', source.program_code,
        'survivor_name', survivor_name,
        'source_name', source_name,
        'source_has_pin', source_has_pin,
        'survivor_has_pin', survivor_has_pin,
        'pin_can_copy_to_survivor', pin_can_copy
      )
    );

  insert into london_gdi_merge_report(section, table_name, action, row_count, details)
  select 'dry_run', 'module_results', 'move source participant_id to survivor', count(*), '{}'::jsonb
  from public.module_results
  where participant_id = source_id;

  insert into london_gdi_merge_report(section, table_name, action, row_count, details)
  select 'dry_run', 'assessment_results_v2', 'move source participant_id to survivor', count(*), '{}'::jsonb
  from public.assessment_results_v2
  where participant_id = source_id;

  insert into london_gdi_merge_report(section, table_name, action, row_count, details)
  select 'dry_run', 'player_progress', 'move non-conflicting mission rows', count(*), '{}'::jsonb
  from public.player_progress pp
  where pp.participant_id = source_id
    and not exists (
      select 1
      from public.player_progress existing
      where existing.participant_id = survivor_id
        and existing.mission_id = pp.mission_id
    );

  insert into london_gdi_merge_report(section, table_name, action, row_count, details)
  select 'dry_run', 'player_progress', 'skip conflicting mission rows already on survivor', count(*), '{}'::jsonb
  from public.player_progress pp
  where pp.participant_id = source_id
    and exists (
      select 1
      from public.player_progress existing
      where existing.participant_id = survivor_id
        and existing.mission_id = pp.mission_id
    );

  insert into london_gdi_merge_report(section, table_name, action, row_count, details)
  select 'dry_run', 'player_badges', 'move non-conflicting badge rows', count(*), '{}'::jsonb
  from public.player_badges pb
  where pb.participant_id = source_id
    and not exists (
      select 1
      from public.player_badges existing
      where existing.participant_id = survivor_id
        and (
          (existing.mission_id = pb.mission_id and existing.badge_name = pb.badge_name)
          or existing.badge_name = pb.badge_name
        )
    );

  insert into london_gdi_merge_report(section, table_name, action, row_count, details)
  select 'dry_run', 'player_badges', 'skip conflicting badge rows already on survivor', count(*), '{}'::jsonb
  from public.player_badges pb
  where pb.participant_id = source_id
    and exists (
      select 1
      from public.player_badges existing
      where existing.participant_id = survivor_id
        and (
          (existing.mission_id = pb.mission_id and existing.badge_name = pb.badge_name)
          or existing.badge_name = pb.badge_name
        )
    );

  insert into london_gdi_merge_report(section, table_name, action, row_count, details)
  select 'dry_run', 'player_reward_claims', 'move non-conflicting reward claims', count(*), '{}'::jsonb
  from public.player_reward_claims prc
  where prc.participant_id = source_id::text
    and not exists (
      select 1
      from public.player_reward_claims existing
      where existing.participant_id = survivor_id::text
        and existing.reward_key = prc.reward_key
    );

  insert into london_gdi_merge_report(section, table_name, action, row_count, details)
  select 'dry_run', 'player_reward_claims', 'skip conflicting reward claims already on survivor', count(*), '{}'::jsonb
  from public.player_reward_claims prc
  where prc.participant_id = source_id::text
    and exists (
      select 1
      from public.player_reward_claims existing
      where existing.participant_id = survivor_id::text
        and existing.reward_key = prc.reward_key
    );

  insert into london_gdi_merge_report(section, table_name, action, row_count, details)
  select
    'dry_run',
    'player_wallets',
    case
      when not exists (select 1 from public.player_wallets where participant_id = source_id) then 'no source wallet'
      when not exists (select 1 from public.player_wallets where participant_id = survivor_id) then 'move source wallet to survivor'
      else 'survivor wallet exists; apply mode keeps max total_coins on survivor and leaves source wallet'
    end,
    count(*),
    jsonb_build_object(
      'source_total_coins', (select total_coins from public.player_wallets where participant_id = source_id),
      'survivor_total_coins', (select total_coins from public.player_wallets where participant_id = survivor_id)
    )
  from public.player_wallets
  where participant_id = source_id;

  insert into london_gdi_merge_report(section, table_name, action, row_count, details)
  select 'dry_run', 'participant_ui_state', 'move non-conflicting UI state', count(*), '{}'::jsonb
  from public.participant_ui_state ui
  where ui.participant_id = source_id
    and not exists (
      select 1
      from public.participant_ui_state existing
      where existing.participant_id = survivor_id
        and existing.state_key = ui.state_key
    );

  insert into london_gdi_merge_report(section, table_name, action, row_count, details)
  select 'dry_run', 'participant_ui_state', 'skip conflicting UI state already on survivor', count(*), '{}'::jsonb
  from public.participant_ui_state ui
  where ui.participant_id = source_id
    and exists (
      select 1
      from public.participant_ui_state existing
      where existing.participant_id = survivor_id
        and existing.state_key = ui.state_key
    );

  insert into london_gdi_merge_report(section, table_name, action, row_count, details)
  select 'dry_run', 'student_family_links', 'move non-conflicting family/camp links', count(*), '{}'::jsonb
  from public.student_family_links sfl
  where sfl.student_id = source_id
    and not exists (
      select 1
      from public.student_family_links existing
      where existing.student_id = survivor_id
        and (
          existing.family_program_code is not distinct from sfl.family_program_code
          or existing.camp_program_code is not distinct from sfl.camp_program_code
        )
    );

  insert into london_gdi_merge_report(section, table_name, action, row_count, details)
  select 'dry_run', 'student_family_links', 'skip conflicting links already on survivor', count(*), '{}'::jsonb
  from public.student_family_links sfl
  where sfl.student_id = source_id
    and exists (
      select 1
      from public.student_family_links existing
      where existing.student_id = survivor_id
        and (
          existing.family_program_code is not distinct from sfl.family_program_code
          or existing.camp_program_code is not distinct from sfl.camp_program_code
        )
    );

  insert into london_gdi_merge_report(section, table_name, action, row_count, details)
  select 'dry_run', 'student_gallery_items', 'rename source nickname gallery rows to survivor nickname in GDI scope', count(*), jsonb_build_object('source_nickname', source.nickname, 'survivor_nickname', survivor.nickname)
  from public.student_gallery_items sgi
  where nullif(source.nickname, '') is not null
    and nullif(survivor.nickname, '') is not null
    and lower(coalesce(sgi.student_nickname, '')) = lower(source.nickname)
    and sgi.program_code in ('CAMP-GDI-2026', 'CAMP-BLUERIBBON-2026', 'FAMILY-STILLS-2026')
    and lower(source.nickname) <> lower(survivor.nickname);

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'student_gallery_items'
      and column_name = 'participant_id'
  ) into gallery_has_participant_id;

  insert into london_gdi_merge_report(section, table_name, action, row_count, details)
  values (
    'dry_run',
    'student_gallery_items',
    case when gallery_has_participant_id then 'participant_id column exists; apply mode will move exact participant-owned gallery rows' else 'no participant_id column; nickname-scoped gallery ownership only' end,
    0,
    jsonb_build_object('gallery_has_participant_id', gallery_has_participant_id)
  );

  insert into london_gdi_merge_report(section, table_name, action, row_count, details)
  values (
    'dry_run',
    'participants',
    case
      when pin_can_copy then 'copy source student PIN fields to survivor because survivor is missing PIN'
      when survivor_has_pin then 'skip PIN copy because survivor already has PIN'
      when source_has_pin then 'skip PIN copy because source PIN fingerprint would collide in survivor program'
      else 'no source PIN to copy'
    end,
    case when pin_can_copy then 1 else 0 end,
    jsonb_build_object(
      'source_has_pin', source_has_pin,
      'survivor_has_pin', survivor_has_pin,
      'pin_can_copy', pin_can_copy
    )
  );

  if not apply_changes then
    insert into london_gdi_merge_report(section, table_name, action, row_count, details)
    values ('status', 'all', 'DRY RUN COMPLETE - no production rows changed', 0, '{}'::jsonb);
    return;
  end if;

  update public.participants target
  set
    student_pin_hash = source.student_pin_hash,
    student_pin_fingerprint = source.student_pin_fingerprint,
    student_pin_reveal_value = source.student_pin_reveal_value,
    student_pin_enabled = source.student_pin_enabled,
    student_pin_last_rotated_at = source.student_pin_last_rotated_at,
    updated_at = now()
  where target.id = survivor_id
    and pin_can_copy;
  get diagnostics changed_count = row_count;
  insert into london_gdi_merge_report(section, table_name, action, row_count, details)
  values ('applied', 'participants', 'copied source PIN fields to survivor when safe', changed_count, '{}'::jsonb);

  update public.module_results
  set participant_id = survivor_id
  where participant_id = source_id;
  get diagnostics changed_count = row_count;
  insert into london_gdi_merge_report(section, table_name, action, row_count, details)
  values ('applied', 'module_results', 'moved participant_id to survivor', changed_count, '{}'::jsonb);

  update public.assessment_results_v2
  set participant_id = survivor_id
  where participant_id = source_id;
  get diagnostics changed_count = row_count;
  insert into london_gdi_merge_report(section, table_name, action, row_count, details)
  values ('applied', 'assessment_results_v2', 'moved participant_id to survivor', changed_count, '{}'::jsonb);

  update public.player_progress pp
  set participant_id = survivor_id
  where pp.participant_id = source_id
    and not exists (
      select 1
      from public.player_progress existing
      where existing.participant_id = survivor_id
        and existing.mission_id = pp.mission_id
    );
  get diagnostics changed_count = row_count;
  insert into london_gdi_merge_report(section, table_name, action, row_count, details)
  values ('applied', 'player_progress', 'moved non-conflicting mission rows', changed_count, '{}'::jsonb);

  update public.player_badges pb
  set participant_id = survivor_id
  where pb.participant_id = source_id
    and not exists (
      select 1
      from public.player_badges existing
      where existing.participant_id = survivor_id
        and (
          (existing.mission_id = pb.mission_id and existing.badge_name = pb.badge_name)
          or existing.badge_name = pb.badge_name
        )
    );
  get diagnostics changed_count = row_count;
  insert into london_gdi_merge_report(section, table_name, action, row_count, details)
  values ('applied', 'player_badges', 'moved non-conflicting badge rows', changed_count, '{}'::jsonb);

  update public.player_reward_claims prc
  set participant_id = survivor_id::text
  where prc.participant_id = source_id::text
    and not exists (
      select 1
      from public.player_reward_claims existing
      where existing.participant_id = survivor_id::text
        and existing.reward_key = prc.reward_key
    );
  get diagnostics changed_count = row_count;
  insert into london_gdi_merge_report(section, table_name, action, row_count, details)
  values ('applied', 'player_reward_claims', 'moved non-conflicting reward claims', changed_count, '{}'::jsonb);

  if exists (select 1 from public.player_wallets where participant_id = source_id)
     and not exists (select 1 from public.player_wallets where participant_id = survivor_id) then
    update public.player_wallets
    set participant_id = survivor_id,
        updated_at = now()
    where participant_id = source_id;
    get diagnostics changed_count = row_count;
    insert into london_gdi_merge_report(section, table_name, action, row_count, details)
    values ('applied', 'player_wallets', 'moved source wallet to survivor', changed_count, '{}'::jsonb);
  elsif exists (select 1 from public.player_wallets where participant_id = source_id)
        and exists (select 1 from public.player_wallets where participant_id = survivor_id) then
    update public.player_wallets survivor_wallet
    set total_coins = greatest(
          survivor_wallet.total_coins,
          (select source_wallet.total_coins from public.player_wallets source_wallet where source_wallet.participant_id = source_id)
        ),
        updated_at = now()
    where survivor_wallet.participant_id = survivor_id;
    get diagnostics changed_count = row_count;
    insert into london_gdi_merge_report(section, table_name, action, row_count, details)
    values ('applied', 'player_wallets', 'kept max total_coins on survivor; source wallet row remains', changed_count, '{}'::jsonb);
  end if;

  update public.participant_ui_state ui
  set participant_id = survivor_id,
      updated_at = now()
  where ui.participant_id = source_id
    and not exists (
      select 1
      from public.participant_ui_state existing
      where existing.participant_id = survivor_id
        and existing.state_key = ui.state_key
    );
  get diagnostics changed_count = row_count;
  insert into london_gdi_merge_report(section, table_name, action, row_count, details)
  values ('applied', 'participant_ui_state', 'moved non-conflicting UI state rows', changed_count, '{}'::jsonb);

  update public.student_family_links sfl
  set student_id = survivor_id
  where sfl.student_id = source_id
    and not exists (
      select 1
      from public.student_family_links existing
      where existing.student_id = survivor_id
        and (
          existing.family_program_code is not distinct from sfl.family_program_code
          or existing.camp_program_code is not distinct from sfl.camp_program_code
        )
    );
  get diagnostics changed_count = row_count;
  insert into london_gdi_merge_report(section, table_name, action, row_count, details)
  values ('applied', 'student_family_links', 'moved non-conflicting family/camp links', changed_count, '{}'::jsonb);

  if gallery_has_participant_id then
    execute
      'update public.student_gallery_items set participant_id = $1 where participant_id = $2'
      using survivor_id, source_id;
    get diagnostics changed_count = row_count;
    insert into london_gdi_merge_report(section, table_name, action, row_count, details)
    values ('applied', 'student_gallery_items', 'moved exact participant-owned gallery rows', changed_count, '{}'::jsonb);
  end if;

  update public.student_gallery_items sgi
  set student_nickname = survivor.nickname
  where nullif(source.nickname, '') is not null
    and nullif(survivor.nickname, '') is not null
    and lower(coalesce(sgi.student_nickname, '')) = lower(source.nickname)
    and sgi.program_code in ('CAMP-GDI-2026', 'CAMP-BLUERIBBON-2026', 'FAMILY-STILLS-2026')
    and lower(source.nickname) <> lower(survivor.nickname);
  get diagnostics changed_count = row_count;
  insert into london_gdi_merge_report(section, table_name, action, row_count, details)
  values ('applied', 'student_gallery_items', 'renamed source nickname gallery rows to survivor nickname in GDI scope', changed_count, '{}'::jsonb);

  insert into london_gdi_merge_report(section, table_name, action, row_count, details)
  values ('status', 'participants', 'APPLY COMPLETE - neither participant row was removed', 2, jsonb_build_object('survivor_id', survivor_id, 'source_id', source_id));
end $$;

select *
from london_gdi_merge_report
order by
  case section
    when 'scope' then 1
    when 'dry_run' then 2
    when 'applied' then 3
    when 'status' then 4
    else 5
  end,
  table_name,
  action;
