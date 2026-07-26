-- Transactional welcome-email delivery log foundation and metadata.
-- This migration is additive, idempotent, server-mediated, and safe to run
-- when the table is absent or when a compatible base table already exists.
--
-- recipient_identifier is a deterministic SHA-256 hex digest of the normalized
-- recipient email: lower(trim(email)). Application code computes the digest;
-- the normalized email itself is never stored in this column.

begin;

create table if not exists public.email_delivery_logs (
  id uuid primary key default gen_random_uuid(),
  recipient_email text not null,
  email_type text not null,
  related_student_id uuid null,
  related_family_id text null,
  related_program_id text null,
  status text not null default 'queued'
    check (status in ('queued', 'sent', 'delivered', 'failed')),
  provider_message_id text null,
  error_message text null,
  created_at timestamptz not null default now(),
  sent_at timestamptz null,
  delivered_at timestamptz null,
  program_type text null,
  recipient_role text null,
  template_type text null,
  recipient_identifier text null,
  correlation_id text null,
  retry_eligible boolean not null default false,
  delivery_event_key text null,
  email_provider text null
);

-- Preserve compatibility with an existing base table while adding only
-- application-required columns that may be absent.
alter table public.email_delivery_logs
  add column if not exists delivered_at timestamptz null,
  add column if not exists program_type text null,
  add column if not exists recipient_role text null,
  add column if not exists template_type text null,
  add column if not exists recipient_identifier text null,
  add column if not exists correlation_id text null,
  add column if not exists retry_eligible boolean not null default false,
  add column if not exists delivery_event_key text null,
  add column if not exists email_provider text null;

create index if not exists email_delivery_logs_type_status_idx
  on public.email_delivery_logs (email_type, status, created_at desc);

create index if not exists email_delivery_logs_recipient_idx
  on public.email_delivery_logs (lower(recipient_email), created_at desc);

create unique index if not exists email_delivery_logs_event_key_unique
  on public.email_delivery_logs (delivery_event_key)
  where delivery_event_key is not null;

create index if not exists email_delivery_logs_correlation_idx
  on public.email_delivery_logs (correlation_id)
  where correlation_id is not null;

create index if not exists email_delivery_logs_program_recipient_idx
  on public.email_delivery_logs (
    program_type,
    recipient_role,
    template_type,
    created_at desc
  );

comment on column public.email_delivery_logs.recipient_identifier is
  'Deterministic SHA-256 hex digest of lower(trim(recipient email)); never the normalized email itself.';

comment on column public.email_delivery_logs.email_provider is
  'Transactional delivery provider identifier such as resend, ses, or sendgrid.';

comment on column public.email_delivery_logs.delivery_event_key is
  'Stable creation or invitation event key used to suppress duplicate initial welcome-email sends.';

comment on table public.email_delivery_logs is
  'Server-mediated audit log for transactional welcome and notification email delivery attempts.';

-- Transactional email writes are performed by Netlify Functions with the
-- Supabase service role. Browser roles receive no direct table privileges.
alter table public.email_delivery_logs enable row level security;

revoke all privileges on table public.email_delivery_logs
  from public, anon, authenticated;

grant select, insert, update on table public.email_delivery_logs
  to service_role;

commit;
