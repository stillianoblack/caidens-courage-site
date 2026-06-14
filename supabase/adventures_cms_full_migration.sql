-- Full Adventures CMS migration — safe to re-run (IF NOT EXISTS).
-- Run in Supabase SQL editor to fix schema cache errors for hotspots and CMS fields.

ALTER TABLE public.adventures
  ADD COLUMN IF NOT EXISTS interactive_header_url text,
  ADD COLUMN IF NOT EXISTS comic_thumbnail_url text,
  ADD COLUMN IF NOT EXISTS map_background_url text,
  ADD COLUMN IF NOT EXISTS preview_activities jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS hotspots jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS background_image_url text,
  ADD COLUMN IF NOT EXISTS reward_svg_url text,
  ADD COLUMN IF NOT EXISTS reward_image_url text,
  ADD COLUMN IF NOT EXISTS reward_name text,
  ADD COLUMN IF NOT EXISTS reward_type text,
  ADD COLUMN IF NOT EXISTS weekly_reward_name text,
  ADD COLUMN IF NOT EXISTS weekly_reward_type text,
  ADD COLUMN IF NOT EXISTS weekly_reward_svg_url text,
  ADD COLUMN IF NOT EXISTS weekly_reward_image_url text,
  ADD COLUMN IF NOT EXISTS weekly_reward_description text,
  ADD COLUMN IF NOT EXISTS weekly_reward_rarity text,
  ADD COLUMN IF NOT EXISTS weekly_reward_coin_value integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coloring_page_pdf_url text,
  ADD COLUMN IF NOT EXISTS weekly_module_pdf_url text,
  ADD COLUMN IF NOT EXISTS comic_pdf_url text,
  ADD COLUMN IF NOT EXISTS certificate_url text,
  ADD COLUMN IF NOT EXISTS certificate_pdf_or_image_url text,
  ADD COLUMN IF NOT EXISTS facilitator_kit_pdf_url text,
  ADD COLUMN IF NOT EXISTS is_live boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_admin_preview boolean DEFAULT false;

-- Backfill thumbnail_url from legacy column when present.
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

UPDATE public.adventures
SET thumbnail_url = thumbnail_image_url
WHERE thumbnail_url IS NULL AND thumbnail_image_url IS NOT NULL;

UPDATE public.adventures
SET certificate_pdf_or_image_url = certificate_url
WHERE certificate_pdf_or_image_url IS NULL AND certificate_url IS NOT NULL;

UPDATE public.adventures
SET weekly_reward_svg_url = reward_svg_url
WHERE weekly_reward_svg_url IS NULL AND reward_svg_url IS NOT NULL;

UPDATE public.adventures
SET weekly_reward_image_url = reward_image_url
WHERE weekly_reward_image_url IS NULL AND reward_image_url IS NOT NULL;

UPDATE public.adventures
SET weekly_reward_name = reward_name
WHERE weekly_reward_name IS NULL AND reward_name IS NOT NULL;

UPDATE public.adventures
SET weekly_reward_type = reward_type
WHERE weekly_reward_type IS NULL AND reward_type IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.player_reward_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id text NOT NULL,
  reward_key text NOT NULL,
  reward_name text,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (participant_id, reward_key)
);

ALTER TABLE public.player_reward_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "player_reward_claims_anon_all" ON public.player_reward_claims;
CREATE POLICY "player_reward_claims_anon_all"
  ON public.player_reward_claims
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Scope mission progress by week when possible (additive index; app uses week-specific mission_id slugs).
CREATE INDEX IF NOT EXISTS player_progress_participant_week_idx
  ON public.player_progress (participant_id, week_id);
