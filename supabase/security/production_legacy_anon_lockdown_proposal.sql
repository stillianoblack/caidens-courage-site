-- REVIEW-ONLY EMERGENCY PROPOSAL. DO NOT APPLY WITHOUT AN APPROVED MAINTENANCE WINDOW.
-- This intentionally breaks current anonymous legacy portal reads/writes. Migrate those
-- calls behind authenticated server boundaries before production execution.

begin;

do $$
declare
  target_table text;
  policy_record record;
  target_tables constant text[] := array[
    'pilot_programs', 'participants', 'student_family_links',
    'assessment_results', 'assessment_results_v2', 'module_results',
    'player_progress', 'player_wallets', 'player_badges', 'player_reward_claims',
    'kid_play_sessions', 'participant_ui_state', 'program_goals',
    'family_child_goals', 'question_attempts', 'student_gallery_items'
  ];
begin
  foreach target_table in array target_tables loop
    if to_regclass(format('public.%I', target_table)) is null then
      raise exception 'Expected production table public.% is missing.', target_table;
    end if;

    execute format('alter table public.%I enable row level security', target_table);
    execute format('revoke all privileges on table public.%I from anon, authenticated', target_table);
    execute format('grant all privileges on table public.%I to service_role', target_table);

    for policy_record in
      select policyname
      from pg_policies
      where schemaname = 'public' and tablename = target_table
    loop
      execute format('drop policy %I on public.%I', policy_record.policyname, target_table);
    end loop;
  end loop;
end
$$;

revoke all on function public.rename_pilot_program_transaction(text, text)
  from public, anon, authenticated;
grant execute on function public.rename_pilot_program_transaction(text, text) to service_role;

-- Intentionally no COMMIT in the proposal. A reviewed production runbook must add
-- COMMIT only after preflight, smoke-test, monitoring, and rollback approval.
rollback;
