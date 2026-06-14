-- Weekly adventure modules for admin-managed content
create table if not exists public.adventures (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  description text,
  week_number integer not null,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'active', 'archived')),
  cta_text text,
  hero_image_url text,
  thumbnail_image_url text,
  background_image_url text,
  reward_value integer default 0,
  unlock_date timestamptz,
  sort_order integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists adventures_week_number_idx on public.adventures (week_number);
create index if not exists adventures_status_idx on public.adventures (status);
create index if not exists adventures_sort_order_idx on public.adventures (sort_order);

-- Optional: featured hero week — run supabase/adventures_is_featured_migration.sql

-- Optional storage bucket — run supabase/adventures_storage_bucket_setup.sql (creates bucket + policies)

ALTER TABLE public.adventures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "adventures_anon_select" ON public.adventures;
CREATE POLICY "adventures_anon_select"
  ON public.adventures FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "adventures_anon_insert" ON public.adventures;
CREATE POLICY "adventures_anon_insert"
  ON public.adventures FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "adventures_anon_update" ON public.adventures;
CREATE POLICY "adventures_anon_update"
  ON public.adventures FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Storage policies (bucket: adventure-assets — create in Supabase Dashboard first)
DROP POLICY IF EXISTS "anon upload adventure asset files" ON storage.objects;
CREATE POLICY "anon upload adventure asset files"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'adventure-assets');

DROP POLICY IF EXISTS "public read adventure asset files" ON storage.objects;
CREATE POLICY "public read adventure asset files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'adventure-assets');
