-- Featured weekly adventure header (separate from publish status)
-- Run after adventures_setup.sql

ALTER TABLE public.adventures
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS adventures_is_featured_idx ON public.adventures (is_featured)
  WHERE is_featured = true;

-- Default Week 1 as featured when none is set
UPDATE public.adventures
SET is_featured = true
WHERE week_number = 1
  AND NOT EXISTS (SELECT 1 FROM public.adventures WHERE is_featured = true);

COMMENT ON COLUMN public.adventures.is_featured IS
  'When true, this adventure is the large Weekly Adventures hero/header. Only one should be featured at a time (enforced in app).';
