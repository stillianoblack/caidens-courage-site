-- Pilot program scale / age-grade / feature-flag prep — safe to re-run.
-- Run manually in Supabase SQL editor when ready.
-- Does not change portal behavior; stores metadata for future scale routing.

ALTER TABLE public.pilot_programs
  ADD COLUMN IF NOT EXISTS age_grade_band text,
  ADD COLUMN IF NOT EXISTS age_grade_notes text,
  ADD COLUMN IF NOT EXISTS feature_flags jsonb;

COMMENT ON COLUMN public.pilot_programs.estimated_student_count_range IS
  'Optional signup estimate — nullable for legacy programs.';

COMMENT ON COLUMN public.pilot_programs.age_grade_band IS
  'Pre-K/K, 1st–2nd, 3rd–5th, 6th–8th, Mixed Ages, or Other.';

COMMENT ON COLUMN public.pilot_programs.age_grade_notes IS
  'Optional freeform notes when age_grade_band is Other or needs detail.';

COMMENT ON COLUMN public.pilot_programs.feature_flags IS
  'Prep-only permission flags — not enforced in portals yet.';

CREATE INDEX IF NOT EXISTS pilot_programs_age_grade_band_idx
  ON public.pilot_programs (age_grade_band);

NOTIFY pgrst, 'reload schema';
