-- Production-specific Auth ownership boundary for legacy portal tables.
--
-- This migration is intentionally tied to the sanitized production policy inventory
-- captured on 2026-07-16. It must be rehearsed against a fresh production-shaped
-- clone before approval. It must never be substituted with the staging migration.
--
-- Reads: authenticated users with explicit portal ownership only.
-- Writes: service-role/server pathways only.

do $$
declare
  target record;
  actual_policies text[];
  expected_policies text[];
begin
  if to_regprocedure('private.portal_can_access_program_id(uuid)') is null
    or to_regprocedure('private.portal_can_access_program_code(text)') is null
    or to_regprocedure('private.portal_can_access_participant(uuid,text)') is null
    or to_regprocedure('private.portal_can_access_participant_text(text)') is null
  then
    raise exception 'Required portal ownership helpers are missing; stop production RLS migration.';
  end if;

  for target in
    select * from (values
      ('assessment_results', array[
        'Allow anon select assessment results"',
        'Allow public assessment adult insert',
        'Allow public assessment adult read',
        'Allow public assessment inserts',
        'assessment_results_anon_insert',
        'assessment_results_anon_select'
      ]::text[]),
      ('assessment_results_v2', array[
        'Allow public assessment result inserts',
        'Allow public assessment result reads',
        'assessment_results_v2_anon_insert',
        'assessment_results_v2_anon_select'
      ]::text[]),
      ('family_child_goals', array[
        'family_child_goals_anon_insert',
        'family_child_goals_anon_select',
        'family_child_goals_anon_update'
      ]::text[]),
      ('kid_play_sessions', array[
        'kid_play_sessions_anon_insert',
        'kid_play_sessions_anon_select',
        'kid_play_sessions_anon_update'
      ]::text[]),
      ('module_results', array[
        'Allow public module result inserts',
        'Allow public module result reads',
        'module_results_anon_insert',
        'module_results_anon_select'
      ]::text[]),
      ('participant_ui_state', array[
        'participant_ui_state_anon_insert',
        'participant_ui_state_anon_select',
        'participant_ui_state_anon_update'
      ]::text[]),
      ('participants', array[
        'Allow public participant inserts',
        'Allow public participant reads',
        'participants_anon_insert',
        'participants_anon_select',
        'participants_anon_update'
      ]::text[]),
      ('pilot_programs', array[
        'Allow public pilot program inserts',
        'Allow public pilot program reads',
        'pilot_programs_anon_insert',
        'pilot_programs_anon_select',
        'pilot_programs_anon_update'
      ]::text[]),
      ('player_badges', array[
        'Users can insert their own badges',
        'Users can read their own badges',
        'player_badges_anon_insert',
        'player_badges_anon_select'
      ]::text[]),
      ('player_progress', array[
        'Users can insert their own progress',
        'Users can read their own progress',
        'player_progress_anon_insert',
        'player_progress_anon_select'
      ]::text[]),
      ('player_reward_claims', array[
        'player_reward_claims_anon_all'
      ]::text[]),
      ('player_wallets', array[
        'Users can insert their own wallet',
        'Users can read their own wallet',
        'Users can update their own wallet',
        'player_wallets_anon_insert',
        'player_wallets_anon_select',
        'player_wallets_anon_update'
      ]::text[]),
      ('program_goals', array[
        'Allow pilot program goals access',
        'program_goals_anon_insert',
        'program_goals_anon_select',
        'program_goals_anon_update'
      ]::text[]),
      ('question_attempts', array[]::text[]),
      ('student_family_links', array[
        'student_family_links_anon_insert',
        'student_family_links_anon_select',
        'student_family_links_anon_update'
      ]::text[]),
      ('student_gallery_items', array[
        'anon insert student gallery items',
        'anon select student gallery items',
        'anon update student gallery items'
      ]::text[])
    ) as inventory(table_name, policy_names)
  loop
    if to_regclass(format('public.%I', target.table_name)) is null then
      raise exception 'Required production table public.% is missing.', target.table_name;
    end if;

    if not exists (
      select 1
      from pg_class relation
      join pg_namespace namespace on namespace.oid = relation.relnamespace
      where namespace.nspname = 'public'
        and relation.relname = target.table_name
        and relation.relrowsecurity
    ) then
      raise exception 'RLS is not enabled on public.%; stop migration.', target.table_name;
    end if;

    select coalesce(array_agg(policyname order by policyname), array[]::text[])
      into actual_policies
    from pg_policies
    where schemaname = 'public' and tablename = target.table_name;

    select coalesce(array_agg(policy_name order by policy_name), array[]::text[])
      into expected_policies
    from unnest(target.policy_names) as expected(policy_name);

    if actual_policies is distinct from expected_policies then
      raise exception 'Policy inventory drift on public.%; stop and regenerate migration.', target.table_name;
    end if;

    if not has_table_privilege('anon', format('public.%I', target.table_name), 'select')
      or not has_table_privilege('anon', format('public.%I', target.table_name), 'insert')
      or not has_table_privilege('anon', format('public.%I', target.table_name), 'update')
      or not has_table_privilege('anon', format('public.%I', target.table_name), 'delete')
      or not has_table_privilege('authenticated', format('public.%I', target.table_name), 'select')
      or not has_table_privilege('authenticated', format('public.%I', target.table_name), 'insert')
      or not has_table_privilege('authenticated', format('public.%I', target.table_name), 'update')
      or not has_table_privilege('authenticated', format('public.%I', target.table_name), 'delete')
      or not has_table_privilege('service_role', format('public.%I', target.table_name), 'select')
      or not has_table_privilege('service_role', format('public.%I', target.table_name), 'insert')
      or not has_table_privilege('service_role', format('public.%I', target.table_name), 'update')
      or not has_table_privilege('service_role', format('public.%I', target.table_name), 'delete')
    then
      raise exception 'Privilege inventory drift on public.%; stop and regenerate migration.', target.table_name;
    end if;
  end loop;
