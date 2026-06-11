-- Recommended migration: per-question attempt tracking for commit-before-feedback analytics.
-- Safe to run when ready; the app stores attempt metadata in answers_json._attempts until then.

-- Option A (preferred): dedicated question_attempts table
CREATE TABLE IF NOT EXISTS question_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  program_code text NOT NULL,
  module_id text,
  assessment_type text,
  question_id text NOT NULL,
  first_selected_answer jsonb,
  final_selected_answer jsonb,
  is_correct_first_try boolean NOT NULL DEFAULT false,
  is_correct_final boolean NOT NULL DEFAULT false,
  attempts_count integer NOT NULL DEFAULT 1,
  hints_used_count integer NOT NULL DEFAULT 0,
  time_spent_seconds integer,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS question_attempts_participant_idx
  ON question_attempts (participant_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS question_attempts_module_idx
  ON question_attempts (module_id, question_id);

-- Option B (minimal): document answers_json._attempts shape on existing tables
COMMENT ON COLUMN module_results.answers_json IS
  'Final answers plus optional _attempts map: { questionId: { first_selected_answer, final_selected_answer, is_correct_first_try, is_correct_final, attempts_count, hints_used_count, completed_at } }';

COMMENT ON COLUMN assessment_results_v2.answers_json IS
  'Final answers plus optional _attempts map for first-attempt scoring and hint usage analytics.';
