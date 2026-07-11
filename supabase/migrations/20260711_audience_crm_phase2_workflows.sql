-- Audience / CRM Phase 2 business workflows. ADDITIVE ONLY.
-- Default-deny RLS; trusted server APIs are the only application access path.

alter table public.contacts add column if not exists role_title text;
alter table public.contacts add column if not exists audience_type text;
alter table public.contacts add column if not exists do_not_enroll boolean not null default true;

create table if not exists public.consent_events (
  id uuid primary key default gen_random_uuid(), contact_id uuid not null references public.contacts(id),
  channel text not null check (channel = 'email'),
  purpose text not null check (purpose in ('marketing','product_updates','newsletter','transactional_preference')),
  action text not null check (action in ('granted','withdrawn','corrected','imported_unclear','suppressed','provider_unsubscribe','provider_complaint','provider_bounce')),
  status_after text not null check (status_after in ('confirmed','unclear','unknown','unsubscribed','suppressed')),
  source text not null, notice_version text, occurred_at timestamptz not null, recorded_at timestamptz not null default now(),
  actor_type text not null, actor_id uuid, evidence_reference text, idempotency_key text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.communication_preferences (
  id uuid primary key default gen_random_uuid(), contact_id uuid not null references public.contacts(id),
  channel text not null check (channel = 'email'), purpose text not null,
  status text not null check (status in ('confirmed','unclear','unknown','unsubscribed','suppressed')),
  effective_at timestamptz not null, winning_consent_event_id uuid not null references public.consent_events(id),
  suppression_reason text, source text not null, version integer not null default 1, updated_at timestamptz not null default now(),
  unique (contact_id, channel, purpose)
);

create table if not exists public.lifecycle_events (
  id uuid primary key default gen_random_uuid(), contact_id uuid not null references public.contacts(id),
  from_stage text, to_stage text not null check (to_stage in ('new_contact','prospect','qualified_lead','proposal_sent','pilot','customer','active_partner','past_customer','unknown')),
  reason text not null, evidence_type text, evidence_id text, actor_auth_user_id uuid references auth.users(id),
  occurred_at timestamptz not null default now(), idempotency_key text not null unique, created_at timestamptz not null default now()
);

create table if not exists public.contact_lifecycle_state (
  contact_id uuid primary key references public.contacts(id), stage text not null,
  winning_lifecycle_event_id uuid not null references public.lifecycle_events(id), version integer not null default 1,
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_interests (
  id uuid primary key default gen_random_uuid(), contact_id uuid not null references public.contacts(id),
  interest_key text not null check (interest_key in ('book','family_membership','camp_program','school_program','classroom_program','sel_platform','facilitator_resources','newsletter','product_updates')),
  source text not null, confidence text not null check (confidence in ('high','medium','low','unknown')),
  expressed_at timestamptz not null default now(), expires_at timestamptz,
  status text not null default 'active' check (status in ('active','removed','expired')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.customer_relationships (
  id uuid primary key default gen_random_uuid(), contact_id uuid references public.contacts(id), organization_id uuid references public.organizations(id),
  relationship_type text not null, customer_status text not null, source_system text not null,
  external_customer_id text, evidence_type text not null, evidence_id text not null,
  starts_at timestamptz not null, ends_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (contact_id is not null or organization_id is not null)
);

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(), customer_relationship_id uuid not null references public.customer_relationships(id),
  entitlement_key text not null, scope_type text not null, scope_id uuid, status text not null default 'active',
  starts_at timestamptz not null, ends_at timestamptz, evidence_type text not null, evidence_id text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.crm_notes (
  id uuid primary key default gen_random_uuid(), contact_id uuid references public.contacts(id), organization_id uuid references public.organizations(id),
  body text not null check (char_length(body) between 1 and 5000), created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz, archived_at timestamptz,
  check (contact_id is not null or organization_id is not null)
);

create table if not exists public.crm_tasks (
  id uuid primary key default gen_random_uuid(), title text not null, description text,
  related_contact_id uuid references public.contacts(id), related_organization_id uuid references public.organizations(id),
  assigned_to_auth_user_id uuid not null references auth.users(id), created_by_auth_user_id uuid not null references auth.users(id),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  status text not null default 'open' check (status in ('open','in_progress','completed','cancelled')),
  due_at timestamptz, reminder_at timestamptz, completed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.crm_activities (
  id uuid primary key default gen_random_uuid(), contact_id uuid references public.contacts(id), organization_id uuid references public.organizations(id),
  activity_type text not null, actor_auth_user_id uuid references auth.users(id), summary text not null,
  metadata jsonb not null default '{}'::jsonb, occurred_at timestamptz not null default now(), created_at timestamptz not null default now()
);

create table if not exists public.segment_definitions (
  id uuid primary key default gen_random_uuid(), key text not null unique, name text not null, description text,
  category text not null, rule_version text not null, rule_definition jsonb not null,
  precedence_group text, priority integer not null default 100, active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.segment_eligibility (
  id uuid primary key default gen_random_uuid(), contact_id uuid not null references public.contacts(id),
  segment_definition_id uuid not null references public.segment_definitions(id), eligible boolean not null,
  evidence_summary jsonb not null default '[]'::jsonb, confidence text not null,
  exclusion_reason text, rule_version text not null, consent_preference_version integer,
  evaluated_at timestamptz not null default now(), evaluation_version integer not null,
  unique (contact_id, segment_definition_id)
);

create table if not exists public.provider_accounts (
  id uuid primary key default gen_random_uuid(), provider_key text not null unique, display_name text not null,
  status text not null default 'disabled' check (status in ('disabled','sandbox','active','error')),
  capabilities jsonb not null default '{}'::jsonb, secret_reference text, writes_enabled boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.provider_segment_mappings (
  id uuid primary key default gen_random_uuid(), provider_account_id uuid not null references public.provider_accounts(id),
  internal_segment_key text not null references public.segment_definitions(key), external_segment_id text,
  external_segment_name text, mapping_type text not null default 'tag', status text not null default 'unverified',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (provider_account_id, internal_segment_key)
);

insert into public.segment_definitions (key,name,category,rule_version,rule_definition,precedence_group,priority) values
('general_prospect','General Prospect','lifecycle','1', '{"rule":"general_prospect"}', 'general', 100),
('camp_lead','Camp Lead','audience','1', '{"rule":"camp_lead"}', 'camp', 100),
('school_lead','School Lead','audience','1', '{"rule":"school_lead"}', 'school', 100),
('family_prospect','Family Prospect','audience','1', '{"rule":"family_prospect"}', 'family', 100),
('book_customer','Book Customer','customer','1', '{"rule":"book_customer"}', 'book', 200),
('active_family_member','Active Family Member','customer','1', '{"rule":"active_family_member"}', 'family', 200),
('active_camp_partner','Active Camp Partner','customer','1', '{"rule":"active_camp_partner"}', 'camp', 200),
('active_school_partner','Active School Partner','customer','1', '{"rule":"active_school_partner"}', 'school', 200),
('newsletter_eligible','Newsletter Eligible','communication','1', '{"rule":"newsletter_eligible"}', 'newsletter', 200),
('product_updates_eligible','Product Updates Eligible','communication','1', '{"rule":"product_updates_eligible"}', 'product_updates', 200),
('marketing_consent_unclear','Marketing Consent Unclear','communication','1', '{"rule":"marketing_consent_unclear"}', 'restriction', 900),
('unsubscribed','Unsubscribed','communication','1', '{"rule":"unsubscribed"}', 'restriction', 950),
('suppressed','Suppressed','communication','1', '{"rule":"suppressed"}', 'restriction', 1000)
on conflict (key) do nothing;

alter table public.consent_events enable row level security;
alter table public.communication_preferences enable row level security;
alter table public.lifecycle_events enable row level security;
alter table public.contact_lifecycle_state enable row level security;
alter table public.contact_interests enable row level security;
alter table public.customer_relationships enable row level security;
alter table public.entitlements enable row level security;
alter table public.crm_notes enable row level security;
alter table public.crm_tasks enable row level security;
alter table public.crm_activities enable row level security;
alter table public.segment_definitions enable row level security;
alter table public.segment_eligibility enable row level security;
alter table public.provider_accounts enable row level security;
alter table public.provider_segment_mappings enable row level security;

comment on table public.consent_events is 'Append-only consent evidence. No client policies; restrictive states always win.';
comment on table public.lifecycle_events is 'Append-only lifecycle history; customer evidence remains separate.';
comment on table public.segment_eligibility is 'Local eligibility only; never proof of provider enrollment.';
comment on table public.provider_accounts is 'Provider metadata only in Phase 2. Secrets remain in server secret storage.';
