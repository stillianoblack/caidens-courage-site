-- Admin-managed commerce product settings.
--
-- Runtime checkout links should come from this table instead of frontend source.
-- The seed preserves the previous Hardcover Bundle Payment Link only as initial
-- configuration; update it in Admin Portal > Commerce > Products after creating
-- the verified $59.99 Stripe Payment Link.

CREATE TABLE IF NOT EXISTS public.commerce_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  title text NOT NULL,
  display_price_cents integer NOT NULL CHECK (display_price_cents > 0),
  currency text NOT NULL DEFAULT 'usd',
  payment_link_url text,
  stripe_product_id text,
  stripe_price_id text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS commerce_products_key_idx ON public.commerce_products (key);
CREATE INDEX IF NOT EXISTS commerce_products_is_active_idx ON public.commerce_products (is_active);

CREATE OR REPLACE FUNCTION public.set_commerce_products_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS commerce_products_set_updated_at ON public.commerce_products;
CREATE TRIGGER commerce_products_set_updated_at
  BEFORE UPDATE ON public.commerce_products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_commerce_products_updated_at();

INSERT INTO public.commerce_products (
  key,
  title,
  display_price_cents,
  currency,
  payment_link_url,
  is_active
) VALUES (
  'hardcover_bundle',
  'Pre-Order Bundle',
  5999,
  'usd',
  'https://buy.stripe.com/fZufZggqHbSg7cjd7O3Ru04',
  true
)
ON CONFLICT (key) DO UPDATE SET
  title = EXCLUDED.title,
  display_price_cents = EXCLUDED.display_price_cents,
  currency = EXCLUDED.currency,
  updated_at = now();

ALTER TABLE public.commerce_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "commerce_products_public_read_active" ON public.commerce_products;
CREATE POLICY "commerce_products_public_read_active"
  ON public.commerce_products FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin Portal currently uses the anon Supabase client after local admin unlock,
-- matching existing admin-managed CMS tables in this project.
DROP POLICY IF EXISTS "commerce_products_admin_insert" ON public.commerce_products;
CREATE POLICY "commerce_products_admin_insert"
  ON public.commerce_products FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "commerce_products_admin_update" ON public.commerce_products;
CREATE POLICY "commerce_products_admin_update"
  ON public.commerce_products FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
