-- Additive participant-owned cosmetic B-4 preference. No progress or identity fields are changed.
alter table public.participants
  add column if not exists b4_variant_key text not null default 'courage';

alter table public.participants
  drop constraint if exists participants_b4_variant_key_check;

alter table public.participants
  add constraint participants_b4_variant_key_check
  check (b4_variant_key in ('spark', 'courage', 'pattern', 'shield', 'anchor', 'fusion'));

comment on column public.participants.b4_variant_key is
  'Cosmetic B-4 identity variant. Legacy spark is accepted transiently and normalized by the selection-onboarding migration.';

notify pgrst, 'reload schema';
