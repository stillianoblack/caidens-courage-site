-- Restrictive ownership SELECT policies for staging. Writes remain server-mediated.

grant select on public.pilot_programs, public.participants, public.student_family_links,
  public.assessment_results, public.assessment_results_v2, public.module_results,
  public.player_progress, public.player_wallets, public.player_badges,
  public.player_reward_claims, public.kid_play_sessions, public.participant_ui_state,
  public.program_goals, public.family_child_goals, public.question_attempts,
  public.student_gallery_items to authenticated;

drop policy if exists portal_ownership_select on public.pilot_programs;
create policy portal_ownership_select on public.pilot_programs for select to authenticated
  using (private.portal_can_access_program_id(id));

drop policy if exists portal_ownership_select on public.participants;
create policy portal_ownership_select on public.participants for select to authenticated
  using (private.portal_can_access_participant(id));

drop policy if exists portal_ownership_select on public.student_family_links;
create policy portal_ownership_select on public.student_family_links for select to authenticated
  using (private.portal_can_access_participant(student_id));

drop policy if exists portal_ownership_select on public.assessment_results;
create policy portal_ownership_select on public.assessment_results for select to authenticated
  using (student_id is not null and private.portal_can_access_participant(student_id));

drop policy if exists portal_ownership_select on public.assessment_results_v2;
create policy portal_ownership_select on public.assessment_results_v2 for select to authenticated
  using (participant_id is not null and private.portal_can_access_participant(participant_id));

drop policy if exists portal_ownership_select on public.module_results;
create policy portal_ownership_select on public.module_results for select to authenticated
  using (participant_id is not null and private.portal_can_access_participant(participant_id));

drop policy if exists portal_ownership_select on public.player_progress;
create policy portal_ownership_select on public.player_progress for select to authenticated
  using (participant_id is not null and private.portal_can_access_participant(participant_id));

drop policy if exists portal_ownership_select on public.player_wallets;
create policy portal_ownership_select on public.player_wallets for select to authenticated
  using (participant_id is not null and private.portal_can_access_participant(participant_id));

drop policy if exists portal_ownership_select on public.player_badges;
create policy portal_ownership_select on public.player_badges for select to authenticated
  using (participant_id is not null and private.portal_can_access_participant(participant_id));

drop policy if exists portal_ownership_select on public.player_reward_claims;
create policy portal_ownership_select on public.player_reward_claims for select to authenticated
  using (private.portal_can_access_participant_text(participant_id));

drop policy if exists portal_ownership_select on public.kid_play_sessions;
create policy portal_ownership_select on public.kid_play_sessions for select to authenticated
  using (private.portal_can_access_participant(coalesce(participant_id, child_id)));

drop policy if exists portal_ownership_select on public.participant_ui_state;
create policy portal_ownership_select on public.participant_ui_state for select to authenticated
  using (private.portal_can_access_participant(participant_id));

drop policy if exists portal_ownership_select on public.question_attempts;
create policy portal_ownership_select on public.question_attempts for select to authenticated
  using (private.portal_can_access_participant(participant_id));

drop policy if exists portal_ownership_select on public.family_child_goals;
create policy portal_ownership_select on public.family_child_goals for select to authenticated
  using (child_id is not null and private.portal_can_access_participant(child_id));

drop policy if exists portal_ownership_select on public.program_goals;
create policy portal_ownership_select on public.program_goals for select to authenticated
  using (private.portal_can_access_program_code(program_code));

drop policy if exists portal_ownership_select on public.student_gallery_items;
create policy portal_ownership_select on public.student_gallery_items for select to authenticated
  using (private.portal_can_access_program_code(program_code)
    or private.portal_can_access_program_code(family_code));
