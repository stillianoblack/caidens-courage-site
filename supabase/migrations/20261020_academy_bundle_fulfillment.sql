-- Additive fulfillment and claim-token tables for Courage Adventure Bundle checkout.
-- Does not update historical orders, payment links, or existing family access.
-- Do not apply until a separate staging approval.

create table if not exists public.bookstore_order_fulfillment (
  order_id uuid primary key references public.bookstore_orders (id),
  checkout_session_id text not null unique,
  shipping_name text,
  shipping_line1 text not null,
  shipping_line2 text,
  shipping_city text not null,
  shipping_state text,
  shipping_postal_code text not null,
  shipping_country text not null,
  shipping_rate_id text not null,
  shipping_method_label text not null,
  shipping_cents integer not null check (shipping_cents >= 0),
  tax_cents integer not null check (tax_cents >= 0),
  subtotal_cents integer not null check (subtotal_cents > 0),
  fulfillment_status text not null default 'unfulfilled' check (fulfillment_status in ('unfulfilled', 'fulfilled', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.academy_claim_tokens (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.academy_bundle_claims (id),
  purpose text not null check (purpose in ('invitation', 'activation')),
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.academy_bundle_claims
  add column if not exists invitation_sent_at timestamptz;

alter table public.bookstore_order_fulfillment enable row level security;
alter table public.academy_claim_tokens enable row level security;

revoke all on table public.bookstore_order_fulfillment from public, anon, authenticated;
revoke all on table public.academy_claim_tokens from public, anon, authenticated;

grant select, insert, update on table public.bookstore_order_fulfillment to service_role;
grant select, insert, update on table public.academy_claim_tokens to service_role;
