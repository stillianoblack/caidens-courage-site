-- Student Gallery: table + RLS + Storage bucket policies
-- Run in Supabase SQL Editor. Create bucket "student_gallery" in Storage first (public recommended for file_url).

CREATE TABLE IF NOT EXISTS student_gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  title text,
  student_nickname text,
  program_code text DEFAULT 'BlueRibbon2026',
  group_name text,
  file_url text,
  file_path text,
  status text DEFAULT 'pending',
  caption text,
  facilitator_note text,
  upload_source text DEFAULT 'submit',
  submitter_key text,
  reviewed_at timestamptz,
  reviewed_by text,
  approved_at timestamptz,
  rejected_at timestamptz
);

ALTER TABLE student_gallery_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon insert student gallery items" ON student_gallery_items;
CREATE POLICY "anon insert student gallery items"
  ON student_gallery_items
  FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "anon select student gallery items" ON student_gallery_items;
CREATE POLICY "anon select student gallery items"
  ON student_gallery_items
  FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "anon update student gallery items" ON student_gallery_items;
CREATE POLICY "anon update student gallery items"
  ON student_gallery_items
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Storage policies (bucket: student_gallery)
DROP POLICY IF EXISTS "anon upload student gallery files" ON storage.objects;
CREATE POLICY "anon upload student gallery files"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'student_gallery');

DROP POLICY IF EXISTS "public read student gallery files" ON storage.objects;
CREATE POLICY "public read student gallery files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'student_gallery');
