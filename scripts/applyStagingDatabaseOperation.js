const fs = require('fs');
const https = require('https');
const path = require('path');
const { assertStagingDatabaseSafety, resolveConfiguration } = require('./lib/stagingSafetyGate');

const ROOT = path.resolve(__dirname, '..');
const OPERATIONS = Object.freeze({
  baseline: {
    requireLegacyBaseline: false,
    files: [
      'supabase/schema/staging_safety_gate.sql',
      'supabase/schema/production_legacy_baseline.sql',
    ],
  },
  rls: {
    requireLegacyBaseline: true,
    files: ['supabase/schema/staging_legacy_rls.sql'],
  },
  seed: {
    requireLegacyBaseline: true,
    files: ['supabase/seeds/staging_fictional_seed.sql'],
  },
  'critical-signup': {
    requireLegacyBaseline: true,
    files: ['supabase/migrations/20260713000200_family_signup_identity_integrity.sql'],
  },
  ownership: {
    requireLegacyBaseline: true,
    files: ['supabase/migrations/20260714000100_auth_portal_ownership.sql'],
  },
  'ownership-rls': {
    requireLegacyBaseline: true,
    files: ['supabase/migrations/20260714000200_staging_portal_ownership_rls.sql'],
  },
  'ownership-helper-hardening': {
    requireLegacyBaseline: true,
    files: ['supabase/migrations/20260714000300_portal_participant_rls_helper_hardening.sql'],
  },
  'ownership-recursion-fix': {
    requireLegacyBaseline: true,
    files: ['supabase/migrations/20260714000400_portal_participant_rls_recursion_fix.sql'],
  },
  'postgrest-schema-reload': {
    requireLegacyBaseline: true,
    files: ['supabase/migrations/20260714000500_portal_postgrest_schema_reload.sql'],
  },
  'b4-variant-preference': {
    requireLegacyBaseline: true,
    files: ['supabase/migrations/20260715000100_b4_variant_preference.sql'],
  },
  'independent-family-child': {
    requireLegacyBaseline: true,
    files: ['supabase/migrations/20260715000200_independent_family_child_creation.sql'],
  },
  'b4-selection-onboarding': {
    requireLegacyBaseline: true,
    files: ['supabase/migrations/20260715000300_b4_selection_onboarding.sql'],
  },
  cleanup: {
    requireLegacyBaseline: true,
    files: ['supabase/seeds/staging_fictional_cleanup.sql'],
  },
});

function sqlLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function executeSql(projectRef, accessToken, sql) {
  const payload = JSON.stringify({ query: sql });
  return new Promise((resolve, reject) => {
    const request = https.request(
      {
        hostname: 'api.supabase.com',
        path: `/v1/projects/${projectRef}/database/query`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (response) => {
        let body = '';
        response.on('data', (chunk) => {
          body += chunk;
        });
        response.on('end', () => {
          if (response.statusCode === 200 || response.statusCode === 201) {
            resolve();
            return;
          }
          let message = `Staging SQL request failed with HTTP ${response.statusCode}.`;
          try {
            const parsed = JSON.parse(body);
            const detail = parsed.message || parsed.error || parsed.msg;
            if (detail) message += ` ${String(detail).slice(0, 1000)}`;
          } catch {
            // Response content is deliberately suppressed when it is not structured JSON.
          }
          reject(new Error(message.replace(/eyJ[A-Za-z0-9._-]+/g, '[redacted-token]')));
        });
      },
    );
    request.on('error', reject);
    request.write(payload);
    request.end();
  });
}

async function main() {
  const operationName = process.argv[2];
  const operation = OPERATIONS[operationName];
  if (!operation) throw new Error(`Operation must be one of: ${Object.keys(OPERATIONS).join(', ')}.`);

  await assertStagingDatabaseSafety({ requireLegacyBaseline: operation.requireLegacyBaseline });
  const config = resolveConfiguration();
  const fileEnv = Object.fromEntries(
    fs
      .readFileSync(path.join(ROOT, '.env.local'), 'utf8')
      .split(/\r?\n/)
      .filter((line) => line && !line.trim().startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=');
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
      }),
  );
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN || fileEnv.SUPABASE_ACCESS_TOKEN;
  if (!accessToken) throw new Error('SUPABASE_ACCESS_TOKEN is required.');

  const sessionSettings = [
    `SET LOCAL app.environment = ${sqlLiteral(config.environmentName)}`,
    `SET LOCAL app.allow_staging_database_mutations = ${sqlLiteral(config.allowMutations)}`,
    `SET LOCAL app.project_ref = ${sqlLiteral(config.detectedProjectRef)}`,
    `SET LOCAL app.expected_staging_project_ref = ${sqlLiteral(config.expectedStagingProjectRef)}`,
    `SET LOCAL app.production_project_ref = ${sqlLiteral(config.productionProjectRef)}`,
  ];
  const source = operation.files
    .map((file) => `\n-- BEGIN ${file}\n${fs.readFileSync(path.join(ROOT, file), 'utf8')}\n-- END ${file}`)
    .join('\n');
  const sql = `BEGIN;\n${sessionSettings.join(';\n')};\nSELECT private.assert_staging_safety(true);${source}\nCOMMIT;`;

  // The baseline operation installs the function it later invokes, so remove the leading invocation.
  const executableSql = operationName === 'baseline'
    ? sql.replace('SELECT private.assert_staging_safety(true);', '')
    : sql;
  await executeSql(config.detectedProjectRef, accessToken, executableSql);
  console.log(`Staging database operation completed atomically: ${operationName}. No secrets were printed.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
