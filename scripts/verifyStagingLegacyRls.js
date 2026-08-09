const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { assertStagingDatabaseSafety, resolveConfiguration } = require('./lib/stagingSafetyGate');

const ROOT = path.resolve(__dirname, '..');
const SENSITIVE_TABLES = Object.freeze({
  participants: 'id',
  student_family_links: 'id',
  assessment_results: 'id',
  assessment_results_v2: 'id',
  player_progress: 'id',
  module_results: 'id',
  program_goals: 'id',
  player_wallets: 'participant_id',
  player_badges: 'id',
  kid_play_sessions: 'id',
});

function readLocalEnv() {
  return Object.fromEntries(
    fs
      .readFileSync(path.join(ROOT, '.env.local'), 'utf8')
      .split(/\r?\n/)
      .filter((line) => line && !line.trim().startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=');
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
      }),
  );
}

async function request(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }
  return { ok: response.ok, status: response.status, body };
}

function headers(apiKey, bearer = apiKey, extra = {}) {
  return { apikey: apiKey, Authorization: `Bearer ${bearer}`, ...extra };
}

async function createUser(baseUrl, serviceKey, anonKey, persona) {
  const suffix = crypto.randomUUID();
  const email = `${persona}-${suffix}@fictional.example`;
  const password = crypto.randomBytes(24).toString('base64url');
  const created = await request(`${baseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: headers(serviceKey, serviceKey, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { staging_persona: persona } }),
  });
  if (!created.ok || !created.body?.id) throw new Error(`Could not create disposable ${persona} Auth user.`);
  const signedIn = await request(`${baseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: headers(anonKey, anonKey, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ email, password }),
  });
  if (!signedIn.ok || !signedIn.body?.access_token) throw new Error(`Could not sign in disposable ${persona} Auth user.`);
  return { id: created.body.id, accessToken: signedIn.body.access_token };
}

async function tableRowCount(baseUrl, apiKey, bearer, tableName, columnName) {
  const response = await request(`${baseUrl}/rest/v1/${tableName}?select=${columnName}&limit=1`, {
    headers: headers(apiKey, bearer, { Accept: 'application/json' }),
  });
  if (!response.ok) {
    return {
      state: response.status === 401 || response.status === 403 ? 'denied' : 'request error',
      count: null,
      status: response.status,
    };
  }
  const count = Array.isArray(response.body) ? response.body.length : 0;
  return { state: count ? 'allowed with rows' : 'denied', count, status: response.status };
}

async function main() {
  await assertStagingDatabaseSafety({ requireLegacyBaseline: true });
  const config = resolveConfiguration();
  const env = readLocalEnv();
  const anonKey = env.REACT_APP_SUPABASE_ANON_KEY;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!anonKey || !serviceKey) throw new Error('Staging anon and service-role keys are required.');

  const users = [];
  let adminAssignmentId = null;
  try {
    for (const persona of ['family', 'student', 'facilitator', 'internal-admin']) {
      users.push({ persona, ...(await createUser(config.supabaseUrl, serviceKey, anonKey, persona)) });
    }
    const admin = users.find((user) => user.persona === 'internal-admin');
    const roles = await request(
      `${config.supabaseUrl}/rest/v1/crm_admin_roles?select=id&key=eq.internal_admin&limit=1`,
      { headers: headers(serviceKey) },
    );
    const roleId = roles.body?.[0]?.id;
    if (!roles.ok || !roleId) throw new Error('Internal admin role was not available for the RLS test.');
    const assignment = await request(`${config.supabaseUrl}/rest/v1/crm_admin_role_assignments?select=id`, {
      method: 'POST',
      headers: headers(serviceKey, serviceKey, {
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      }),
      body: JSON.stringify({ auth_user_id: admin.id, role_id: roleId, status: 'active' }),
    });
    adminAssignmentId = assignment.body?.[0]?.id || null;
    if (!assignment.ok || !adminAssignmentId) throw new Error('Could not assign the disposable internal admin role.');

    const actors = [
      { persona: 'anonymous', apiKey: anonKey, bearer: anonKey },
      ...users.map((user) => ({ persona: user.persona, apiKey: anonKey, bearer: user.accessToken })),
      { persona: 'server-role', apiKey: serviceKey, bearer: serviceKey },
    ];
    const matrix = {};
    for (const actor of actors) {
      matrix[actor.persona] = {};
      for (const [tableName, columnName] of Object.entries(SENSITIVE_TABLES)) {
        matrix[actor.persona][tableName] = (
          await tableRowCount(config.supabaseUrl, actor.apiKey, actor.bearer, tableName, columnName)
        ).state;
      }
    }
    console.log(JSON.stringify(matrix, null, 2));
  } finally {
    if (adminAssignmentId) {
      await request(
        `${config.supabaseUrl}/rest/v1/crm_admin_role_assignments?id=eq.${encodeURIComponent(adminAssignmentId)}`,
        { method: 'DELETE', headers: headers(serviceKey) },
      );
    }
    for (const user of users) {
      await request(`${config.supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(user.id)}`, {
        method: 'DELETE',
        headers: headers(serviceKey),
      });
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
