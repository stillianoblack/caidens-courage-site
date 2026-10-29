-- Bookstore catalog extensions and private digital delivery.
-- Additive only. Does not update hardcover_bundle price, title, or payment link.
-- Does not apply itself to production. Review and run manually after approval.
-- The EPUB object path stays empty until the file is uploaded. Do not invent a filename.

alter table public.commerce_products
  add column if not exists subtitle text,
  add column if not exists description text,
  add column if not exists availability text not null default 'preorder',
  add column if not exists fulfillment_type text not null default 'physical',
  add column if not exists sort_order integer not null default 100,
  add column if not exists is_featured boolean not null default false,
  add column if not exists digital_sales_enabled boolean not null default false,
  add column if not exists kindle_product_url text,
  add column if not exists payment_link_verified_at timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'commerce_products_availability_check') then
    alter table public.commerce_products
      add constraint commerce_products_availability_check
      check (availability in ('in_stock', 'preorder', 'sold_out', 'unavailable'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'commerce_products_fulfillment_type_check') then
    alter table public.commerce_products
      add constraint commerce_products_fulfillment_type_check
      check (fulfillment_type in ('physical', 'digital', 'bundle', 'legacy', 'merchandise'));
  end if;
end $$;

insert into public.commerce_products (
  key, title, display_price_cents, currency, payment_link_url, is_active,
  subtitle, description, availability, fulfillment_type, sort_order, is_featured, digital_sales_enabled
) values
  (
    'paperback',
    'Paperback Edition',
    3000,
    'usd',
    'https://buy.stripe.com/6oU5kCeiz4pO2W3gk03Ru03',
    true,
    '132-page full-color paperback graphic novel',
    'Perfect for young readers and classrooms',
    'preorder',
    'physical',
    30,
    false,
    false
  ),
  (
    'hardcover',
    'Hardcover Edition',
    4999,
    'usd',
    null,
    false,
    '132-page premium hardcover graphic novel',
    'Includes one collectible bookmark and one sticker',
    'preorder',
    'physical',
    40,
    false,
    false
  ),
  (
    'digital_edition',
    'Caiden Vale and the Focus Flame',
    1599,
    'usd',
    null,
    true,
    'Volume 1 · Full-color digital graphic novel',
    'EPUB delivery stays off until KDP Select compatibility and secure delivery are confirmed.',
    'in_stock',
    'digital',
    20,
    false,
    false
  ),
  (
    'courage_adventure_bundle',
    'Courage Adventure Bundle',
    7599,
    'usd',
    null,
    false,
    'Best Value',
    'Signed first-edition hardcover, workbook, Focus Flame Academy access, bookmark, and sticker.',
    'preorder',
    'bundle',
    10,
    true,
    false
  )
on conflict (key) do nothing;

create table if not exists public.bookstore_checkout_intents (
  id uuid primary key default gen_random_uuid(),
  stripe_checkout_session_id text not null unique,
  product_key text not null,
  product_title_snapshot text not null,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'usd',
  stripe_price_id text not null,
  recovery_code_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.bookstore_orders (
  id uuid primary key default gen_random_uuid(),
  product_key text not null,
  product_title_snapshot text not null,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'usd',
  customer_email text,
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text,
  stripe_charge_id text,
  refunded_amount_cents integer not null default 0 check (refunded_amount_cents >= 0),
  status text not null check (status in ('paid', 'failed', 'refunded', 'expired')),
  created_at timestamptz not null default now()
);

create index if not exists bookstore_orders_product_key_idx on public.bookstore_orders (product_key);
create index if not exists bookstore_orders_customer_email_idx on public.bookstore_orders (customer_email);

create table if not exists public.bookstore_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  outcome text not null,
  processed_at timestamptz not null default now()
);

create table if not exists public.digital_entitlements (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.bookstore_orders (id),
  product_key text not null,
  customer_email text,
  recovery_code_hash text not null,
  status text not null default 'active' check (status in ('active', 'revoked')),
  revoked_at timestamptz,
  revocation_reason text,
  created_at timestamptz not null default now(),
  unique (order_id, product_key)
);

create index if not exists digital_entitlements_customer_email_idx
  on public.digital_entitlements (customer_email);

create table if not exists public.digital_book_files (
  product_key text primary key,
  bucket_id text not null default 'digital-books',
  object_path text,
  updated_at timestamptz not null default now(),
  constraint digital_book_files_path_private check (
    object_path is null
    or (
      object_path !~* '^https?://'
      and object_path !~ '\.\.'
      and left(object_path, 1) <> '/'
    )
  )
);

insert into public.digital_book_files (product_key, object_path)
values ('digital_edition', null)
on conflict (product_key) do nothing;

alter table public.bookstore_checkout_intents enable row level security;
alter table public.bookstore_orders enable row level security;
alter table public.bookstore_webhook_events enable row level security;
alter table public.digital_entitlements enable row level security;
alter table public.digital_book_files enable row level security;

create table if not exists public.bookstore_refunds (
  id uuid primary key default gen_random_uuid(),
  stripe_refund_id text not null unique,
  stripe_charge_id text,
  stripe_payment_intent_id text,
  order_id uuid not null references public.bookstore_orders (id),
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null,
  status text not null,
  full_refund boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.bookstore_recovery_tokens (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  customer_email text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.bookstore_recovery_deliveries (
  order_id uuid primary key references public.bookstore_orders (id),
  status text not null check (status in ('sending', 'sent', 'failed')),
  attempt integer not null check (attempt > 0),
  sent_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.bookstore_recovery_attempts (
  id uuid primary key default gen_random_uuid(),
  subject_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists bookstore_recovery_attempts_subject_idx
  on public.bookstore_recovery_attempts (subject_hash, created_at);

alter table public.bookstore_refunds enable row level security;
alter table public.bookstore_recovery_tokens enable row level security;
alter table public.bookstore_recovery_attempts enable row level security;
alter table public.bookstore_recovery_deliveries enable row level security;

revoke all on table public.bookstore_checkout_intents from public, anon, authenticated;
revoke all on table public.bookstore_orders from public, anon, authenticated;
revoke all on table public.bookstore_webhook_events from public, anon, authenticated;
revoke all on table public.digital_entitlements from public, anon, authenticated;
revoke all on table public.digital_book_files from public, anon, authenticated;
revoke all on table public.bookstore_refunds from public, anon, authenticated;
revoke all on table public.bookstore_recovery_tokens from public, anon, authenticated;
revoke all on table public.bookstore_recovery_attempts from public, anon, authenticated;
revoke all on table public.bookstore_recovery_deliveries from public, anon, authenticated;

-- Service role bypasses RLS but still needs explicit table grants. No delete grant.
grant select, insert, update on table public.bookstore_checkout_intents to service_role;
grant select, insert, update on table public.bookstore_orders to service_role;
grant select, insert, update on table public.bookstore_webhook_events to service_role;
grant select, insert, update on table public.digital_entitlements to service_role;
grant select, insert, update on table public.digital_book_files to service_role;
grant select, insert, update on table public.bookstore_refunds to service_role;
grant select, insert, update on table public.bookstore_recovery_tokens to service_role;
grant select, insert, update on table public.bookstore_recovery_deliveries to service_role;
grant select, insert on table public.bookstore_recovery_attempts to service_role;
grant select, insert, update on table public.commerce_products to service_role;

-- Anon and authenticated sessions cannot activate a Payment Link or edit the historical bundle.
-- The migration role and service_role are unchanged so existing catalog rows stay as inserted.
create or replace function public.commerce_products_protect_checkout()
returns trigger
language plpgsql
as $$
declare
  jwt_role text;
begin
  begin
    jwt_role := auth.role();
  exception
    when undefined_function then
      jwt_role := null;
  end;

  if jwt_role is null or jwt_role = 'service_role' then
    return new;
  end if;

  if tg_op = 'UPDATE' and old.key = 'hardcover_bundle' then
    new.key := old.key;
    new.title := old.title;
    new.display_price_cents := old.display_price_cents;
    new.currency := old.currency;
    new.payment_link_url := old.payment_link_url;
    new.stripe_product_id := old.stripe_product_id;
    new.stripe_price_id := old.stripe_price_id;
    new.is_active := old.is_active;
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.payment_link_verified_at := null;
    if new.payment_link_url is not null or new.is_active is true then
      new.is_active := false;
    end if;
    return new;
  end if;

  if new.payment_link_url is distinct from old.payment_link_url
     or new.display_price_cents is distinct from old.display_price_cents
     or new.currency is distinct from old.currency
     or (new.is_active is true and old.is_active is distinct from true) then
    new.payment_link_verified_at := null;
    new.is_active := false;
  else
    new.payment_link_verified_at := old.payment_link_verified_at;
  end if;
  return new;
end $$;

drop trigger if exists commerce_products_protect_checkout on public.commerce_products;
create trigger commerce_products_protect_checkout
  before insert or update on public.commerce_products
  for each row
  execute function public.commerce_products_protect_checkout();

-- Private bucket. No anon or authenticated storage policies: signed URLs are created with the service role.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'digital-books',
  'digital-books',
  false,
  209715200,
  array['application/epub+zip', 'application/octet-stream']::text[]
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

notify pgrst, 'reload schema';
