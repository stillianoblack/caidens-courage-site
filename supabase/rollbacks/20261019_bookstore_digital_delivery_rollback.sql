-- Safe bookstore rollback.
-- Stops instead of deleting customer orders, entitlements, refunds, recovery records, or files.
-- Does not change the historical hardcover_bundle row and does not remove purchased EPUB objects.

do $$
declare
  purchase_rows bigint := 0;
  entitlement_rows bigint := 0;
  refund_rows bigint := 0;
  file_rows bigint := 0;
  object_rows bigint := 0;
begin
  if to_regclass('public.bookstore_orders') is not null then
    execute 'select count(*) from public.bookstore_orders' into purchase_rows;
  end if;
  if to_regclass('public.digital_entitlements') is not null then
    execute 'select count(*) from public.digital_entitlements' into entitlement_rows;
  end if;
  if to_regclass('public.bookstore_refunds') is not null then
    execute 'select count(*) from public.bookstore_refunds' into refund_rows;
  end if;
  if to_regclass('public.digital_book_files') is not null then
    execute 'select count(*) from public.digital_book_files where object_path is not null' into file_rows;
  end if;
  if to_regclass('storage.objects') is not null then
    execute 'select count(*) from storage.objects where bucket_id = ''digital-books''' into object_rows;
  end if;

  if purchase_rows > 0 or entitlement_rows > 0 or refund_rows > 0 or file_rows > 0 or object_rows > 0 then
    raise exception 'Safe rollback stopped because bookstore purchases or files exist. No customer records were deleted.';
  end if;
end $$;

-- Empty unused tables may be dropped. Catalog rows, commerce columns, and the private bucket stay.
drop table if exists public.bookstore_recovery_attempts;
drop table if exists public.bookstore_recovery_deliveries;
drop table if exists public.bookstore_recovery_tokens;
drop table if exists public.bookstore_refunds;
drop table if exists public.digital_entitlements;
drop table if exists public.bookstore_webhook_events;
drop table if exists public.bookstore_checkout_intents;
drop table if exists public.digital_book_files;
drop table if exists public.bookstore_orders;

notify pgrst, 'reload schema';
