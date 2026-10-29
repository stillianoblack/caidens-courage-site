-- Stop anonymous and authenticated browser sessions from writing the public catalog.
-- Does not delete or update catalog rows. Does not change prices or Payment Links.
-- Bookstore pages keep SELECT. Admin saves go through the service-role Netlify function.
-- Do not apply to production until staging verification is approved.

drop policy if exists "commerce_products_admin_insert" on public.commerce_products;
drop policy if exists "commerce_products_admin_update" on public.commerce_products;

revoke insert, update, delete on table public.commerce_products from public, anon, authenticated;
grant select on table public.commerce_products to anon, authenticated;
grant select, insert, update on table public.commerce_products to service_role;

-- The bookstore reads products by key, including editions that are not purchasable yet.
do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and tablename = 'commerce_products'
      and policyname = 'commerce_products_public_read_active'
  ) then
    create policy commerce_products_public_read_active
      on public.commerce_products
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;

notify pgrst, 'reload schema';
