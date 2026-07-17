-- Distinguish an explicitly chosen B-4 from a legacy/default value.
-- A non-null b4_variant_selected_at is written only by the authenticated selection endpoint.
-- This migration does not infer confirmation from an existing/default variant.
alter table public.participants
  add column if not exists b4_variant_selected_at timestamptz;

-- Operator precheck (read-only): count the only rows eligible for normalization.
-- select count(*) as legacy_spark_rows
-- from public.participants
-- where b4_variant_key = 'spark';
do $$
declare
  legacy_spark_rows bigint;
begin
  select count(*) into legacy_spark_rows
  from public.participants
  where b4_variant_key = 'spark';

  raise notice 'B-4 onboarding precheck: % legacy spark row(s) require normalization.', legacy_spark_rows;
end
$$;

-- Temporarily remove the allowlist constraint only so an older schema that allowed
-- the exact legacy value can be normalized before the canonical allowlist is restored.
alter table public.participants
  drop constraint if exists participants_b4_variant_key_check;

update public.participants
set b4_variant_key = 'courage'
where b4_variant_key = 'spark';

alter table public.participants
  add constraint participants_b4_variant_key_check
  check (b4_variant_key in ('courage', 'pattern', 'shield', 'anchor', 'fusion'));

-- Operator postcheck (read-only): both counts must be zero.
-- select
--   count(*) filter (where b4_variant_key = 'spark') as remaining_legacy_spark_rows,
--   count(*) filter (
--     where b4_variant_key not in ('courage', 'pattern', 'shield', 'anchor', 'fusion')
--   ) as invalid_variant_rows
-- from public.participants;
do $$
declare
  remaining_legacy_spark_rows bigint;
  invalid_variant_rows bigint;
begin
  select
    count(*) filter (where b4_variant_key = 'spark'),
    count(*) filter (
      where b4_variant_key not in ('courage', 'pattern', 'shield', 'anchor', 'fusion')
    )
  into remaining_legacy_spark_rows, invalid_variant_rows
  from public.participants;

  if remaining_legacy_spark_rows <> 0 or invalid_variant_rows <> 0 then
    raise exception
      'B-4 onboarding postcheck failed: % spark row(s), % invalid row(s).',
      remaining_legacy_spark_rows,
      invalid_variant_rows;
  end if;

  raise notice 'B-4 onboarding postcheck: 0 legacy spark rows and 0 invalid rows.';
end
$$;

comment on column public.participants.b4_variant_selected_at is
  'Timestamp of an explicit B-4 choice. Null means first-time selection is still required.';

-- Forward-correction strategy:
-- - Preserve this additive column on application rollback.
-- - If a reviewed row was normalized incorrectly, restore only that audited row's
--   variant through an approved forward correction; never run a broad timestamp backfill.
-- - The legacy spark-to-courage normalization is intentionally not reversed because
--   new writes and the canonical constraint no longer permit spark.

notify pgrst, 'reload schema';
