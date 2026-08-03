-- Secure, revocable facilitator compatibility sessions.
-- Additive and idempotent. This migration is intentionally not executed by Codex.

create extension if not exists pgcrypto;

create table if not exists public.facilitator_compatibility_sessions (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  environment text not null,
  role text not null default 'facilitator',
  program_id uuid not null references public.pilot_programs(id) on delete cascade,
  program_code text not null,
  facilitator_identity_hash text,
  remember_device boolean not null default false,
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoke_reason text,
  constraint facilitator_compatibility_sessions_token_hash_format
    check (token_hash ~ '^[0-9a-f]{64}$'),
  constraint facilitator_compatibility_sessions_environment
    check (environment in ('production', 'deploy-preview', 'branch-deploy', 'dev')),
  constraint facilitator_compatibility_sessions_role
    check (role = 'facilitator'),
  constraint facilitator_compatibility_sessions_expiration
    check (expires_at > issued_at),
  constraint facilitator_compatibility_sessions_revocation
    check (
      (revoked_at is null and revoke_reason is null)
      or revoked_at is not null
    )
);

comment on table public.facilitator_compatibility_sessions is
  'Server-only store for hashed, opaque facilitator compatibility sessions.';
comment on column public.facilitator_compatibility_sessions.token_hash is
  'SHA-256 hash of the random cookie token. The raw token is never stored.';
comment on column public.facilitator_compatibility_sessions.environment is
  'Netlify runtime context that issued the session; cross-context use fails closed.';
comment on column public.facilitator_compatibility_sessions.facilitator_identity_hash is
  'Optional normalized facilitator identifier hash; never stores the raw email.';

create index if not exists facilitator_compatibility_sessions_active_lookup_idx
  on public.facilitator_compatibility_sessions (token_hash, environment, expires_at)
  where revoked_at is null;

create index if not exists facilitator_compatibility_sessions_program_idx
  on public.facilitator_compatibility_sessions (program_id, expires_at);

create index if not exists facilitator_compatibility_sessions_cleanup_idx
  on public.facilitator_compatibility_sessions (expires_at, revoked_at);

alter table public.facilitator_compatibility_sessions enable row level security;
alter table public.facilitator_compatibility_sessions force row level security;

revoke all on table public.facilitator_compatibility_sessions from public;
revoke all on table public.facilitator_compatibility_sessions from anon;
revoke all on table public.facilitator_compatibility_sessions from authenticated;
grant select, insert, update, delete on table public.facilitator_compatibility_sessions to service_role;

create or replace function public.purge_expired_facilitator_compatibility_sessions(
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

  delete from public.facilitator_compatibility_sessions
  where expires_at < now() - retention
     or (revoked_at is not null and revoked_at < now() - retention);

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.purge_expired_facilitator_compatibility_sessions(interval) from public;
revoke all on function public.purge_expired_facilitator_compatibility_sessions(interval) from anon;
revoke all on function public.purge_expired_facilitator_compatibility_sessions(interval) from authenticated;
grant execute on function public.purge_expired_facilitator_compatibility_sessions(interval) to service_role;
