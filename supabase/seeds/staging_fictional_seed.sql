-- Fictional, idempotent, staging-only legacy application seed.
-- Reserved .example addresses are intentionally non-deliverable.
-- This file does not create Auth users, CRM contacts, provider records, or storage objects.

SELECT private.assert_staging_safety(true);

-- One fictional pilot program.
INSERT INTO public.pilot_programs (
  id, program_name, program_code, program_type, admin_first_name, admin_email,
  estimated_students, age_range, group_name, family_access_code, facilitator_access_code,
  pricing_tier, payment_status, pilot_status, agreed_to_terms, agreed_at,
  account_context, portal_type, age_grade_band, protection_level
) VALUES (
  '00000000-0000-4000-8000-000000000100',
  'Imaginary Lantern Pilot',
  'STAGING-LANTERN-2026',
  'camp',
  'Avery',
  'facilitator@fictional.example',
  2,
  '7-11',
  'Comet Group',
  'STAGING-FAMILY-ACCESS',
  'STAGING-FACILITATOR-ACCESS',
  'pilot',
  'not_paid',
  'active',
  true,
  '2026-01-15T12:00:00Z',
  'camp',
  'facilitator',
  '2-5',
  'testing'
) ON CONFLICT (id) DO UPDATE SET
  program_name = EXCLUDED.program_name,
  program_code = EXCLUDED.program_code,
  admin_first_name = EXCLUDED.admin_first_name,
  admin_email = EXCLUDED.admin_email,
  protection_level = 'testing';

-- One fictional family account. The deployed legacy model stores this as a family-type pilot_programs row.
INSERT INTO public.pilot_programs (
  id, program_name, program_code, program_type, admin_first_name, admin_email,
  estimated_students, age_range, group_name, family_access_code, facilitator_access_code,
  pricing_tier, payment_status, pilot_status, agreed_to_terms, agreed_at,
  account_context, portal_type, age_grade_band, protection_level
) VALUES (
  '00000000-0000-4000-8000-000000000110',
  'Fictional Star Family',
  'STAGING-STAR-FAMILY-2026',
  'family',
  'Rowan',
  'guardian@fictional.example',
  2,
  '7-11',
  'Star Family',
  'STAGING-STAR-FAMILY',
  NULL,
  'family',
  'not_paid',
  'active',
  true,
  '2026-01-15T12:00:00Z',
  'family',
  'family',
  '2-5',
  'testing'
) ON CONFLICT (id) DO UPDATE SET
  program_name = EXCLUDED.program_name,
  program_code = EXCLUDED.program_code,
  admin_first_name = EXCLUDED.admin_first_name,
  admin_email = EXCLUDED.admin_email,
  protection_level = 'testing';

