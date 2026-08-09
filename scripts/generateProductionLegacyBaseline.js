const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INVENTORY_PATH = path.join(ROOT, 'docs', 'audits', 'production-schema-inventory.json');
const OUTPUT_PATH = path.join(ROOT, 'supabase', 'schema', 'production_legacy_baseline.sql');

function quoteIdentifier(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function qualified(schemaName, objectName) {
  return `${quoteIdentifier(schemaName)}.${quoteIdentifier(objectName)}`;
}

function add(lines, ...values) {
  lines.push(...values, '');
}

function renderColumn(column) {
  const parts = [quoteIdentifier(column.column_name), column.formatted_type];
  if (column.collation_name && column.collation_name !== 'default') {
    parts.push(`COLLATE ${quoteIdentifier(column.collation_name)}`);
  }
  if (column.generated_kind) {
    parts.push(`GENERATED ALWAYS AS (${column.column_default}) STORED`);
  } else if (column.identity_kind) {
    parts.push(`GENERATED ${column.identity_kind === 'a' ? 'ALWAYS' : 'BY DEFAULT'} AS IDENTITY`);
  } else if (column.column_default !== null) {
    parts.push(`DEFAULT ${column.column_default}`);
  }
  if (column.not_null) parts.push('NOT NULL');
  return parts.join(' ');
}

function main() {
  const inventory = JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf8'));
  const lines = [];
  const publicTables = inventory.tables.filter(
    (table) => table.schema_name === 'public' && ['r', 'p'].includes(table.relation_kind),
  );
  const publicTableNames = new Set(publicTables.map((table) => table.table_name));
  const constraintIndexNames = new Set(
    inventory.constraints
      .filter((constraint) => constraint.schema_name === 'public')
      .map((constraint) => constraint.constraint_name),
  );

  add(
    lines,
    '-- Caiden\'s Courage production-compatible legacy schema baseline.',
    `-- Generated from production catalog metadata at ${inventory.generated_at}.`,
    '-- This file contains schema metadata only. It contains no production application rows, Auth users,',
    '-- credentials, contact records, assessments, progress records, or storage objects.',
    '-- Apply only to a newly provisioned, empty staging project after the staging safety gate passes.',
    '-- Do not apply to production. Do not combine this file with feature migrations.',
  );

  add(lines, "SELECT private.assert_staging_safety(false);");

  add(
    lines,
    '-- Extensions used directly by this application schema.',
    'CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;',
    'CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;',
    'SET search_path = public, extensions;',
    '-- Supabase manages plpgsql, pg_stat_statements, supabase_vault, and the storage schema.',
  );

  for (const table of publicTables) {
    const columns = inventory.columns.filter(
      (column) => column.schema_name === 'public' && column.table_name === table.table_name,
    );
    const definitions = columns.map((column) => `  ${renderColumn(column)}`);
    add(lines, `CREATE TABLE ${qualified('public', table.table_name)} (`, `${definitions.join(',\n')}`, ');');
  }

  add(lines, '-- Primary keys, unique/check constraints, and foreign keys.');
  const constraintOrder = { p: 1, u: 2, c: 3, x: 4, f: 5 };
  const publicConstraints = inventory.constraints
    .filter((constraint) => constraint.schema_name === 'public' && publicTableNames.has(constraint.table_name))
    .sort((left, right) => {
      const typeOrder = (constraintOrder[left.constraint_type] || 9) - (constraintOrder[right.constraint_type] || 9);
      return typeOrder || left.table_name.localeCompare(right.table_name) || left.constraint_name.localeCompare(right.constraint_name);
    });
  for (const constraint of publicConstraints) {
    add(
      lines,
      `ALTER TABLE ${qualified('public', constraint.table_name)}`,
      `  ADD CONSTRAINT ${quoteIdentifier(constraint.constraint_name)} ${constraint.definition};`,
    );
  }

  add(lines, '-- Non-constraint indexes.');
  for (const index of inventory.indexes.filter(
    (entry) => entry.schema_name === 'public' && !constraintIndexNames.has(entry.index_name),
  )) {
    add(lines, `${index.definition};`);
  }

  add(lines, '-- Public functions and RPCs captured from production metadata.');
  for (const fn of inventory.functions.filter((entry) => entry.schema_name === 'public')) {
    add(lines, `${fn.definition.trim()};`);
  }

  add(lines, '-- Application-owned triggers. Supabase-managed storage triggers are intentionally excluded.');
  for (const trigger of inventory.triggers.filter((entry) => entry.schema_name === 'public')) {
    add(lines, `${trigger.definition};`);
  }

  add(lines, '-- Row-level security state.');
  for (const table of publicTables.filter((entry) => entry.rls_enabled)) {
    add(lines, `ALTER TABLE ${qualified('public', table.table_name)} ENABLE ROW LEVEL SECURITY;`);
    if (table.rls_forced) add(lines, `ALTER TABLE ${qualified('public', table.table_name)} FORCE ROW LEVEL SECURITY;`);
  }

  add(
    lines,
    '-- Production policies and broad anon/authenticated grants are intentionally excluded.',
    '-- Apply supabase/schema/staging_legacy_rls.sql after this schema baseline.',
    '-- Service-role access is explicit so server-only staging flows can be verified safely.',
  );
  for (const table of publicTables) {
    add(
      lines,
      `GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE ${qualified('public', table.table_name)}`,
      '  TO "service_role";',
    );
  }

  add(lines, '-- Function execution is service-role-only in staging.');
  for (const fn of inventory.functions.filter((entry) => entry.schema_name === 'public')) {
    add(
      lines,
      `GRANT EXECUTE ON FUNCTION ${qualified('public', fn.function_name)}(${fn.identity_arguments})`,
      '  TO "service_role";',
    );
  }

  add(
    lines,
    '-- Storage bucket configuration is intentionally not inserted by this schema-only baseline.',
    '-- Recreate the production bucket names/configuration using the staging provisioning guide, without files.',
  );

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${lines.join('\n')}\n`);
  console.log(`Production legacy baseline generated (${publicTables.length} public tables).`);
}

main();
