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
  delivered_at timestamptz null
);

alter table public.email_delivery_logs
  add column if not exists delivered_at timestamptz null;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'email_delivery_logs_status_check'
      and conrelid = 'public.email_delivery_logs'::regclass
  ) then
    alter table public.email_delivery_logs drop constraint email_delivery_logs_status_check;
  end if;

  update public.email_delivery_logs
    set status = 'failed',
        error_message = coalesce(error_message, 'Legacy skipped status migrated to failed.')
    where status = 'skipped';

  alter table public.email_delivery_logs
    add constraint email_delivery_logs_status_check
    check (status in ('queued', 'sent', 'delivered', 'failed'));
exception
  when duplicate_object then null;
end $$;

create index if not exists email_delivery_logs_type_status_idx
  on public.email_delivery_logs (email_type, status, created_at desc);

create index if not exists email_delivery_logs_recipient_idx
  on public.email_delivery_logs (lower(recipient_email), created_at desc);

comment on table public.email_delivery_logs is
  'Audit log for welcome, notification, and email delivery attempts.';
