const fs = require('fs');
const https = require('https');
const path = require('path');
const { assertStagingReadOnlyTarget } = require('./lib/stagingSafetyGate');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'docs', 'audits', 'staging-state-inventory.json');

function readLocalEnv() {
  return Object.fromEntries(
    fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8')
      .split(/\r?\n/)
      .filter((line) => line && !line.trim().startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=');
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
      }),
  );
}

function query(projectRef, accessToken, sql) {
  const payload = JSON.stringify({ query: sql });
  return new Promise((resolve, reject) => {
    const request = https.request({
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectRef}/database/query`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (response) => {
      let body = '';
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => {
        if (response.statusCode !== 200 && response.statusCode !== 201) {
          reject(new Error(`Staging inventory query failed with HTTP ${response.statusCode}.`));
          return;
        }
        resolve(JSON.parse(body));
      });
    });
    request.on('error', reject);
    request.write(payload);
    request.end();
  });
}

async function main() {
  const config = assertStagingReadOnlyTarget();
  const env = readLocalEnv();
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN || env.SUPABASE_ACCESS_TOKEN;
  if (!accessToken) throw new Error('SUPABASE_ACCESS_TOKEN is required.');

  const queries = {
    migration_history: `
      select version, name
      from supabase_migrations.schema_migrations
      order by version
    `,
    migration_version_duplicates: `
      select version, count(*)::int as occurrences
      from supabase_migrations.schema_migrations
      group by version having count(*) > 1
      order by version
    `,
    public_tables: `
      select c.relname as table_name, c.relrowsecurity as rls_enabled
      from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind in ('r', 'p')
      order by c.relname
    `,
    public_functions: `
      select p.proname as function_name,
        pg_get_function_identity_arguments(p.oid) as arguments,
        p.prosecdef as security_definer,
        has_function_privilege('anon', p.oid, 'execute') as anon_execute,
        has_function_privilege('authenticated', p.oid, 'execute') as authenticated_execute,
        has_function_privilege('service_role', p.oid, 'execute') as service_role_execute
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
      order by p.proname, arguments
    `,
    signup_integrity: `
      select
        exists(select 1 from information_schema.columns where table_schema='public'
          and table_name='pilot_programs' and column_name='signup_idempotency_key') as idempotency_column,
        to_regclass('public.pilot_programs_signup_idempotency_key_unique') is not null as idempotency_index,
        to_regclass('public.pilot_programs_independent_family_admin_unique') is not null as family_email_index,
        to_regprocedure('public.create_independent_family_signup(jsonb,text,text)') is not null as signup_rpc
    `,
    policy_summary: `
      select tablename as table_name, count(*)::int as policy_count,
        count(*) filter (where 'anon' = any(roles))::int as anon_policy_count,
        count(*) filter (where 'authenticated' = any(roles))::int as authenticated_policy_count
      from pg_policies where schemaname='public'
      group by tablename order by tablename
    `,
    fixture_summary: `
      select
        (select count(*)::int from public.pilot_programs
          where admin_email like '%@fictional.example') as fictional_programs,
        (select count(*)::int from public.participants
          where guardian_email like '%@fictional.example' or nickname like '% Test') as identifiable_fictional_participants,
        (select count(*)::int from auth.users where email like '%@fictional.example') as fictional_auth_users,
        (select count(*)::int from public.contacts where primary_email like '%@fictional.example') as fictional_crm_contacts,
        (select count(*)::int from public.pilot_programs
          where signup_idempotency_key is not null) as idempotent_signup_rows
    `,
    learning_objects: `
      select name, object_type from (
        select table_name as name, 'table'::text as object_type
        from information_schema.tables
        where table_schema='public' and table_name in (
          'learning_question_sets','learning_questions','achievement_events',
          'achievement_awards','learning_communication_deliveries'
        )
        union all
        select column_name as name, 'program_goals_column'::text
        from information_schema.columns
        where table_schema='public' and table_name='program_goals'
          and column_name='dashboard_onboarding_dismissed_at'
      ) objects order by object_type, name
    `,
    ownership_helper_access: `
      select
        has_schema_privilege('authenticated', 'private', 'usage') as authenticated_private_schema_usage,
        has_table_privilege('authenticated', 'public.participants', 'select') as participants_select,
        has_table_privilege('authenticated', 'public.pilot_programs', 'select') as programs_select,
        has_function_privilege('authenticated', 'private.portal_can_access_program_id(uuid)', 'execute') as program_helper_execute,
        has_function_privilege('authenticated', 'private.portal_can_access_participant(uuid)', 'execute') as participant_helper_execute,
        has_function_privilege('authenticated', 'private.portal_can_access_participant_text(text)', 'execute') as participant_text_helper_execute
    `,
    ownership_policy_details: `
      select tablename, policyname, permissive, roles, cmd, qual
      from pg_policies
      where schemaname='public' and tablename in ('participants','pilot_programs')
      order by tablename, policyname
    `,
    ownership_helper_details: `
      select n.nspname as schema_name, p.proname as function_name,
        pg_get_userbyid(p.proowner) as owner, p.prosecdef as security_definer,
        pg_get_functiondef(p.oid) as definition
      from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='private' and p.proname in (
        'is_internal_admin','portal_can_access_program_id','portal_can_access_participant'
      ) order by p.proname
    `,
    ownership_table_details: `
      select c.relname as table_name, pg_get_userbyid(c.relowner) as owner,
        c.relrowsecurity as rls_enabled, c.relforcerowsecurity as force_rls
      from pg_class c join pg_namespace n on n.oid=c.relnamespace
      where n.nspname='public' and c.relname in (
        'participants','pilot_programs','student_family_links','portal_program_memberships','portal_participant_access'
      ) order by c.relname
    `,
    authenticated_zero_uid_participant_probe: `
      set local role authenticated;
      select count(*)::int as visible_rows,
        private.portal_can_access_participant('00000000-0000-4000-8000-000000000103'::uuid) as helper_result
      from public.participants
    `,
    postgrest_hooks: `
      select current_setting('pgrst.db_pre_request', true) as db_pre_request,
        current_setting('pgrst.db_schemas', true) as exposed_schemas,
        current_setting('pgrst.db_extra_search_path', true) as extra_search_path
    `,
    participant_acl_details: `
      select c.relacl::text as table_acl,
        (select jsonb_object_agg(a.attname, a.attacl::text)
         from pg_attribute a where a.attrelid=c.oid and a.attnum > 0 and a.attacl is not null) as column_acls,
        has_function_privilege('authenticated', 'private.portal_can_access_participant(uuid,text)', 'execute') as two_arg_helper_execute
      from pg_class c join pg_namespace n on n.oid=c.relnamespace
      where n.nspname='public' and c.relname='participants'
    `,
  };

  const inventory = {
    generated_at: new Date().toISOString(),
    scope: 'staging migration ledger, schema metadata, and aggregate fictional fixture markers',
    project_ref_masked: `${config.detectedProjectRef.slice(0, 4)}***${config.detectedProjectRef.slice(-3)}`,
    mutation_gate_enabled: config.allowMutations === 'true',
  };
  for (const [key, sql] of Object.entries(queries)) {
    inventory[key] = await query(config.detectedProjectRef, accessToken, sql);
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, `${JSON.stringify(inventory, null, 2)}\n`, { mode: 0o600 });
  console.log('Staging state inventory written. No SQL was applied and no secrets were printed.');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
