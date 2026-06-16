-- Non-destructive growth metadata for question_attempts.
-- Preserves all historical rows; adds classification fields for canonical vs replay/challenge.

ALTER TABLE question_attempts ADD COLUMN IF NOT EXISTS attempt_scope text;
ALTER TABLE question_attempts ADD COLUMN IF NOT EXISTS original_module_id text;
ALTER TABLE question_attempts ADD COLUMN IF NOT EXISTS question_set_version text;
ALTER TABLE question_attempts ADD COLUMN IF NOT EXISTS first_attempt_accuracy numeric;
ALTER TABLE question_attempts ADD COLUMN IF NOT EXISTS final_accuracy numeric;
ALTER TABLE question_attempts ADD COLUMN IF NOT EXISTS answered_count integer;
ALTER TABLE question_attempts ADD COLUMN IF NOT EXISTS correct_count integer;
ALTER TABLE question_attempts ADD COLUMN IF NOT EXISTS started_at timestamptz;

CREATE INDEX IF NOT EXISTS question_attempts_attempt_scope_idx
  ON question_attempts (attempt_scope);

COMMENT ON COLUMN question_attempts.attempt_scope IS
  'canonical | practice | excluded_from_growth — whether the row counts in growth rollups.';

COMMENT ON COLUMN question_attempts.attempt_type IS
  'baseline | weekly | replay | challenge | test | initial — attempt classification for analytics.';