-- One facilitator, one parent/guardian, and two fictional students.
INSERT INTO public.participants (
  id, role, first_name, last_name, email, program_code, program_name, group_name,
  organization, adult_role, email_opt_in, parent_connection_status
) VALUES (
  '00000000-0000-4000-8000-000000000101', 'facilitator', 'Avery', 'Fiction',
  'facilitator@fictional.example', 'STAGING-LANTERN-2026', 'Imaginary Lantern Pilot',
  'Comet Group', 'Fictional Learning Lab', 'facilitator', false, 'connected'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email, program_code = EXCLUDED.program_code, updated_at = now();

INSERT INTO public.participants (
  id, role, first_name, last_name, email, program_code, program_name, group_name,
  adult_role, email_opt_in, parent_connection_status, family_account_id
) VALUES (
  '00000000-0000-4000-8000-000000000102', 'parent', 'Rowan', 'Fiction',
  'guardian@fictional.example', 'STAGING-STAR-FAMILY-2026', 'Fictional Star Family',
  'Star Family', 'guardian', false, 'connected', '00000000-0000-4000-8000-000000000110'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email, program_code = EXCLUDED.program_code,
  family_account_id = EXCLUDED.family_account_id, updated_at = now();

INSERT INTO public.participants (
  id, role, nickname, first_name, last_name, program_code, program_name, group_name,
  grade_level, grade_band, guardian_email, parent_connection_status, family_account_id,
  student_pin_enabled
) VALUES
  (
    '00000000-0000-4000-8000-000000000103', 'student', 'Nova Test', 'Nova', 'Fiction',
    'STAGING-LANTERN-2026', 'Imaginary Lantern Pilot', 'Comet Group', '3', '2-3',
    'guardian@fictional.example', 'connected', '00000000-0000-4000-8000-000000000110', false
  ),
  (
    '00000000-0000-4000-8000-000000000104', 'student', 'Orion Test', 'Orion', 'Fiction',
    'STAGING-LANTERN-2026', 'Imaginary Lantern Pilot', 'Comet Group', '5', '4-5',
    'guardian@fictional.example', 'connected', '00000000-0000-4000-8000-000000000110', false
  )
ON CONFLICT (id) DO UPDATE SET
  nickname = EXCLUDED.nickname,
  program_code = EXCLUDED.program_code,
  guardian_email = EXCLUDED.guardian_email,
  family_account_id = EXCLUDED.family_account_id,
  updated_at = now();

-- Family relationship and legacy program enrollment mapping for both children.
-- Production has no dedicated family_accounts, family_relationships, or program_enrollments tables.
INSERT INTO public.student_family_links (
  id, student_id, camp_program_code, family_program_code, parent_email,
  parent_last_name, relationship, parent_phone, parent_first_name, parent_claimed, claimed_at
) VALUES
  (
    '00000000-0000-4000-8000-000000000120', '00000000-0000-4000-8000-000000000103',
    'STAGING-LANTERN-2026', 'STAGING-STAR-FAMILY-2026', 'guardian@fictional.example',
    'Fiction', 'guardian', NULL, 'Rowan', true, '2026-01-15T12:00:00Z'
  ),
  (
    '00000000-0000-4000-8000-000000000121', '00000000-0000-4000-8000-000000000104',
    'STAGING-LANTERN-2026', 'STAGING-STAR-FAMILY-2026', 'guardian@fictional.example',
    'Fiction', 'guardian', NULL, 'Rowan', true, '2026-01-15T12:00:00Z'
  )
ON CONFLICT (id) DO UPDATE SET
  family_program_code = EXCLUDED.family_program_code,
  parent_email = EXCLUDED.parent_email,
  parent_claimed = true,
  claimed_at = EXCLUDED.claimed_at;

-- One legacy baseline completion and one v2 B-4 completion for Nova Test.
-- Orion Test intentionally has no assessment row and is the incomplete student.
INSERT INTO public.assessment_results (
  id, nickname, student_id, assessment_type, program_code, group_name,
  feelings_score, reading_score, focus_moves_score, modules_completed,
  completed_at, overall_score, program_id, program_name, family_code, role,
  total_score, total_questions, assessment_payload
) VALUES (
  '00000000-0000-4000-8000-000000000130', 'Nova Test',
  '00000000-0000-4000-8000-000000000103', 'baseline', 'STAGING-LANTERN-2026',
  'Comet Group', 3, 3, 2, 'feelings,reading,focus', '2026-01-16T12:00:00Z',
  8, '00000000-0000-4000-8000-000000000100', 'Imaginary Lantern Pilot',
  'STAGING-STAR-FAMILY-2026', 'student', 8, 12, '{"fixture":true,"kind":"legacy_baseline"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  student_id = EXCLUDED.student_id,
  assessment_type = EXCLUDED.assessment_type,
  assessment_payload = EXCLUDED.assessment_payload;

INSERT INTO public.assessment_results_v2 (
  id, participant_id, role, assessment_type, program_code, group_name,
  reading_score, focus_score, confidence_score, total_score, max_score,
  percent_score, answers_json, completed_at
) VALUES (
  '00000000-0000-4000-8000-000000000131',
  '00000000-0000-4000-8000-000000000103', 'student', 'baseline',
  'STAGING-LANTERN-2026', 'Comet Group', 3, 3, 2, 8, 12, 66.67,
  '{"fixture":true,"kind":"b4_completion"}'::jsonb, '2026-01-16T12:05:00Z'
) ON CONFLICT (id) DO UPDATE SET
  participant_id = EXCLUDED.participant_id,
  answers_json = EXCLUDED.answers_json,
  completed_at = EXCLUDED.completed_at;

-- Active-player selection is represented by an active kid-play session in the deployed database model.
INSERT INTO public.kid_play_sessions (
  id, child_id, participant_id, organization_id, session_source, device_mode,
  status, started_at, last_activity_at, device_label, resume_payload
) VALUES (
  '00000000-0000-4000-8000-000000000140',
  '00000000-0000-4000-8000-000000000103',
  '00000000-0000-4000-8000-000000000103',
  '00000000-0000-4000-8000-000000000110',
  'family_home', 'home_device', 'active',
  '2026-01-17T12:00:00Z', '2026-01-17T12:05:00Z', 'Fictional staging browser',
  '{"fixture":true,"active_player_id":"00000000-0000-4000-8000-000000000103"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  child_id = EXCLUDED.child_id,
  participant_id = EXCLUDED.participant_id,
  status = 'active',
  resume_payload = EXCLUDED.resume_payload;

-- Mission/adventure progress plus one module completion.
INSERT INTO public.module_results (
  id, participant_id, role, program_code, group_name, module_id, module_title,
  character, skill_area, score, max_score, percent_score, time_spent_seconds,
  attempt_number, answers_json, completed_at
) VALUES (
  '00000000-0000-4000-8000-000000000150',
  '00000000-0000-4000-8000-000000000103', 'student', 'STAGING-LANTERN-2026',
  'Comet Group', 'week-1-fictional', 'Fictional Week 1 Mission', 'Caiden',
  'focus', 4, 5, 80, 300, 1, '{"fixture":true}'::jsonb, '2026-01-17T12:10:00Z'
) ON CONFLICT (id) DO UPDATE SET
  participant_id = EXCLUDED.participant_id,
  answers_json = EXCLUDED.answers_json,
  completed_at = EXCLUDED.completed_at;

INSERT INTO public.player_progress (
  id, participant_id, week_id, mission_id, character_id, mission_title,
  character_name, coins_earned, badge_unlocked, reward_item, completed_at
) VALUES (
  '00000000-0000-4000-8000-000000000151',
  '00000000-0000-4000-8000-000000000103', 'week-1', 'fictional-lantern-mission',
  'caiden', 'Fictional Lantern Mission', 'Caiden', 25,
  'Fictional First Light', 'Fictional Lantern Token', '2026-01-17T12:10:00Z'
) ON CONFLICT (id) DO UPDATE SET
  participant_id = EXCLUDED.participant_id,
  coins_earned = EXCLUDED.coins_earned,
  badge_unlocked = EXCLUDED.badge_unlocked;

-- Coin/reward state.
INSERT INTO public.player_wallets (participant_id, total_coins, updated_at)
VALUES ('00000000-0000-4000-8000-000000000103', 25, '2026-01-17T12:10:00Z')
ON CONFLICT (participant_id) DO UPDATE SET
  total_coins = EXCLUDED.total_coins,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.player_badges (
  id, participant_id, badge_name, mission_id, week_id, unlocked_at, earned_at
) VALUES (
  '00000000-0000-4000-8000-000000000152',
  '00000000-0000-4000-8000-000000000103', 'Fictional First Light',
  'fictional-lantern-mission', 'week-1', '2026-01-17T12:10:00Z', '2026-01-17T12:10:00Z'
) ON CONFLICT (id) DO UPDATE SET
  participant_id = EXCLUDED.participant_id,
  badge_name = EXCLUDED.badge_name,
  earned_at = EXCLUDED.earned_at;

INSERT INTO public.player_reward_claims (
  id, participant_id, reward_key, reward_name, claimed_at
) VALUES (
  '00000000-0000-4000-8000-000000000153',
  '00000000-0000-4000-8000-000000000103',
  'fictional-lantern-token', 'Fictional Lantern Token', '2026-01-17T12:10:00Z'
) ON CONFLICT (id) DO UPDATE SET
  participant_id = EXCLUDED.participant_id,
  reward_key = EXCLUDED.reward_key,
  reward_name = EXCLUDED.reward_name;

INSERT INTO public.program_goals (
  id, program_code, portal_type, selected_goals, custom_goal, completed_at
) VALUES (
  '00000000-0000-4000-8000-000000000160',
  'STAGING-LANTERN-2026', 'facilitator', ARRAY['improve_focus', 'build_reading_confidence'],
  'Practice with fictional staging records only.', '2026-01-15T12:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  selected_goals = EXCLUDED.selected_goals,
  custom_goal = EXCLUDED.custom_goal,
  updated_at = now();
