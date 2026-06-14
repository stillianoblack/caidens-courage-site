-- Safe schema cache fix for Admin Adventures CMS fields.
-- Run in Supabase SQL editor (safe to re-run).

ALTER TABLE public.adventures ADD COLUMN IF NOT EXISTS interactive_header_url text;
ALTER TABLE public.adventures ADD COLUMN IF NOT EXISTS comic_thumbnail_url text;
ALTER TABLE public.adventures ADD COLUMN IF NOT EXISTS map_background_url text;
ALTER TABLE public.adventures ADD COLUMN IF NOT EXISTS is_admin_preview boolean DEFAULT false;
ALTER TABLE public.adventures ADD COLUMN IF NOT EXISTS is_live boolean DEFAULT false;
ALTER TABLE public.adventures ADD COLUMN IF NOT EXISTS hotspots jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.adventures ADD COLUMN IF NOT EXISTS thumbnail_url text;
ALTER TABLE public.adventures ADD COLUMN IF NOT EXISTS hero_image_url text;
ALTER TABLE public.adventures ADD COLUMN IF NOT EXISTS background_image_url text;
ALTER TABLE public.adventures ADD COLUMN IF NOT EXISTS reward_svg_url text;
ALTER TABLE public.adventures ADD COLUMN IF NOT EXISTS reward_image_url text;
ALTER TABLE public.adventures ADD COLUMN IF NOT EXISTS reward_name text;
ALTER TABLE public.adventures ADD COLUMN IF NOT EXISTS reward_type text;
ALTER TABLE public.adventures ADD COLUMN IF NOT EXISTS weekly_module_pdf_url text;
ALTER TABLE public.adventures ADD COLUMN IF NOT EXISTS coloring_page_pdf_url text;
ALTER TABLE public.adventures ADD COLUMN IF NOT EXISTS comic_pdf_url text;
ALTER TABLE public.adventures ADD COLUMN IF NOT EXISTS certificate_url text;
ALTER TABLE public.adventures ADD COLUMN IF NOT EXISTS facilitator_kit_pdf_url text;

UPDATE public.adventures
SET thumbnail_url = thumbnail_image_url
WHERE thumbnail_url IS NULL AND thumbnail_image_url IS NOT NULL;

UPDATE public.adventures
SET interactive_header_url = hero_image_url
WHERE interactive_header_url IS NULL AND hero_image_url IS NOT NULL;

UPDATE public.adventures
SET comic_thumbnail_url = COALESCE(thumbnail_url, thumbnail_image_url)
WHERE comic_thumbnail_url IS NULL
  AND (thumbnail_url IS NOT NULL OR thumbnail_image_url IS NOT NULL);

UPDATE public.adventures
SET map_background_url = background_image_url
WHERE map_background_url IS NULL AND background_image_url IS NOT NULL;

NOTIFY pgrst, 'reload schema';
