-- Extend question_attempts for weekly mission first-try analytics.
-- Safe to run on existing installs; preserves historical module_results rows.

CREATE TABLE IF NOT EXISTS question_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  program_code text NOT NULL,
  week_number int,
  mission_id text NOT NULL,
  character text,
  question_id text NOT NULL,
  grade_level text,
  grade_band text,
  content_version text,
  selected_answer text,
  correct_answer text,
  first_selected_answer text,
  is_correct_first_try boolean NOT NULL DEFAULT false,
  is_correct_final boolean NOT NULL DEFAULT false,
  attempt_count int NOT NULL DEFAULT 1,
  used_hint boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz NOT NULL DEFAULT now()
);

-- Legacy columns from earlier migration draft (kept for backward compatibility)
ALTER TABLE question_attempts ADD COLUMN IF NOT EXISTS module_id text;
ALTER TABLE question_attempts ADD COLUMN IF NOT EXISTS assessment_type text;
ALTER TABLE question_attempts ADD COLUMN IF NOT EXISTS first_selected_answer_jsonb jsonb;
ALTER TABLE question_attempts ADD COLUMN IF NOT EXISTS final_selected_answer_jsonb jsonb;
ALTER TABLE question_attempts ADD COLUMN IF NOT EXISTS attempts_count integer;
ALTER TABLE question_attempts ADD COLUMN IF NOT EXISTS hints_used_count integer;
ALTER TABLE question_attempts ADD COLUMN IF NOT EXISTS time_spent_seconds integer;

ALTER TABLE question_attempts ADD COLUMN IF NOT EXISTS week_number int;
ALTER TABLE question_attempts ADD COLUMN IF NOT EXISTS mission_id text;
ALTER TABLE question_attempts ADD COLUMN IF NOT EXISTS character text;
ALTER TABLE question_attempts ADD COLUMN IF NOT EXISTS grade_level text;
ALTER TABLE question_attempts ADD COLUMN IF NOT EXISTS grade_band text;
ALTER TABLE question_attempts ADD COLUMN IF NOT EXISTS content_version text;
ALTER TABLE question_attempts ADD COLUMN IF NOT EXISTS selected_answer text;
ALTER TABLE question_attempts ADD COLUMN IF NOT EXISTS correct_answer text;
ALTER TABLE question_attempts ADD COLUMN IF NOT EXISTS first_selected_answer text;
ALTER TABLE question_attempts ADD COLUMN IF NOT EXISTS used_hint boolean NOT NULL DEFAULT false;
ALTER TABLE question_attempts ADD COLUMN IF NOT EXISTS attempt_type text NOT NULL DEFAULT 'initial';
ALTER TABLE question_attempts ADD COLUMN IF NOT EXISTS is_replay boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS question_attempts_attempt_type_idx
  ON question_attempts (attempt_type);

CREATE INDEX IF NOT EXISTS question_attempts_is_replay_idx
  ON question_attempts (is_replay);

CREATE INDEX IF NOT EXISTS question_attempts_participant_idx
  ON question_attempts (participant_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS question_attempts_program_code_idx
  ON question_attempts (program_code);

CREATE INDEX IF NOT EXISTS question_attempts_week_number_idx
  ON question_attempts (week_number);

CREATE INDEX IF NOT EXISTS question_attempts_mission_id_idx
  ON question_attempts (mission_id);

CREATE INDEX IF NOT EXISTS question_attempts_question_id_idx
  ON question_attempts (question_id);

CREATE INDEX IF NOT EXISTS question_attempts_module_idx
  ON question_attempts (module_id, question_id);

COMMENT ON TABLE question_attempts IS
  'Per-question attempt rows for weekly missions. First-try accuracy is immutable after the first check.';

COMMENT ON COLUMN module_results.answers_json IS
  'Final answers plus optional _attempts map: { questionId: { first_selected_answer, final_selected_answer, is_correct_first_try, is_correct_final, attempts_count, hints_used_count, completed_at } }. Historical completions without _attempts remain completion-only.';

COMMENT ON COLUMN assessment_results_v2.answers_json IS
  'Final answers plus optional _attempts map for first-attempt scoring and hint usage analytics.';
