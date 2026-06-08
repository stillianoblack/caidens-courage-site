-- Student gallery schema additions (caption + review timestamps).
-- Run in Supabase SQL Editor if approve/reject fails with missing-column errors.

ALTER TABLE student_gallery_items
  ADD COLUMN IF NOT EXISTS caption text,
  ADD COLUMN IF NOT EXISTS facilitator_note text,
  ADD COLUMN IF NOT EXISTS upload_source text DEFAULT 'submit',
  ADD COLUMN IF NOT EXISTS submitter_key text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by text,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz;

-- Optional: backfill program_code on legacy family uploads so facilitators can find them.
-- Replace YOUR-PROGRAM-CODE with the active pilot program code.
-- UPDATE student_gallery_items
-- SET program_code = 'YOUR-PROGRAM-CODE'
-- WHERE upload_source = 'family' AND program_code = 'BlueRibbonFamily';
