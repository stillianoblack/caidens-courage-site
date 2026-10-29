-- Removes only an unused paperback bundle catalog row.
-- Stops if that key has an order or a Payment Link. Does not touch hardcover_bundle.

do $$
begin
  if to_regclass('public.bookstore_orders') is not null
     and exists (
       select 1
       from public.bookstore_orders
       where product_key = 'courage_adventure_paperback_bundle'
     ) then
    raise exception 'Paperback bundle orders exist. Rollback stopped.';
  end if;

  delete from public.commerce_products
  where key = 'courage_adventure_paperback_bundle'
    and payment_link_url is null
    and display_price_cents = 5999;
end $$;
