-- Extend student_gallery_items for Family Portal uploads + facilitator review notes.
-- Run in Supabase SQL Editor after student_gallery_setup.sql.

ALTER TABLE student_gallery_items
  ADD COLUMN IF NOT EXISTS caption text,
  ADD COLUMN IF NOT EXISTS facilitator_note text,
  ADD COLUMN IF NOT EXISTS upload_source text DEFAULT 'submit',
  ADD COLUMN IF NOT EXISTS submitter_key text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by text;

-- Optional: dedicated bucket alias — existing bucket name remains student_gallery.
-- Create bucket "gallery-uploads" in Storage if you prefer; app uses student_gallery by default.
