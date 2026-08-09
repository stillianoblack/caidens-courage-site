const fs = require('fs');
const https = require('https');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(filePath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=');
        const key = line.slice(0, separator).trim();
        const value = line.slice(separator + 1).trim().replace(/^(['"])(.*)\1$/, '$2');
        return [key, value];
      }),
  );
}

function requestMetadata(projectRef, accessToken, query) {
  const payload = JSON.stringify({ query });
  const options = {
    hostname: 'api.supabase.com',
    path: `/v1/projects/${projectRef}/database/query`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  return new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      let body = '';
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('end', () => {
        if (response.statusCode !== 200 && response.statusCode !== 201) {
          reject(new Error(`Supabase metadata request failed with HTTP ${response.statusCode}.`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch {
          reject(new Error('Supabase metadata response was not valid JSON.'));
        }
      });
    });
    request.on('error', reject);
    request.write(payload);
    request.end();
  });
}

const METADATA_QUERIES = {
  tables: `
    select
      n.nspname as schema_name,
      c.relname as table_name,
      c.relkind as relation_kind,
      c.relrowsecurity as rls_enabled,
      c.relforcerowsecurity as rls_forced
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname in ('public', 'storage')
      and c.relkind in ('r', 'p', 'v', 'm')
    order by n.nspname, c.relname
  `,
  columns: `
    select
      n.nspname as schema_name,
      c.relname as table_name,
      a.attnum as ordinal_position,
      a.attname as column_name,
      pg_catalog.format_type(a.atttypid, a.atttypmod) as formatted_type,
      a.attnotnull as not_null,
      pg_catalog.pg_get_expr(d.adbin, d.adrelid) as column_default,
      a.attidentity as identity_kind,
      a.attgenerated as generated_kind,
      coll.collname as collation_name
    from pg_catalog.pg_attribute a
    join pg_catalog.pg_class c on c.oid = a.attrelid
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    left join pg_catalog.pg_attrdef d on d.adrelid = a.attrelid and d.adnum = a.attnum
    left join pg_catalog.pg_collation coll on coll.oid = a.attcollation and a.attcollation <> 0
    where n.nspname in ('public', 'storage')
      and c.relkind in ('r', 'p', 'v', 'm')
      and a.attnum > 0
      and not a.attisdropped
    order by n.nspname, c.relname, a.attnum
  `,
  constraints: `
    select
      n.nspname as schema_name,
      c.relname as table_name,
      con.conname as constraint_name,
      con.contype as constraint_type,
      pg_catalog.pg_get_constraintdef(con.oid, true) as definition
    from pg_catalog.pg_constraint con
    join pg_catalog.pg_class c on c.oid = con.conrelid
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname in ('public', 'storage')
    order by n.nspname, c.relname, con.conname
  `,
  indexes: `
    select schemaname as schema_name, tablename as table_name, indexname as index_name, indexdef as definition
    from pg_catalog.pg_indexes
    where schemaname in ('public', 'storage')
    order by schemaname, tablename, indexname
  `,
  enums: `
    select
      n.nspname as schema_name,
      t.typname as enum_name,
      e.enumsortorder,
      e.enumlabel
    from pg_catalog.pg_type t
    join pg_catalog.pg_enum e on e.enumtypid = t.oid
    join pg_catalog.pg_namespace n on n.oid = t.typnamespace
    where n.nspname in ('public', 'storage')
    order by n.nspname, t.typname, e.enumsortorder
  `,
  views: `
    select
      n.nspname as schema_name,
      c.relname as view_name,
      c.relkind as relation_kind,
      pg_catalog.pg_get_viewdef(c.oid, true) as definition
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname in ('public', 'storage') and c.relkind in ('v', 'm')
    order by n.nspname, c.relname
  `,
  functions: `
    select
      n.nspname as schema_name,
      p.proname as function_name,
      pg_catalog.pg_get_function_identity_arguments(p.oid) as identity_arguments,
      pg_catalog.pg_get_function_result(p.oid) as result_type,
      l.lanname as language,
      p.prosecdef as security_definer,
      p.provolatile as volatility,
      p.proconfig as configuration,
      p.proacl as acl,
      pg_catalog.pg_get_functiondef(p.oid) as definition,
      has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
      has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_execute,
      has_function_privilege('service_role', p.oid, 'EXECUTE') as service_role_execute
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    join pg_catalog.pg_language l on l.oid = p.prolang
    where n.nspname = 'public'
    order by n.nspname, p.proname, identity_arguments
  `,
  triggers: `
    select
      n.nspname as schema_name,
      c.relname as table_name,
      t.tgname as trigger_name,
      pg_catalog.pg_get_triggerdef(t.oid, true) as definition
    from pg_catalog.pg_trigger t
    join pg_catalog.pg_class c on c.oid = t.tgrelid
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where not t.tgisinternal and n.nspname in ('public', 'storage')
    order by n.nspname, c.relname, t.tgname
  `,
  policies: `
    select
      schemaname as schema_name,
      tablename as table_name,
      policyname as policy_name,
      permissive,
      roles,
      cmd,
      qual,
      with_check
    from pg_catalog.pg_policies
    where schemaname in ('public', 'storage')
    order by schemaname, tablename, policyname
  `,
  privileges: `
    select
      n.nspname as schema_name,
      c.relname as table_name,
      role_name,
      has_table_privilege(role_name, c.oid, 'SELECT') as can_select,
      has_table_privilege(role_name, c.oid, 'INSERT') as can_insert,
      has_table_privilege(role_name, c.oid, 'UPDATE') as can_update,
      has_table_privilege(role_name, c.oid, 'DELETE') as can_delete
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    cross join (values ('anon'), ('authenticated'), ('service_role')) as roles(role_name)
    where n.nspname in ('public', 'storage') and c.relkind in ('r', 'p', 'v', 'm')
    order by n.nspname, c.relname, role_name
  `,
  extensions: `
    select extname as extension_name, extversion as version, n.nspname as schema_name
    from pg_catalog.pg_extension e
    join pg_catalog.pg_namespace n on n.oid = e.extnamespace
    order by extname
  `,
  buckets: `
    select id, name, public, file_size_limit, allowed_mime_types
    from storage.buckets
    order by id
  `,
};

async function main() {
  const fileEnv = readEnvFile(path.join(ROOT, '.env.local'));
  const projectRef = process.env.SCHEMA_INVENTORY_PROJECT_REF || fileEnv.SCHEMA_INVENTORY_PROJECT_REF;
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN || fileEnv.SUPABASE_ACCESS_TOKEN;
  const outputPath = process.env.SCHEMA_INVENTORY_OUTPUT || path.join(ROOT, 'docs', 'audits', 'production-schema-inventory.json');

  if (!projectRef) throw new Error('SCHEMA_INVENTORY_PROJECT_REF is required.');
  if (!/^[a-z0-9]{20}$/.test(projectRef)) throw new Error('SCHEMA_INVENTORY_PROJECT_REF is invalid.');
  if (!accessToken) throw new Error('SUPABASE_ACCESS_TOKEN is required.');

  const inventory = {
    generated_at: new Date().toISOString(),
    scope: 'schema metadata only; no application rows',
    project_ref_masked: `${projectRef.slice(0, 4)}***${projectRef.slice(-3)}`,
  };

  for (const [name, query] of Object.entries(METADATA_QUERIES)) {
    inventory[name] = await requestMetadata(projectRef, accessToken, query);
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(inventory, null, 2)}\n`, { mode: 0o600 });
  console.log(`Schema-only inventory written (${Object.keys(METADATA_QUERIES).length} metadata sections).`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
