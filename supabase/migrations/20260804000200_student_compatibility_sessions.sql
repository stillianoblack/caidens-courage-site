-- Secure, revocable student compatibility sessions.
-- Additive and idempotent. This migration is intentionally not executed by Codex.

create extension if not exists pgcrypto;

create table if not exists public.student_compatibility_sessions (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  environment text not null,
  participant_id uuid not null references public.participants(id) on delete cascade,
  program_id uuid not null references public.pilot_programs(id) on delete cascade,
  program_code text not null,
  role text not null default 'student',
  originating_facilitator_session_id uuid
    references public.facilitator_compatibility_sessions(id) on delete set null,
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoke_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_compatibility_sessions_token_hash_format
    check (token_hash ~ '^[0-9a-f]{64}$'),
  constraint student_compatibility_sessions_environment
    check (environment in ('production', 'deploy-preview', 'branch-deploy', 'dev')),
  constraint student_compatibility_sessions_role
    check (role = 'student'),
  constraint student_compatibility_sessions_program_code
    check (length(btrim(program_code)) between 1 and 120),
  constraint student_compatibility_sessions_expiration
    check (expires_at > issued_at),
  constraint student_compatibility_sessions_duration
    check (expires_at <= issued_at + interval '8 hours'),
  constraint student_compatibility_sessions_revocation
    check (
      (revoked_at is null and revoke_reason is null)
      or revoked_at is not null
    )
);

comment on table public.student_compatibility_sessions is
  'Server-only store for hashed, opaque student sessions issued after PIN or facilitator authorization.';
comment on column public.student_compatibility_sessions.token_hash is
  'SHA-256 hash of the 256-bit random cookie token. The raw token is never stored.';
comment on column public.student_compatibility_sessions.environment is
  'Netlify runtime context that issued the session; cross-context use fails closed.';
comment on column public.student_compatibility_sessions.originating_facilitator_session_id is
  'Optional audit link for a student session launched by an authenticated facilitator.';

create index if not exists student_compatibility_sessions_active_lookup_idx
  on public.student_compatibility_sessions (token_hash, environment, expires_at)
  where revoked_at is null;

create index if not exists student_compatibility_sessions_participant_idx
  on public.student_compatibility_sessions (participant_id, expires_at);

create index if not exists student_compatibility_sessions_program_idx
  on public.student_compatibility_sessions (program_id, program_code, expires_at);

create index if not exists student_compatibility_sessions_expiration_cleanup_idx
  on public.student_compatibility_sessions (expires_at);

create index if not exists student_compatibility_sessions_revoked_cleanup_idx
  on public.student_compatibility_sessions (revoked_at)
  where revoked_at is not null;

alter table public.student_compatibility_sessions enable row level security;
alter table public.student_compatibility_sessions force row level security;

revoke all on table public.student_compatibility_sessions from public;
revoke all on table public.student_compatibility_sessions from anon;
revoke all on table public.student_compatibility_sessions from authenticated;
grant select, insert, update, delete on table public.student_compatibility_sessions to service_role;

create or replace function public.purge_expired_student_compatibility_sessions(
  retention interval default interval '7 days'
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_count bigint;
begin
  if retention < interval '0 days' then
    raise exception 'retention must not be negative';
  end if;

  delete from public.student_compatibility_sessions
  where expires_at < now() - retention
     or (revoked_at is not null and revoked_at < now() - retention);

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.purge_expired_student_compatibility_sessions(interval) from public;
revoke all on function public.purge_expired_student_compatibility_sessions(interval) from anon;
revoke all on function public.purge_expired_student_compatibility_sessions(interval) from authenticated;
grant execute on function public.purge_expired_student_compatibility_sessions(interval) to service_role;
