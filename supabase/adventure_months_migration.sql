-- Adventure Months content model — safe to re-run (IF NOT EXISTS).
-- Run manually in Supabase SQL Editor when ready. Not applied automatically.

-- ---------------------------------------------------------------------------
-- adventure_months: month-level hero, certificate challenge, metadata
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.adventure_months (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month_number integer NOT NULL,
  month_title text NOT NULL,
  month_subtitle text,
  month_description text,
  month_hero_image_url text,
  certificate_title text,
  certificate_reward_name text,
  certificate_required_weeks integer NOT NULL DEFAULT 4,
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT adventure_months_month_number_key UNIQUE (month_number)
);

CREATE INDEX IF NOT EXISTS adventure_months_sort_order_idx
  ON public.adventure_months (sort_order ASC, month_number ASC);

-- ---------------------------------------------------------------------------
-- Link weekly adventures to a month (nullable for backward compatibility)
-- ---------------------------------------------------------------------------
ALTER TABLE public.adventures
  ADD COLUMN IF NOT EXISTS month_number integer,
  ADD COLUMN IF NOT EXISTS adventure_month_id uuid REFERENCES public.adventure_months (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS adventures_month_number_idx
  ON public.adventures (month_number ASC, sort_order ASC);

CREATE INDEX IF NOT EXISTS adventures_adventure_month_id_idx
  ON public.adventures (adventure_month_id);

-- Default existing weeks into months (1–4 → Month 1, 5–8 → Month 2, etc.)
UPDATE public.adventures
SET month_number = GREATEST(1, CEIL(week_number::numeric / 4)::integer)
WHERE month_number IS NULL;

-- ---------------------------------------------------------------------------
-- Seed default months when table is empty
-- ---------------------------------------------------------------------------
INSERT INTO public.adventure_months (
  month_number,
  month_title,
  month_subtitle,
  month_description,
  certificate_title,
  certificate_reward_name,
  certificate_required_weeks,
  is_published,
  sort_order
)
SELECT *
FROM (
  VALUES
    (
      1,
      'The Genesis',
      'Month 1',
      'Complete all weekly adventures to earn your Focus Flame Champion Certificate.',
      'Focus Flame Champion Certificate',
      'Focus Flame Champion Badge',
      4,
      true,
      1
    ),
    (
      2,
      'The Leader',
      'Month 2',
      'Complete all weekly adventures to earn your monthly certificate.',
      'Month 2 Champion Certificate',
      'Month 2 Champion Badge',
      4,
      false,
      2
    )
) AS seed (
  month_number,
  month_title,
  month_subtitle,
  month_description,
  certificate_title,
  certificate_reward_name,
  certificate_required_weeks,
  is_published,
  sort_order
)
WHERE NOT EXISTS (SELECT 1 FROM public.adventure_months LIMIT 1);

-- Backfill adventure_month_id from month_number where possible
UPDATE public.adventures AS a
SET adventure_month_id = m.id
FROM public.adventure_months AS m
WHERE a.adventure_month_id IS NULL
  AND a.month_number IS NOT NULL
  AND m.month_number = a.month_number;

-- ---------------------------------------------------------------------------
-- RLS (mirror adventures — service role / anon read for published months)
-- ---------------------------------------------------------------------------
ALTER TABLE public.adventure_months ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS adventure_months_select_all ON public.adventure_months;
CREATE POLICY adventure_months_select_all
  ON public.adventure_months
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS adventure_months_insert_authenticated ON public.adventure_months;
CREATE POLICY adventure_months_insert_authenticated
  ON public.adventure_months
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS adventure_months_update_authenticated ON public.adventure_months;
CREATE POLICY adventure_months_update_authenticated
  ON public.adventure_months
  FOR UPDATE
  USING (true);

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- ---------------------------------------------------------------------------
-- Certificate asset fields (safe add-on — run after initial migration)
-- ---------------------------------------------------------------------------
ALTER TABLE public.adventure_months
  ADD COLUMN IF NOT EXISTS certificate_asset_url text,
  ADD COLUMN IF NOT EXISTS certificate_asset_type text DEFAULT 'image';

NOTIFY pgrst, 'reload schema';
