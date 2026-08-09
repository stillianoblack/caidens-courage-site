-- Cleanup only the deterministic fictional staging seed records.
-- Never generalize these predicates and never run this file outside isolated staging.

SELECT private.assert_staging_safety(true);

DELETE FROM public.program_goals
WHERE id = '00000000-0000-4000-8000-000000000160';

DELETE FROM public.player_reward_claims
WHERE id = '00000000-0000-4000-8000-000000000153';

DELETE FROM public.player_badges
WHERE id = '00000000-0000-4000-8000-000000000152';

DELETE FROM public.player_wallets
WHERE participant_id = '00000000-0000-4000-8000-000000000103';

DELETE FROM public.player_progress
WHERE id = '00000000-0000-4000-8000-000000000151';

DELETE FROM public.module_results
WHERE id = '00000000-0000-4000-8000-000000000150';

DELETE FROM public.kid_play_sessions
WHERE id = '00000000-0000-4000-8000-000000000140';

DELETE FROM public.assessment_results_v2
WHERE id = '00000000-0000-4000-8000-000000000131';

DELETE FROM public.assessment_results
WHERE id = '00000000-0000-4000-8000-000000000130';

DELETE FROM public.student_family_links
WHERE id IN (
  '00000000-0000-4000-8000-000000000120',
  '00000000-0000-4000-8000-000000000121'
);

DELETE FROM public.participants
WHERE id IN (
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000102',
  '00000000-0000-4000-8000-000000000103',
  '00000000-0000-4000-8000-000000000104'
);

DELETE FROM public.pilot_programs
WHERE id IN (
  '00000000-0000-4000-8000-000000000100',
  '00000000-0000-4000-8000-000000000110'
);
