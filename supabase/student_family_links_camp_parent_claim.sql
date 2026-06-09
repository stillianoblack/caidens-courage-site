-- Camp → parent claim workflow: parent contact on links, claim status, nullable family program until parent connects.
-- Safe to run multiple times.

alter table public.student_family_links
  add column if not exists parent_first_name text,
  add column if not exists parent_phone text,
  add column if not exists parent_claimed boolean not null default false,
  add column if not exists claimed_at timestamptz;

alter table public.student_family_links
  alter column family_program_code drop not null;

create index if not exists student_family_links_parent_email_idx
  on public.student_family_links (lower(parent_email));

create index if not exists student_family_links_parent_phone_idx
  on public.student_family_links (parent_phone);

create unique index if not exists student_family_links_student_camp_unique
  on public.student_family_links (student_id, camp_program_code);

comment on column public.student_family_links.parent_first_name is
  'Parent first name collected at camp onboarding.';

comment on column public.student_family_links.parent_phone is
  'Optional parent phone for claim lookup when email is unavailable.';

comment on column public.student_family_links.parent_claimed is
  'True after parent successfully accesses Family Portal with matching contact info.';

comment on column public.student_family_links.claimed_at is
  'Timestamp when parent_claimed was set to true.';

comment on column public.student_family_links.family_program_code is
  'Private family program code. Nullable until parent claims via Family Portal.';
