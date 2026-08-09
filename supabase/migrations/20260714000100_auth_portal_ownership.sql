-- Additive Auth-backed ownership for family, student, and facilitator portal access.
-- No legacy access-code behavior is removed by this migration.

create schema if not exists private;

create table if not exists public.portal_program_memberships (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  program_id uuid not null references public.pilot_programs(id) on delete cascade,
  portal_role text not null check (portal_role in ('family_guardian','student','facilitator')),
  status text not null default 'active' check (status in ('active','revoked','expired')),
  compatibility_mode boolean not null default true,
  grant_source text not null check (grant_source in ('admin_verified','invitation','beta_migration','staging_test')),
  grant_reason text not null,
  granted_by uuid references auth.users(id),
  granted_at timestamptz not null default now(),
  valid_until timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'revoked' or revoked_at is not null)
);

create unique index if not exists portal_program_memberships_active_unique
  on public.portal_program_memberships (auth_user_id, program_id, portal_role)
  where status = 'active';
create index if not exists portal_program_memberships_program_idx
  on public.portal_program_memberships (program_id, portal_role, status);

create table if not exists public.portal_participant_access (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid not null references public.portal_program_memberships(id) on delete cascade,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  access_scope text not null check (access_scope in ('self','guardian','facilitator')),
  status text not null default 'active' check (status in ('active','revoked','expired')),
  granted_by uuid references auth.users(id),
  grant_reason text not null,
  granted_at timestamptz not null default now(),
  valid_until timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'revoked' or revoked_at is not null)
);

create unique index if not exists portal_participant_access_active_unique
  on public.portal_participant_access (auth_user_id, participant_id, access_scope)
  where status = 'active';
create index if not exists portal_participant_access_participant_idx
  on public.portal_participant_access (participant_id, status);

create table if not exists public.portal_ownership_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_auth_user_id uuid references auth.users(id),
  action text not null check (action in ('grant','revoke','expire','verify','compatibility_change')),
  target_auth_user_id uuid not null references auth.users(id) on delete cascade,
  membership_id uuid references public.portal_program_memberships(id) on delete set null,
  participant_access_id uuid references public.portal_participant_access(id) on delete set null,
  reason text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.portal_program_memberships enable row level security;
alter table public.portal_participant_access enable row level security;
alter table public.portal_ownership_audit_events enable row level security;

revoke all on public.portal_program_memberships from anon, authenticated;
revoke all on public.portal_participant_access from anon, authenticated;
revoke all on public.portal_ownership_audit_events from anon, authenticated;
grant select on public.portal_program_memberships to authenticated;
grant select on public.portal_participant_access to authenticated;
grant all on public.portal_program_memberships, public.portal_participant_access,
  public.portal_ownership_audit_events to service_role;

drop policy if exists portal_program_memberships_read_own on public.portal_program_memberships;
create policy portal_program_memberships_read_own
  on public.portal_program_memberships for select to authenticated
  using (auth.uid() = auth_user_id);

drop policy if exists portal_participant_access_read_own on public.portal_participant_access;
create policy portal_participant_access_read_own
  on public.portal_participant_access for select to authenticated
  using (auth.uid() = auth_user_id);

create or replace function private.portal_can_access_program_id(target_program_id uuid)
returns boolean language sql stable security definer
set search_path = pg_catalog, public, private
as $$
  select exists (
    select 1 from public.portal_program_memberships membership
    where membership.auth_user_id = auth.uid()
      and membership.program_id = target_program_id
      and membership.status = 'active'
      and (membership.valid_until is null or membership.valid_until > now())
  )
$$;

create or replace function private.portal_can_access_program_code(target_program_code text)
returns boolean language sql stable security definer
set search_path = pg_catalog, public, private
as $$
  select exists (
    select 1
    from public.portal_program_memberships membership
    join public.pilot_programs program on program.id = membership.program_id
    where membership.auth_user_id = auth.uid()
      and membership.status = 'active'
      and (membership.valid_until is null or membership.valid_until > now())
      and program.program_code = target_program_code
  )
$$;

create or replace function private.portal_can_access_participant(target_participant_id uuid)
returns boolean language sql stable security definer
set search_path = pg_catalog, public, private
as $$
  select exists (
    select 1 from public.portal_participant_access access
    join public.portal_program_memberships membership on membership.id = access.membership_id
    where access.auth_user_id = auth.uid()
      and access.participant_id = target_participant_id
      and access.status = 'active'
      and membership.status = 'active'
      and (access.valid_until is null or access.valid_until > now())
      and (membership.valid_until is null or membership.valid_until > now())
  ) or exists (
    select 1
    from public.portal_program_memberships membership
    join public.pilot_programs program on program.id = membership.program_id
    join public.participants participant on participant.id = target_participant_id
    where membership.auth_user_id = auth.uid()
      and membership.portal_role = 'facilitator'
      and membership.status = 'active'
      and (membership.valid_until is null or membership.valid_until > now())
      and (
        participant.program_code = program.program_code
        or exists (
          select 1 from public.student_family_links link
          where link.student_id = participant.id
            and link.camp_program_code = program.program_code
        )
      )
  )
