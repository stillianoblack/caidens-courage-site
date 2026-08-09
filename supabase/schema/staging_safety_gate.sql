-- Staging-only database safety gate.
-- Before running this file, the SQL session must explicitly set:
--   app.environment, app.allow_staging_database_mutations, app.project_ref,
--   app.expected_staging_project_ref, and app.production_project_ref.
-- The Node safety gate additionally verifies the actual URL and linked CLI project.

DO $$
BEGIN
  IF current_setting('app.environment', true) IS DISTINCT FROM 'staging' THEN
    RAISE EXCEPTION 'Refusing database change: app.environment must be staging.';
  END IF;
  IF current_setting('app.allow_staging_database_mutations', true) IS DISTINCT FROM 'true' THEN
    RAISE EXCEPTION 'Refusing database change: explicit staging mutation approval is missing.';
  END IF;
  IF nullif(current_setting('app.project_ref', true), '') IS NULL
     OR nullif(current_setting('app.expected_staging_project_ref', true), '') IS NULL
     OR nullif(current_setting('app.production_project_ref', true), '') IS NULL THEN
    RAISE EXCEPTION 'Refusing database change: project-reference settings are incomplete.';
  END IF;
  IF current_setting('app.project_ref', true) IS DISTINCT FROM current_setting('app.expected_staging_project_ref', true) THEN
    RAISE EXCEPTION 'Refusing database change: project reference does not match expected staging.';
  END IF;
  IF current_setting('app.project_ref', true) = current_setting('app.production_project_ref', true) THEN
    RAISE EXCEPTION 'Refusing database change: target matches production.';
  END IF;
END;
$$;

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.assert_staging_safety(require_legacy_baseline boolean DEFAULT true)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  missing_object text;
BEGIN
  IF current_setting('app.environment', true) IS DISTINCT FROM 'staging'
     OR current_setting('app.allow_staging_database_mutations', true) IS DISTINCT FROM 'true' THEN
    RAISE EXCEPTION 'Staging safety gate failed: environment or mutation approval is invalid.';
  END IF;
  IF nullif(current_setting('app.project_ref', true), '') IS NULL
     OR nullif(current_setting('app.expected_staging_project_ref', true), '') IS NULL
     OR nullif(current_setting('app.production_project_ref', true), '') IS NULL
     OR current_setting('app.project_ref', true) IS DISTINCT FROM current_setting('app.expected_staging_project_ref', true)
     OR current_setting('app.project_ref', true) = current_setting('app.production_project_ref', true) THEN
    RAISE EXCEPTION 'Staging safety gate failed: project-reference validation failed.';
  END IF;

  IF require_legacy_baseline THEN
    SELECT required.object_name
      INTO missing_object
    FROM (VALUES
      ('public.pilot_programs'),
      ('public.participants'),
      ('public.student_family_links'),
      ('public.assessment_results'),
      ('public.assessment_results_v2'),
      ('public.module_results'),
      ('public.player_progress'),
      ('public.player_wallets'),
      ('public.player_badges'),
      ('public.program_goals')
    ) AS required(object_name)
    WHERE to_regclass(required.object_name) IS NULL
    LIMIT 1;

    IF missing_object IS NOT NULL THEN
      RAISE EXCEPTION 'Staging safety gate failed: required baseline object % is missing.', missing_object;
    END IF;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION private.assert_staging_safety(boolean) FROM PUBLIC, anon, authenticated;
