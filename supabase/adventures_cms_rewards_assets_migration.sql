-- Adventures CMS: hotspots, weekly rewards, and downloadable assets.
-- Safe to re-run (IF NOT EXISTS).

ALTER TABLE public.adventures
  ADD COLUMN IF NOT EXISTS preview_activities jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS hotspots jsonb DEFAULT '[]'::jsonb,
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
  ADD COLUMN IF NOT EXISTS certificate_pdf_or_image_url text,
  ADD COLUMN IF NOT EXISTS facilitator_kit_pdf_url text;

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
