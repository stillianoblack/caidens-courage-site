-- Review-only rollback for the critical independent-family signup migration.
-- This removes only migration-owned function/index/column objects; it does not delete family or participant rows.

SELECT private.assert_staging_safety(true);

BEGIN;

REVOKE ALL ON FUNCTION public.create_independent_family_signup(jsonb, text, text)
  FROM PUBLIC, anon, authenticated, service_role;
DROP FUNCTION IF EXISTS public.create_independent_family_signup(jsonb, text, text);

DROP INDEX IF EXISTS public.pilot_programs_independent_family_admin_unique;
DROP INDEX IF EXISTS public.pilot_programs_signup_idempotency_key_unique;

ALTER TABLE public.pilot_programs
  DROP COLUMN IF EXISTS signup_idempotency_key;

COMMIT;
