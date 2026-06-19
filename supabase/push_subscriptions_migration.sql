-- Parent/family web push subscriptions (Family Portal opt-in only).
-- user_id = family pilot_programs.id (parent account scope).
-- child_id optional — scopes subscription to a specific child when set.
-- Safe to run multiple times.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  child_id uuid references public.participants (id) on delete set null,
  endpoint text not null,
  subscription jsonb not null,
  enabled boolean not null default true,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint push_subscriptions_endpoint_unique unique (endpoint)
);

create index if not exists push_subscriptions_user_id_idx
  on public.push_subscriptions (user_id);

create index if not exists push_subscriptions_child_id_idx
  on public.push_subscriptions (child_id)
  where child_id is not null;

create index if not exists push_subscriptions_enabled_idx
  on public.push_subscriptions (enabled)
  where enabled = true;

create index if not exists push_subscriptions_endpoint_idx
  on public.push_subscriptions (endpoint);

comment on table public.push_subscriptions is
  'Web push subscriptions keyed by family user_id (pilot_programs.id). Parent email is not stored here.';
comment on column public.push_subscriptions.user_id is
  'Family/parent account id — pilot_programs.id for independent and claimed family portals.';
comment on column public.push_subscriptions.child_id is
  'Optional participant id when subscription is scoped to one child.';

alter table public.push_subscriptions enable row level security;

-- No anon policies — reads/writes go through Netlify functions with service role.
