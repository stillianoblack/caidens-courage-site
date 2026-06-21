-- Integration audit log for third-party sync (Kit, etc.).
-- Safe to run multiple times.

create table if not exists public.integration_logs (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_name text not null,
  email text null,
  tag_name text null,
  status text not null default 'skipped'
    check (status in ('success', 'skipped', 'failed')),
  error_message text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists integration_logs_provider_status_idx
  on public.integration_logs (provider, status, created_at desc);

create index if not exists integration_logs_email_idx
  on public.integration_logs (lower(email), created_at desc)
  where email is not null;

create index if not exists integration_logs_event_idx
  on public.integration_logs (provider, event_name, created_at desc);

comment on table public.integration_logs is
  'Audit log for third-party integrations such as Kit email tagging.';

comment on column public.integration_logs.provider is 'Integration provider key, e.g. kit';
comment on column public.integration_logs.status is 'success | skipped | failed';

alter table public.integration_logs enable row level security;

-- Service role writes via Netlify functions; no public client access required.
