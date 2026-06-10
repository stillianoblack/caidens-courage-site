-- Program Goals onboarding (facilitator + family portals)
-- Run in Supabase SQL Editor. Safe to re-run.

CREATE TABLE IF NOT EXISTS public.program_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_code text NOT NULL,
  portal_type text NOT NULL DEFAULT 'facilitator',
  selected_goals jsonb NOT NULL DEFAULT '[]'::jsonb,
  custom_goal text,
  completed_at timestamptz,
  dismissed_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (program_code, portal_type)
);

CREATE INDEX IF NOT EXISTS program_goals_program_code_idx
  ON public.program_goals (program_code);

ALTER TABLE public.program_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "program_goals_anon_select" ON public.program_goals;
CREATE POLICY "program_goals_anon_select"
  ON public.program_goals FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "program_goals_anon_insert" ON public.program_goals;
CREATE POLICY "program_goals_anon_insert"
  ON public.program_goals FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "program_goals_anon_update" ON public.program_goals;
CREATE POLICY "program_goals_anon_update"
  ON public.program_goals FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
