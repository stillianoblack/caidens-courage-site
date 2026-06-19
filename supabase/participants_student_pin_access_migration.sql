-- Student PIN access + optional parent connection for camp pilots.
-- Safe to run multiple times.

alter table public.participants add column if not exists last_name text;
alter table public.participants add column if not exists student_pin_hash text;
alter table public.participants add column if not exists student_pin_fingerprint text;
alter table public.participants add column if not exists student_pin_last_rotated_at timestamptz;
alter table public.participants add column if not exists student_pin_enabled boolean not null default true;
alter table public.participants add column if not exists parent_connection_status text not null default 'unclaimed';
alter table public.participants add column if not exists family_claim_code text;
alter table public.participants add column if not exists family_claim_code_created_at timestamptz;
alter table public.participants add column if not exists family_claim_code_used_at timestamptz;
alter table public.participants add column if not exists guardian_email text;
alter table public.participants add column if not exists guardian_phone text;
alter table public.participants add column if not exists family_account_id uuid;

alter table public.participants drop constraint if exists participants_parent_connection_status_check;
alter table public.participants add constraint participants_parent_connection_status_check
  check (parent_connection_status in ('unclaimed', 'invited', 'connected'));

create unique index if not exists participants_family_claim_code_unique
  on public.participants (family_claim_code)
  where family_claim_code is not null;

create unique index if not exists participants_program_pin_fingerprint_unique
  on public.participants (program_code, student_pin_fingerprint)
  where student_pin_fingerprint is not null and role = 'student';

create index if not exists participants_parent_connection_status_idx
  on public.participants (program_code, parent_connection_status)
  where role = 'student';

comment on column public.participants.student_pin_hash is 'PBKDF2 hash of student PIN; raw PIN shown once at creation/reset.';
comment on column public.participants.student_pin_fingerprint is 'Program-scoped SHA-256 fingerprint for PIN uniqueness lookup.';
comment on column public.participants.parent_connection_status is 'unclaimed | invited | connected';
comment on column public.participants.family_claim_code is 'Non-guessable code for parent to link later without duplicating student.';
