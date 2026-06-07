-- Run this in Supabase SQL Editor if Approve/Reject does nothing.
-- Approve and Reject require UPDATE permission for the anon role.

DROP POLICY IF EXISTS "anon update student gallery items" ON student_gallery_items;
CREATE POLICY "anon update student gallery items"
  ON student_gallery_items
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
