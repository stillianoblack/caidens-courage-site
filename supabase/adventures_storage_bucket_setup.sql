-- Adventure CMS image uploads — Supabase Storage bucket + policies
-- Run this in the Supabase SQL Editor if admin uploads fail with "Bucket not found".
--
-- Creates public bucket: adventure-assets
-- Used by Admin Portal for map_background_url and comic_thumbnail_url uploads.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'adventure-assets',
  'adventure-assets',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Allow uploads (admin portal uses anon/authenticated client)
DROP POLICY IF EXISTS "anon upload adventure asset files" ON storage.objects;
CREATE POLICY "anon upload adventure asset files"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'adventure-assets');

DROP POLICY IF EXISTS "anon update adventure asset files" ON storage.objects;
CREATE POLICY "anon update adventure asset files"
  ON storage.objects
  FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'adventure-assets')
  WITH CHECK (bucket_id = 'adventure-assets');

DROP POLICY IF EXISTS "public read adventure asset files" ON storage.objects;
CREATE POLICY "public read adventure asset files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'adventure-assets');
