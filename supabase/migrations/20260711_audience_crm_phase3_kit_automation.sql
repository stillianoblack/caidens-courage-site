-- Audience / CRM Phase 3 provider automation. ADDITIVE ONLY.
-- All provider behavior remains disabled until server flags and sandbox configuration are explicit.

alter table public.contacts add column if not exists provider_sync_hold boolean not null default true;

create table if not exists public.provider_contacts (
  id uuid primary key default gen_random_uuid(), contact_id uuid not null references public.contacts(id),
  provider_account_id uuid not null references public.provider_accounts(id), external_contact_id text not null,
  provider_status text not null, remote_unsubscribe_state text, remote_suppression_state text,
  last_synced_at timestamptz, last_observed_at timestamptz, remote_version_or_hash text,
  reconciliation_status text not null default 'pending', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (contact_id, provider_account_id), unique (provider_account_id, external_contact_id)
);

create table if not exists public.email_sync_outbox (
  id uuid primary key default gen_random_uuid(), contact_id uuid not null references public.contacts(id),
  provider_account_id uuid not null references public.provider_accounts(id), operation text not null,
  internal_segment_key text, payload_version integer not null default 1, idempotency_key text not null unique,
  eligibility_version integer not null, consent_version integer not null,
  status text not null default 'held' check (status in ('pending','processing','completed','retryable_failure','permanent_failure','cancelled','held')),
  next_attempt_at timestamptz not null default now(), attempt_count integer not null default 0,
  correlation_id text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.email_sync_attempts (
  id uuid primary key default gen_random_uuid(), outbox_id uuid not null references public.email_sync_outbox(id),
  attempt_number integer not null, started_at timestamptz not null, completed_at timestamptz,
  result_status text not null, provider_response_code integer, provider_request_id text,
  retryable boolean not null default false, sanitized_error text, latency_ms integer,
  created_at timestamptz not null default now(), unique (outbox_id, attempt_number)
);

create table if not exists public.provider_webhook_events (
  id uuid primary key default gen_random_uuid(), provider text not null, external_event_id text not null,
  event_type text not null, signature_status text not null, received_at timestamptz not null default now(),
  processed_at timestamptz, processing_status text not null default 'received', resolved_contact_id uuid references public.contacts(id),
  sanitized_payload jsonb not null default '{}'::jsonb, error_summary text,
  unique (provider, external_event_id)
);

create table if not exists public.provider_metric_sync_runs (
  id uuid primary key default gen_random_uuid(), provider_account_id uuid not null references public.provider_accounts(id),
  status text not null, started_at timestamptz not null default now(), completed_at timestamptz,
  records_processed integer not null default 0, failures integer not null default 0, error_summary text,
  created_at timestamptz not null default now()
);

create table if not exists public.provider_broadcasts (
  id uuid primary key default gen_random_uuid(), provider_account_id uuid not null references public.provider_accounts(id),
  external_broadcast_id text not null, subject text, status text, sent_at timestamptz,
  created_at_remote timestamptz, updated_at_remote timestamptz, synced_at timestamptz not null default now(),
  unique (provider_account_id, external_broadcast_id)
);

create table if not exists public.provider_broadcast_metrics (
  id uuid primary key default gen_random_uuid(), provider_broadcast_id uuid not null references public.provider_broadcasts(id),
  recipients integer, delivered integer, opens integer, open_rate numeric, clicks integer, click_rate numeric,
  unsubscribes integer, unsubscribe_rate numeric, bounces integer, complaints integer,
  synced_at timestamptz not null default now(), source_version text,
  unique (provider_broadcast_id)
);

create table if not exists public.provider_tag_snapshots (
  id uuid primary key default gen_random_uuid(), provider_account_id uuid not null references public.provider_accounts(id),
  external_tag_id text not null, name text not null, observed_at timestamptz not null default now(),
  unique (provider_account_id, external_tag_id)
);

create table if not exists public.provider_sequence_snapshots (
  id uuid primary key default gen_random_uuid(), provider_account_id uuid not null references public.provider_accounts(id),
  external_sequence_id text not null, name text not null, observed_at timestamptz not null default now(),
  unique (provider_account_id, external_sequence_id)
);

create or replace function public.crm_claim_email_sync_outbox(p_now timestamptz default now())
returns setof public.email_sync_outbox language plpgsql security definer set search_path = public as $$
declare claimed_id uuid;
begin
  select id into claimed_id from public.email_sync_outbox
  where status in ('pending','retryable_failure') and next_attempt_at <= p_now
  order by created_at for update skip locked limit 1;
  if claimed_id is null then return; end if;
  return query update public.email_sync_outbox set status='processing', attempt_count=attempt_count+1, updated_at=now()
    where id=claimed_id returning *;
end $$;

revoke all on function public.crm_claim_email_sync_outbox(timestamptz) from public, anon, authenticated;
grant execute on function public.crm_claim_email_sync_outbox(timestamptz) to service_role;

alter table public.provider_contacts enable row level security;
alter table public.email_sync_outbox enable row level security;
alter table public.email_sync_attempts enable row level security;
alter table public.provider_webhook_events enable row level security;
alter table public.provider_metric_sync_runs enable row level security;
alter table public.provider_broadcasts enable row level security;
alter table public.provider_broadcast_metrics enable row level security;
alter table public.provider_tag_snapshots enable row level security;
alter table public.provider_sequence_snapshots enable row level security;

comment on table public.email_sync_outbox is 'Durable provider intents; defaults held and is service-role only.';
comment on table public.provider_webhook_events is 'Sanitized, idempotent provider event ledger. Restrictive events only may affect consent.';
comment on column public.provider_broadcast_metrics.delivered is 'Nullable: Kit v4 broadcast stats did not document delivered count during 2026-07-11 capability review.';
comment on column public.provider_broadcast_metrics.bounces is 'Nullable: unsupported/unverified metrics must remain null.';
comment on column public.provider_broadcast_metrics.complaints is 'Nullable: unsupported/unverified metrics must remain null.';
