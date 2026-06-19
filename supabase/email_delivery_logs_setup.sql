create table if not exists public.email_delivery_logs (
  id uuid primary key default gen_random_uuid(),
  recipient_email text not null,
  email_type text not null,
  related_student_id uuid null,
  related_family_id text null,
  related_program_id text null,
  status text not null default 'queued'
    check (status in ('queued', 'sent', 'failed', 'skipped')),
  provider_message_id text null,
  error_message text null,
  created_at timestamptz not null default now(),
  sent_at timestamptz null
);

create index if not exists email_delivery_logs_type_status_idx
  on public.email_delivery_logs (email_type, status, created_at desc);

create index if not exists email_delivery_logs_recipient_idx
  on public.email_delivery_logs (lower(recipient_email), created_at desc);

comment on table public.email_delivery_logs is
  'Audit log for welcome, notification, and skipped email delivery attempts.';