end
$$;

do $$
declare
  target_table text;
  existing_policy record;
begin
  foreach target_table in array array[
    'assessment_results',
    'assessment_results_v2',
    'family_child_goals',
    'kid_play_sessions',
    'module_results',
    'participant_ui_state',
    'participants',
    'pilot_programs',
    'player_badges',
    'player_progress',
    'player_reward_claims',
    'player_wallets',
    'program_goals',
    'question_attempts',
    'student_family_links',
    'student_gallery_items'
  ]
  loop
    for existing_policy in
      select policyname
      from pg_policies
      where schemaname = 'public' and tablename = target_table
    loop
      execute format(
        'drop policy %I on public.%I',
        existing_policy.policyname,
        target_table
      );
    end loop;

    execute format('revoke all on table public.%I from public, anon, authenticated', target_table);
    execute format('grant select on table public.%I to authenticated', target_table);
    execute format('grant select, insert, update, delete on table public.%I to service_role', target_table);
  end loop;
end
$$;

create policy portal_ownership_select on public.pilot_programs
  for select to authenticated
  using (private.portal_can_access_program_id(id));

create policy portal_ownership_select on public.participants
  for select to authenticated
  using (private.portal_can_access_participant(id, program_code));

create policy portal_ownership_select on public.student_family_links
  for select to authenticated
  using (private.portal_can_access_participant(student_id));

create policy portal_ownership_select on public.assessment_results
  for select to authenticated
  using (student_id is not null and private.portal_can_access_participant(student_id));

create policy portal_ownership_select on public.assessment_results_v2
  for select to authenticated
  using (participant_id is not null and private.portal_can_access_participant(participant_id));

create policy portal_ownership_select on public.module_results
  for select to authenticated
  using (participant_id is not null and private.portal_can_access_participant(participant_id));

create policy portal_ownership_select on public.player_progress
  for select to authenticated
  using (participant_id is not null and private.portal_can_access_participant(participant_id));

create policy portal_ownership_select on public.player_wallets
  for select to authenticated
  using (participant_id is not null and private.portal_can_access_participant(participant_id));

create policy portal_ownership_select on public.player_badges
  for select to authenticated
  using (participant_id is not null and private.portal_can_access_participant(participant_id));

create policy portal_ownership_select on public.player_reward_claims
  for select to authenticated
  using (private.portal_can_access_participant_text(participant_id));

create policy portal_ownership_select on public.kid_play_sessions
  for select to authenticated
  using (private.portal_can_access_participant(coalesce(participant_id, child_id)));

create policy portal_ownership_select on public.participant_ui_state
  for select to authenticated
  using (private.portal_can_access_participant(participant_id));

create policy portal_ownership_select on public.question_attempts
  for select to authenticated
  using (private.portal_can_access_participant(participant_id));

create policy portal_ownership_select on public.family_child_goals
  for select to authenticated
  using (child_id is not null and private.portal_can_access_participant(child_id));

create policy portal_ownership_select on public.program_goals
  for select to authenticated
  using (private.portal_can_access_program_code(program_code));

create policy portal_ownership_select on public.student_gallery_items
  for select to authenticated
  using (
    private.portal_can_access_program_code(program_code)
    or private.portal_can_access_program_code(family_code)
  );

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'assessment_results',
    'assessment_results_v2',
    'family_child_goals',
    'kid_play_sessions',
    'module_results',
    'participant_ui_state',
    'participants',
    'pilot_programs',
    'player_badges',
    'player_progress',
    'player_reward_claims',
    'player_wallets',
    'program_goals',
    'question_attempts',
    'student_family_links',
    'student_gallery_items'
  ]
  loop
    if (select count(*) from pg_policies
        where schemaname = 'public'
          and tablename = target_table
          and policyname = 'portal_ownership_select') <> 1 then
      raise exception 'Ownership policy postcheck failed on public.%', target_table;
    end if;

    if has_table_privilege('anon', format('public.%I', target_table), 'select')
      or has_table_privilege('anon', format('public.%I', target_table), 'insert')
      or has_table_privilege('anon', format('public.%I', target_table), 'update')
      or has_table_privilege('anon', format('public.%I', target_table), 'delete')
    then
      raise exception 'Anonymous table privilege remains on public.%', target_table;
    end if;

    if not has_table_privilege('authenticated', format('public.%I', target_table), 'select')
      or has_table_privilege('authenticated', format('public.%I', target_table), 'insert')
      or has_table_privilege('authenticated', format('public.%I', target_table), 'update')
      or has_table_privilege('authenticated', format('public.%I', target_table), 'delete')
    then
      raise exception 'Authenticated privilege postcheck failed on public.%', target_table;
    end if;
  end loop;
end
$$;
