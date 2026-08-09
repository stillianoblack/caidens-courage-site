-- Audience / CRM Phase 1 foundation.
-- ADDITIVE ONLY. Do not run against production without deployed-schema review.
-- All tables are default-deny through RLS: no anon/authenticated policies are created.

create table if not exists public.crm_admin_roles (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key in ('internal_admin', 'audience_admin', 'organization_admin', 'read_only_admin')),
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

insert into public.crm_admin_roles (key, name, description) values
  ('internal_admin', 'Internal administrator', 'Global read access to Phase 1 CRM resources.'),
  ('audience_admin', 'Audience administrator', 'Global read access to approved CRM resources.'),
  ('organization_admin', 'Organization administrator', 'Read access limited to an explicit organization scope.'),
  ('read_only_admin', 'Read-only administrator', 'Read-only CRM access within assigned scope.')
on conflict (key) do nothing;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization_type text not null check (organization_type in ('school', 'camp', 'district', 'after_school_program', 'community_partner', 'family', 'internal')),
  status text not null default 'active' check (status in ('active', 'inactive', 'pending', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  parent_unit_id uuid references public.organization_units(id),
  name text not null,
  unit_type text not null check (unit_type in ('school', 'camp', 'classroom', 'cohort', 'family', 'program')),
  status text not null default 'active' check (status in ('active', 'inactive', 'pending', 'archived')),
  starts_at timestamptz,
  ends_at timestamptz,
  legacy_program_id uuid,
  legacy_program_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_admin_role_assignments (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id),
  role_id uuid not null references public.crm_admin_roles(id),
  organization_id uuid references public.organizations(id),
  organization_unit_id uuid references public.organization_units(id),
  status text not null default 'active' check (status in ('active', 'revoked')),
  granted_by uuid references auth.users(id),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'revoked' or revoked_at is not null)
);

create unique index if not exists crm_admin_role_assignments_active_unique
  on public.crm_admin_role_assignments (
    auth_user_id,
    role_id,
    coalesce(organization_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(organization_unit_id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) where status = 'active';

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  primary_email text,
  normalized_email text,
  first_name text,
  last_name text,
  contact_kind text not null default 'unknown' check (contact_kind in ('marketing_contact', 'platform_user', 'customer', 'organization_member', 'internal_admin', 'unknown')),
  status text not null default 'active' check (status in ('active', 'archived', 'pending_review')),
  created_by_type text not null default 'system' check (created_by_type in ('admin', 'system', 'import')),
  created_by_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contacts_normalized_email_idx on public.contacts (normalized_email) where normalized_email is not null;
create index if not exists contacts_kind_status_idx on public.contacts (contact_kind, status, created_at desc);

create table if not exists public.crm_platform_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id),
  contact_id uuid not null unique references public.contacts(id),
  account_status text not null default 'active' check (account_status in ('invited', 'active', 'suspended', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_sources (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id),
  source_type text not null,
  source_record_type text,
  source_record_id text,
  source_key text,
  captured_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_identity_links (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id),
  source_record_type text not null,
  source_record_id text not null,
  confidence text not null check (confidence in ('high', 'medium', 'low', 'unknown')),
  match_reason text not null,
  review_status text not null default 'pending' check (review_status in ('pending', 'confirmed', 'rejected', 'conflict')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  conflict_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id),
  organization_id uuid not null references public.organizations(id),
  organization_unit_id uuid references public.organization_units(id),
  role_key text not null,
  ownership_flag boolean not null default false,
  status text not null default 'active' check (status in ('active', 'inactive', 'pending', 'ended')),
  assignment_source text not null,
  evidence_type text,
  evidence_id text,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  intended_email text,
  intended_contact_id uuid references public.contacts(id),
  organization_id uuid references public.organizations(id),
  organization_unit_id uuid references public.organization_units(id),
  role_key text not null,
  status text not null default 'pending' check (status in ('pending', 'consumed', 'expired', 'revoked')),
  issued_by uuid not null references auth.users(id),
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.access_grants (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id),
  scope_type text not null,
  scope_id uuid not null,
  permission_key text not null,
  grant_source text not null,
  status text not null default 'active' check (status in ('active', 'revoked', 'expired')),
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.guardian_relationships (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id),
  participant_id uuid not null,
  relationship_type text not null check (relationship_type in ('parent', 'guardian', 'caregiver', 'authorized_adult')),
  status text not null default 'pending' check (status in ('pending', 'verified', 'ended')),
  verification_source text not null,
  verified_at timestamptz,
  verified_by uuid references auth.users(id),
  legacy_student_family_link_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_auth_user_id uuid references auth.users(id),
  actor_role text not null,
  action text not null,
  target_type text not null,
  target_id uuid,
  organization_id uuid references public.organizations(id),
  request_correlation_id text not null,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists organization_units_org_idx on public.organization_units (organization_id, status);
create index if not exists organization_memberships_org_idx on public.organization_memberships (organization_id, status);
create index if not exists organization_memberships_contact_idx on public.organization_memberships (contact_id, status);
create index if not exists contact_sources_contact_idx on public.contact_sources (contact_id, captured_at desc);
create index if not exists contact_identity_links_contact_idx on public.contact_identity_links (contact_id, review_status);
create index if not exists admin_audit_events_actor_idx on public.admin_audit_events (actor_auth_user_id, created_at desc);

alter table public.crm_admin_roles enable row level security;
alter table public.crm_admin_role_assignments enable row level security;
alter table public.contacts enable row level security;
alter table public.crm_platform_profiles enable row level security;
alter table public.contact_sources enable row level security;
alter table public.contact_identity_links enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_units enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.invitations enable row level security;
alter table public.access_grants enable row level security;
alter table public.guardian_relationships enable row level security;
alter table public.admin_audit_events enable row level security;

comment on table public.contacts is 'Adult-only CRM contacts. Phase 1 has no import or browser write path.';
comment on table public.crm_platform_profiles is 'Optional explicit link between an adult CRM contact and an existing Auth user. Phase 1 creates no links automatically.';
comment on column public.contacts.normalized_email is 'Matching aid only; intentionally not globally unique and never authorizes a merge.';
comment on table public.guardian_relationships is 'Adult-to-participant relationship structure; does not imply consent or marketing eligibility.';
comment on column public.guardian_relationships.participant_id is 'Legacy participant identifier. No FK is added until deployed legacy schema is verified.';
comment on column public.guardian_relationships.legacy_student_family_link_id is 'Legacy link identifier. No FK is added until deployed legacy schema is verified.';
comment on table public.crm_admin_role_assignments is 'Server-managed CRM authorization. No client policies are defined.';
comment on table public.admin_audit_events is 'Server-managed CRM audit trail. Metadata must be redacted and minimized.';
comment on table public.invitations is 'Phase 1 structure only. Tokens are stored only as hashes and no live invitation endpoint exists.';
