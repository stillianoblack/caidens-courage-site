-- Extend adventures CMS with interactive spot metadata and preview activities
ALTER TABLE public.adventures
  ADD COLUMN IF NOT EXISTS preview_activities jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS hotspots jsonb DEFAULT '[]'::jsonb;

-- Optional reward claim dedupe table
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
