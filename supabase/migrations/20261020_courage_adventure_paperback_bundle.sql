-- Adds the paperback Courage Adventure Bundle.
-- Insert only. Existing catalog rows, prices, and payment links are left unchanged.
-- Does not apply itself. Review and run manually on staging after approval.

insert into public.commerce_products (
  key,
  title,
  display_price_cents,
  currency,
  payment_link_url,
  is_active,
  subtitle,
  description,
  availability,
  fulfillment_type,
  sort_order,
  is_featured,
  digital_sales_enabled
) values (
  'courage_adventure_paperback_bundle',
  'Courage Adventure Bundle — Paperback',
  5999,
  'usd',
  null,
  false,
  null,
  'Paperback graphic novel, workbook, 30 days of Academy access after parent activation, bookmark, and sticker.',
  'preorder',
  'bundle',
  15,
  false,
  false
)
on conflict (key) do nothing;
