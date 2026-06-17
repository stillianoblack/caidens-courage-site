-- Pilot program portal prep columns — safe to re-run (IF NOT EXISTS).
-- Run manually in Supabase SQL editor when ready.

ALTER TABLE public.pilot_programs
  ADD COLUMN IF NOT EXISTS estimated_student_count_range text,
  ADD COLUMN IF NOT EXISTS account_context text,
  ADD COLUMN IF NOT EXISTS portal_type text;

CREATE INDEX IF NOT EXISTS pilot_programs_portal_type_idx
  ON public.pilot_programs (portal_type);

CREATE INDEX IF NOT EXISTS pilot_programs_account_context_idx
  ON public.pilot_programs (account_context);

NOTIFY pgrst, 'reload schema';
