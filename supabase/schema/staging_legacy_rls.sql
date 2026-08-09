-- Staging-only RLS policy set for the production-compatible legacy schema.
-- Deliberate difference from production: sensitive legacy data is never readable by anon.
-- Family/student/facilitator browser sessions remain denied until they use verifiable Auth identities.

SELECT private.assert_staging_safety(true);

CREATE OR REPLACE FUNCTION private.is_internal_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.crm_admin_role_assignments assignment
    JOIN public.crm_admin_roles role ON role.id = assignment.role_id
    WHERE assignment.auth_user_id = auth.uid()
      AND assignment.status = 'active'
      AND role.key = 'internal_admin'
  );
$$;

REVOKE ALL ON FUNCTION private.is_internal_admin() FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_internal_admin() TO authenticated;

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'adventure_months', 'adventures', 'assessment_results', 'assessment_results_v2',
    'camp_achievement_screenshots', 'commerce_products', 'family_child_goals',
    'integration_logs', 'kid_play_sessions', 'module_results', 'participant_ui_state',
    'participants', 'pilot_programs', 'pilot_waitlist', 'player_badges',
    'player_progress', 'player_reward_claims', 'player_wallets', 'program_goals',
    'push_subscriptions', 'question_attempts', 'student_family_links', 'student_gallery_items'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', table_name);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO authenticated', table_name);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO service_role', table_name);
    IF NOT EXISTS (
      SELECT 1 FROM pg_catalog.pg_policies
      WHERE schemaname = 'public'
        AND tablename = table_name
        AND policyname = table_name || '_internal_admin_all'
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (private.is_internal_admin()) WITH CHECK (private.is_internal_admin())',
        table_name || '_internal_admin_all',
        table_name
      );
    END IF;
  END LOOP;
END;
$$;

-- Non-sensitive published catalog data remains readable by browser clients.
GRANT SELECT ON TABLE public.adventure_months, public.adventures, public.commerce_products
  TO anon, authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'adventure_months' AND policyname = 'adventure_months_published_read'
  ) THEN
    CREATE POLICY adventure_months_published_read
      ON public.adventure_months FOR SELECT TO anon, authenticated
      USING (is_published = true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'adventures' AND policyname = 'adventures_published_read'
  ) THEN
    CREATE POLICY adventures_published_read
      ON public.adventures FOR SELECT TO anon, authenticated
      USING (status = 'active' OR is_live = true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'commerce_products' AND policyname = 'commerce_products_active_read'
  ) THEN
    CREATE POLICY commerce_products_active_read
      ON public.commerce_products FOR SELECT TO anon, authenticated
      USING (is_active = true);
  END IF;
END;
$$;

-- RPCs that mutate legacy identity remain server-only.
REVOKE ALL ON FUNCTION public.rename_pilot_program_transaction(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rename_pilot_program_transaction(text, text) TO service_role;

-- Storage uploads are server/admin-only in staging. Buckets should remain private.
REVOKE INSERT, UPDATE, DELETE ON TABLE storage.objects FROM anon, authenticated;
