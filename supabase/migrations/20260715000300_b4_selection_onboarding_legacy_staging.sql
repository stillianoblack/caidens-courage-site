-- Historical staging-only migration retained so migration history describes what ran.
-- PROHIBITED FROM PRODUCTION: this legacy operation performs an unbounded timestamp backfill.
-- Production must use 20260715000400_b4_selection_onboarding.sql instead.

alter table public.participants
  add column if not exists b4_variant_selected_at timestamptz;

update public.participants
set b4_variant_selected_at = coalesce(updated_at, created_at, now())
where b4_variant_selected_at is null;

comment on column public.participants.b4_variant_selected_at is
  'Timestamp of an explicit B-4 choice. Null means first-time selection is still required.';

notify pgrst, 'reload schema';
