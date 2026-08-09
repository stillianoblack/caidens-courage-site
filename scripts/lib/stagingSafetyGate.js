const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

const REQUIRED_LEGACY_SCHEMA = Object.freeze({
  pilot_programs: ['id', 'program_code', 'program_type', 'family_access_code', 'facilitator_access_code'],
  participants: ['id', 'role', 'program_code', 'guardian_email', 'family_account_id'],
  student_family_links: ['id', 'student_id', 'camp_program_code', 'family_program_code'],
  assessment_results: ['id', 'student_id', 'assessment_type', 'program_code'],
  assessment_results_v2: ['id', 'participant_id', 'assessment_type', 'program_code'],
  module_results: ['id', 'participant_id', 'module_id', 'program_code'],
  player_progress: ['id', 'participant_id', 'week_id', 'mission_id'],
  player_wallets: ['participant_id', 'total_coins'],
  player_badges: ['id', 'participant_id', 'badge_name'],
  program_goals: ['id', 'program_code', 'selected_goals'],
});

const REQUIRED_CRM_SCHEMA = Object.freeze({
  contacts: ['id', 'email', 'audience_type', 'do_not_enroll'],
  organizations: ['id', 'name'],
  crm_admin_roles: ['id', 'key'],
});

function readEnvFile(filePath = path.join(ROOT, '.env.local')) {
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

function readLinkedProjectRef() {
  const linkedRefPath = path.join(ROOT, 'supabase', '.temp', 'project-ref');
  if (!fs.existsSync(linkedRefPath)) return null;
  return fs.readFileSync(linkedRefPath, 'utf8').trim() || null;
}

function projectRefFromUrl(value) {
  if (!value) return null;
  try {
    const hostname = new URL(value).hostname;
    const match = hostname.match(/^([a-z0-9]{20})\.supabase\.co$/);
    return match?.[1] || null;
  } catch {
    return null;
  }
}

function resolveConfiguration(overrides = {}) {
  const fileEnv = readEnvFile(overrides.envFilePath);
  const env = { ...fileEnv, ...process.env, ...(overrides.env || {}) };
  const supabaseUrl = env.SUPABASE_URL || env.REACT_APP_SUPABASE_URL || '';
  return {
    environmentName: env.ENVIRONMENT || env.SUPABASE_ENVIRONMENT || '',
    allowMutations: env.ALLOW_STAGING_DATABASE_MUTATIONS || '',
    supabaseUrl,
    detectedProjectRef: projectRefFromUrl(supabaseUrl),
    expectedStagingProjectRef:
      env.EXPECTED_STAGING_SUPABASE_PROJECT_REF || env.SUPABASE_EXPECTED_STAGING_PROJECT_REF || '',
    productionProjectRef: env.PRODUCTION_SUPABASE_PROJECT_REF || '',
    linkedProjectRef: overrides.linkedProjectRef === undefined ? readLinkedProjectRef() : overrides.linkedProjectRef,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY || '',
  };
}

function validateStagingTarget(config) {
  const errors = [];
  if (config.environmentName !== 'staging') errors.push('ENVIRONMENT must equal staging.');
  if (config.allowMutations !== 'true') errors.push('ALLOW_STAGING_DATABASE_MUTATIONS must equal true.');
  if (!config.expectedStagingProjectRef) errors.push('EXPECTED_STAGING_SUPABASE_PROJECT_REF is required.');
  if (!config.productionProjectRef) errors.push('PRODUCTION_SUPABASE_PROJECT_REF is required.');
  if (!config.detectedProjectRef) errors.push('The configured Supabase URL does not contain a valid project reference.');
  if (
    config.detectedProjectRef &&
    config.expectedStagingProjectRef &&
    config.detectedProjectRef !== config.expectedStagingProjectRef
  ) {
    errors.push('The configured Supabase URL does not match the expected staging project reference.');
  }
  if (config.linkedProjectRef && config.detectedProjectRef && config.linkedProjectRef !== config.detectedProjectRef) {
    errors.push('The Supabase CLI link does not match the configured staging URL.');
  }
  if (
    config.productionProjectRef &&
    [config.detectedProjectRef, config.expectedStagingProjectRef, config.linkedProjectRef]
      .filter(Boolean)
      .includes(config.productionProjectRef)
  ) {
    errors.push('The detected, expected, or linked project reference matches production.');
  }
  return errors;
}

function validateStagingReadOnlyTarget(config) {
  return validateStagingTarget({ ...config, allowMutations: 'true' }).filter(
    (error) => error !== 'ALLOW_STAGING_DATABASE_MUTATIONS must equal true.',
  );
}

function assertStagingReadOnlyTarget(overrides = {}) {
  const config = resolveConfiguration(overrides);
  const errors = validateStagingReadOnlyTarget(config);
  if (errors.length) {
    throw new Error(`Staging read-only safety gate failed: ${errors.join(' ')}`);
  }
  return config;
}

async function verifyTableShape(config, tableName, columns, fetchImpl = global.fetch) {
  if (!config.serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for schema verification.');
  if (typeof fetchImpl !== 'function') throw new Error('A fetch implementation is required for schema verification.');
  const select = encodeURIComponent(columns.join(','));
  const response = await fetchImpl(`${config.supabaseUrl}/rest/v1/${tableName}?select=${select}&limit=0`, {
    method: 'GET',
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      Accept: 'application/json',
      Prefer: 'count=none',
    },
  });
  if (!response.ok) throw new Error(`Required table or columns are missing: public.${tableName}.`);
}

async function assertStagingDatabaseSafety(options = {}) {
  const config = resolveConfiguration(options);
  const targetErrors = validateStagingTarget(config);
  if (targetErrors.length) throw new Error(`Staging database safety gate failed: ${targetErrors.join(' ')}`);

  const requireLegacyBaseline = options.requireLegacyBaseline !== false;
  if (requireLegacyBaseline) {
    for (const [tableName, columns] of Object.entries(REQUIRED_LEGACY_SCHEMA)) {
      await verifyTableShape(config, tableName, columns, options.fetchImpl);
    }
  }
  if (options.requireCrmSchema) {
    for (const [tableName, columns] of Object.entries(REQUIRED_CRM_SCHEMA)) {
      await verifyTableShape(config, tableName, columns, options.fetchImpl);
    }
  }
  return { ok: true, legacyBaselineVerified: requireLegacyBaseline, crmSchemaVerified: Boolean(options.requireCrmSchema) };
}

module.exports = {
  REQUIRED_CRM_SCHEMA,
  REQUIRED_LEGACY_SCHEMA,
  assertStagingDatabaseSafety,
  assertStagingReadOnlyTarget,
  projectRefFromUrl,
  resolveConfiguration,
  validateStagingTarget,
  validateStagingReadOnlyTarget,
  verifyTableShape,
};
