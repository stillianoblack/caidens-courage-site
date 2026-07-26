-- Additive metadata for transactional welcome-email auditing and safe recovery.
--
-- recipient_identifier is a deterministic SHA-256 hex digest of the normalized
-- recipient email: lower(trim(email)). Application code computes the digest;
-- the normalized email itself is never stored in this column.

alter table public.email_delivery_logs
  add column if not exists program_type text null,
  add column if not exists recipient_role text null,
  add column if not exists template_type text null,
  add column if not exists recipient_identifier text null,
  add column if not exists correlation_id text null,
  add column if not exists retry_eligible boolean not null default false,
  add column if not exists delivery_event_key text null,
  add column if not exists email_provider text null;

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
