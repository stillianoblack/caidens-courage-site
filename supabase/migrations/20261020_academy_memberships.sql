-- Academy membership plans, entitlements, and bundle claim offers.
-- Additive. Does not update orders, EPUB entitlements, family profiles, or historical bundle rows.
-- Does not start the complimentary transition or grant paid access.
-- Review and run manually on staging after approval.

create table if not exists public.academy_membership_plans (
  plan_key text primary key,
  display_name text not null,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'usd',
  billing_interval text not null check (billing_interval in ('month', 'year')),
  stripe_price_id text,
  is_active boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.academy_membership_plans (
  plan_key, display_name, amount_cents, currency, billing_interval, stripe_price_id, is_active
) values
  ('focus_flame_family_monthly', 'Focus Flame Family Monthly', 999, 'usd', 'month', null, false),
  ('focus_flame_family_annual', 'Focus Flame Family Annual', 9900, 'usd', 'year', null, false)
on conflict (plan_key) do nothing;

create table if not exists public.academy_entitlements (
  id uuid primary key default gen_random_uuid(),
  family_program_id uuid,
  customer_email text,
  kind text not null check (kind in ('subscription', 'bundle_included', 'complimentary_transition', 'unrestricted_promise')),
  status text not null check (status in ('proposed', 'active', 'past_due', 'canceled', 'expired')),
  starts_at timestamptz,
  ends_at timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_price_id text,
  order_reference text,
  product_key text,
  promise_source text,
  transition_started_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists academy_entitlements_family_idx
  on public.academy_entitlements (family_program_id);
create index if not exists academy_entitlements_email_idx
  on public.academy_entitlements (customer_email);

create table if not exists public.academy_bundle_claims (
  id uuid primary key default gen_random_uuid(),
  checkout_session_id text not null unique,
  product_key text not null,
  customer_email text not null,
  claim_code_hash text not null unique,
  claim_code_ciphertext text,
  duration_days integer not null check (duration_days in (30, 90)),
  purchase_verified_at timestamptz not null,
  claim_deadline_at timestamptz not null,
  activated_at timestamptz,
  entitlement_id uuid references public.academy_entitlements (id),
  invitation_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.academy_payments (
  stripe_invoice_id text primary key,
  stripe_subscription_id text,
  amount_paid_cents integer not null check (amount_paid_cents >= 0),
  currency text not null,
  paid_at timestamptz not null
);

create table if not exists public.academy_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  outcome text not null,
  processed_at timestamptz not null default now()
);

alter table public.academy_membership_plans enable row level security;
alter table public.academy_entitlements enable row level security;
alter table public.academy_bundle_claims enable row level security;
alter table public.academy_payments enable row level security;
alter table public.academy_webhook_events enable row level security;

revoke all on table public.academy_membership_plans from public, anon, authenticated;
revoke all on table public.academy_entitlements from public, anon, authenticated;
revoke all on table public.academy_bundle_claims from public, anon, authenticated;
revoke all on table public.academy_payments from public, anon, authenticated;
revoke all on table public.academy_webhook_events from public, anon, authenticated;

grant select, insert, update on table public.academy_membership_plans to service_role;
grant select, insert, update on table public.academy_entitlements to service_role;
grant select, insert, update on table public.academy_bundle_claims to service_role;
grant select, insert, update on table public.academy_payments to service_role;
grant select, insert, update on table public.academy_webhook_events to service_role;