$$;

create or replace function private.portal_can_access_participant_text(target_participant_id text)
returns boolean language plpgsql stable security definer
set search_path = pg_catalog, public, private
as $$
begin
  return private.portal_can_access_participant(target_participant_id::uuid);
exception when invalid_text_representation then
  return false;
end
$$;

revoke all on function private.portal_can_access_program_id(uuid) from public, anon;
revoke all on function private.portal_can_access_program_code(text) from public, anon;
revoke all on function private.portal_can_access_participant(uuid) from public, anon;
revoke all on function private.portal_can_access_participant_text(text) from public, anon;
grant execute on function private.portal_can_access_program_id(uuid) to authenticated, service_role;
grant execute on function private.portal_can_access_program_code(text) to authenticated, service_role;
grant execute on function private.portal_can_access_participant(uuid) to authenticated, service_role;
grant execute on function private.portal_can_access_participant_text(text) to authenticated, service_role;

create or replace function public.grant_portal_ownership(
  target_auth_user_id uuid,
  target_program_id uuid,
  target_portal_role text,
  target_participant_id uuid default null,
  grant_source_input text default 'admin_verified',
  reason_input text default 'Explicit verified ownership grant',
  actor_auth_user_id_input uuid default null
) returns jsonb
language plpgsql security definer set search_path = pg_catalog, public, private
as $$
declare
  membership public.portal_program_memberships%rowtype;
  participant_access public.portal_participant_access%rowtype;
  program_record public.pilot_programs%rowtype;
  access_scope_value text;
begin
  if target_portal_role not in ('family_guardian','student','facilitator') then
    raise exception 'Unsupported portal role.';
  end if;
  if grant_source_input not in ('admin_verified','invitation','beta_migration','staging_test') then
    raise exception 'Unsupported grant source.';
  end if;
  if btrim(reason_input) = '' then raise exception 'A grant reason is required.'; end if;
  if target_portal_role in ('family_guardian','student') and target_participant_id is null then
    raise exception 'Family and student grants require an explicit participant.';
  end if;

  select * into program_record from public.pilot_programs where id = target_program_id;
  if not found then raise exception 'Program does not exist.'; end if;

  if target_participant_id is not null and not exists (
    select 1 from public.participants participant
    where participant.id = target_participant_id and (
      participant.program_code = program_record.program_code
      or exists (
        select 1 from public.student_family_links link
        where link.student_id = participant.id
          and (link.camp_program_code = program_record.program_code
            or link.family_program_code = program_record.program_code)
      )
    )
  ) then
    raise exception 'Participant is not explicitly connected to the selected program.';
  end if;

  select * into membership from public.portal_program_memberships
  where auth_user_id = target_auth_user_id and program_id = target_program_id
    and portal_role = target_portal_role and status = 'active'
  limit 1;

  if not found then
    insert into public.portal_program_memberships (
      auth_user_id, program_id, portal_role, compatibility_mode, grant_source,
      grant_reason, granted_by
    ) values (
      target_auth_user_id, target_program_id, target_portal_role, true,
      grant_source_input, btrim(reason_input), actor_auth_user_id_input
    ) returning * into membership;
  end if;

  if target_participant_id is not null then
    access_scope_value := case target_portal_role
      when 'student' then 'self'
      when 'family_guardian' then 'guardian'
      else 'facilitator' end;
    select * into participant_access from public.portal_participant_access
    where auth_user_id = target_auth_user_id and participant_id = target_participant_id
      and access_scope = access_scope_value and status = 'active'
    limit 1;
    if not found then
      insert into public.portal_participant_access (
        membership_id, auth_user_id, participant_id, access_scope,
        granted_by, grant_reason
      ) values (
        membership.id, target_auth_user_id, target_participant_id, access_scope_value,
        actor_auth_user_id_input, btrim(reason_input)
      ) returning * into participant_access;
    end if;
  end if;

  insert into public.portal_ownership_audit_events (
    actor_auth_user_id, action, target_auth_user_id, membership_id,
    participant_access_id, reason, metadata
  ) values (
    actor_auth_user_id_input, 'grant', target_auth_user_id, membership.id,
    participant_access.id, btrim(reason_input),
    jsonb_build_object('portal_role', target_portal_role, 'grant_source', grant_source_input)
  );

  return jsonb_build_object(
    'membership_id', membership.id,
    'participant_access_id', participant_access.id,
    'portal_role', membership.portal_role,
    'compatibility_mode', membership.compatibility_mode
  );
end
$$;

revoke all on function public.grant_portal_ownership(uuid,uuid,text,uuid,text,text,uuid)
  from public, anon, authenticated;
grant execute on function public.grant_portal_ownership(uuid,uuid,text,uuid,text,text,uuid)
  to service_role;

comment on table public.portal_program_memberships is
  'Explicit Auth-user to pilot-program authorization. Never inferred from email or access code.';
comment on table public.portal_participant_access is
  'Explicit adult/student access to a participant. Contains no marketing consent or child contact record.';
comment on column public.portal_program_memberships.compatibility_mode is
  'Temporary per-membership marker while legacy access-code sessions remain available behind a server feature flag.';
