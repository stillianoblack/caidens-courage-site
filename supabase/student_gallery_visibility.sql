-- Student Gallery visibility + program settings (safe to re-run)
-- Run in Supabase SQL Editor before enabling community gallery in production.
-- Does NOT delete or modify existing gallery item files.

-- Item-level visibility and uploader role
ALTER TABLE public.student_gallery_items
  ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'program_private',
  ADD COLUMN IF NOT EXISTS uploaded_by_role text;

-- Backfill legacy rows: keep all existing work program-private
UPDATE public.student_gallery_items
SET visibility = 'program_private'
WHERE visibility IS NULL OR visibility = '';

UPDATE public.student_gallery_items
SET uploaded_by_role = CASE
  WHEN upload_source = 'dashboard' THEN 'facilitator'
  WHEN upload_source = 'family' THEN 'family'
  WHEN upload_source = 'submit' THEN 'student'
  ELSE 'student'
END
WHERE uploaded_by_role IS NULL OR uploaded_by_role = '';

-- Program-level gallery settings (opt-in community sharing)
ALTER TABLE public.pilot_programs
  ADD COLUMN IF NOT EXISTS gallery_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS gallery_community_sharing boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS gallery_family_submit_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS gallery_require_approval boolean DEFAULT true;

COMMENT ON COLUMN public.student_gallery_items.visibility IS
  'program_private = visible only within program gallery; community_shared = opt-in cross-program community tab';

COMMENT ON COLUMN public.student_gallery_items.uploaded_by_role IS
  'facilitator | family | student | admin';
