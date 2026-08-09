-- Restore the production policy/grant inventory captured on 2026-07-16.
-- Rehearsal/rollback only. Do not run as a normal forward migration.

do $$
declare
  target_table text;
  actual_policies text[];
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
    select coalesce(array_agg(policyname order by policyname), array[]::text[])
      into actual_policies
    from pg_policies
    where schemaname = 'public' and tablename = target_table;

    if actual_policies is distinct from array['portal_ownership_select']::text[] then
      raise exception 'Rollback policy drift on public.%; stop and review.', target_table;
    end if;

    execute format('drop policy portal_ownership_select on public.%I', target_table);
    execute format(
      'grant select, insert, update, delete on table public.%I to anon, authenticated, service_role',
      target_table
    );
  end loop;
end
$$;

create policy "Allow anon select assessment results"""
  on public.assessment_results for select to public using (true);
create policy "Allow public assessment adult insert"
  on public.assessment_results for insert to public with check (true);
create policy "Allow public assessment adult read"
  on public.assessment_results for select to public using (true);
create policy "Allow public assessment inserts"
  on public.assessment_results for insert to public with check (true);
create policy assessment_results_anon_insert
  on public.assessment_results for insert to anon, authenticated with check (true);
create policy assessment_results_anon_select
  on public.assessment_results for select to anon, authenticated using (true);

create policy "Allow public assessment result inserts"
  on public.assessment_results_v2 for insert to public with check (true);
create policy "Allow public assessment result reads"
  on public.assessment_results_v2 for select to public using (true);
create policy assessment_results_v2_anon_insert
  on public.assessment_results_v2 for insert to anon, authenticated with check (true);
create policy assessment_results_v2_anon_select
  on public.assessment_results_v2 for select to anon, authenticated using (true);

create policy family_child_goals_anon_insert
  on public.family_child_goals for insert to anon with check (true);
create policy family_child_goals_anon_select
  on public.family_child_goals for select to anon using (true);
create policy family_child_goals_anon_update
  on public.family_child_goals for update to anon using (true) with check (true);

create policy kid_play_sessions_anon_insert
  on public.kid_play_sessions for insert to anon, authenticated with check (true);
create policy kid_play_sessions_anon_select
  on public.kid_play_sessions for select to anon, authenticated using (true);
create policy kid_play_sessions_anon_update
  on public.kid_play_sessions for update to anon, authenticated using (true) with check (true);

create policy "Allow public module result inserts"
  on public.module_results for insert to public with check (true);
create policy "Allow public module result reads"
  on public.module_results for select to public using (true);
create policy module_results_anon_insert
  on public.module_results for insert to anon, authenticated with check (true);
create policy module_results_anon_select
  on public.module_results for select to anon, authenticated using (true);

create policy participant_ui_state_anon_insert
  on public.participant_ui_state for insert to anon, authenticated with check (true);
create policy participant_ui_state_anon_select
  on public.participant_ui_state for select to anon, authenticated using (true);
create policy participant_ui_state_anon_update
  on public.participant_ui_state for update to anon, authenticated using (true) with check (true);

create policy "Allow public participant inserts"
  on public.participants for insert to public with check (true);
create policy "Allow public participant reads"
  on public.participants for select to public using (true);
create policy participants_anon_insert
  on public.participants for insert to anon, authenticated with check (true);
create policy participants_anon_select
  on public.participants for select to anon, authenticated using (true);
create policy participants_anon_update
  on public.participants for update to anon, authenticated using (true) with check (true);

create policy "Allow public pilot program inserts"
  on public.pilot_programs for insert to public with check (true);
create policy "Allow public pilot program reads"
  on public.pilot_programs for select to public using (true);
create policy pilot_programs_anon_insert
  on public.pilot_programs for insert to anon, authenticated with check (true);
create policy pilot_programs_anon_select
  on public.pilot_programs for select to anon, authenticated using (true);
create policy pilot_programs_anon_update
  on public.pilot_programs for update to anon, authenticated using (true) with check (true);

create policy "Users can insert their own badges"
  on public.player_badges for insert to public with check ((auth.uid() = user_id));
create policy "Users can read their own badges"
  on public.player_badges for select to public using ((auth.uid() = user_id));
create policy player_badges_anon_insert
  on public.player_badges for insert to anon, authenticated with check (true);
create policy player_badges_anon_select
  on public.player_badges for select to anon, authenticated using (true);

create policy "Users can insert their own progress"
  on public.player_progress for insert to public with check ((auth.uid() = user_id));
create policy "Users can read their own progress"
  on public.player_progress for select to public using ((auth.uid() = user_id));
create policy player_progress_anon_insert
  on public.player_progress for insert to anon, authenticated with check (true);
create policy player_progress_anon_select
  on public.player_progress for select to anon, authenticated using (true);

create policy player_reward_claims_anon_all
  on public.player_reward_claims for all to anon, authenticated using (true) with check (true);

create policy "Users can insert their own wallet"
  on public.player_wallets for insert to public with check ((auth.uid() = user_id));
create policy "Users can read their own wallet"
  on public.player_wallets for select to public using ((auth.uid() = user_id));
create policy "Users can update their own wallet"
  on public.player_wallets for update to public using ((auth.uid() = user_id));
create policy player_wallets_anon_insert
  on public.player_wallets for insert to anon, authenticated with check (true);
create policy player_wallets_anon_select
  on public.player_wallets for select to anon, authenticated using (true);
create policy player_wallets_anon_update
  on public.player_wallets for update to anon, authenticated using (true) with check (true);

create policy "Allow pilot program goals access"
  on public.program_goals for all to public using (true) with check (true);
create policy program_goals_anon_insert
  on public.program_goals for insert to anon, authenticated with check (true);
create policy program_goals_anon_select
  on public.program_goals for select to anon, authenticated using (true);
create policy program_goals_anon_update
  on public.program_goals for update to anon, authenticated using (true) with check (true);

create policy student_family_links_anon_insert
  on public.student_family_links for insert to anon, authenticated with check (true);
create policy student_family_links_anon_select
  on public.student_family_links for select to anon, authenticated using (true);
create policy student_family_links_anon_update
  on public.student_family_links for update to anon, authenticated using (true) with check (true);

create policy "anon insert student gallery items"
  on public.student_gallery_items for insert to anon with check (true);
create policy "anon select student gallery items"
  on public.student_gallery_items for select to anon using (true);
create policy "anon update student gallery items"
  on public.student_gallery_items for update to anon using (true) with check (true);

-- question_attempts had no policies in the captured inventory. RLS remains enabled.
