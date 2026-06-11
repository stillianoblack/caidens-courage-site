-- Parent/Guardian child goals for Family Portal onboarding.
-- Safe to run when ready; the app falls back to localStorage until this exists.

CREATE TABLE IF NOT EXISTS public.family_child_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_program_code text NOT NULL,
  child_id uuid NULL,
  child_name text NULL,
  parent_email text NULL,
  goals text[] NOT NULL DEFAULT '{}',
  strengths text[] NOT NULL DEFAULT '{}',
  completed_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (family_program_code, child_id)
);

CREATE INDEX IF NOT EXISTS family_child_goals_program_idx
  ON public.family_child_goals (family_program_code);

CREATE INDEX IF NOT EXISTS family_child_goals_parent_email_idx
  ON public.family_child_goals (parent_email);

ALTER TABLE public.family_child_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "family_child_goals_anon_insert" ON public.family_child_goals;
CREATE POLICY "family_child_goals_anon_insert"
  ON public.family_child_goals FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "family_child_goals_anon_select" ON public.family_child_goals;
CREATE POLICY "family_child_goals_anon_select"
  ON public.family_child_goals FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "family_child_goals_anon_update" ON public.family_child_goals;
CREATE POLICY "family_child_goals_anon_update"
  ON public.family_child_goals FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
