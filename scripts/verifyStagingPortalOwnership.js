const crypto = require('crypto');
const fs = require('fs');
const https = require('https');
const path = require('path');
const { assertStagingDatabaseSafety, resolveConfiguration } = require('./lib/stagingSafetyGate');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'docs', 'audits', 'staging-portal-ownership-result.json');
const CAMP_PROGRAM = '00000000-0000-4000-8000-000000000100';
const FAMILY_PROGRAM = '00000000-0000-4000-8000-000000000110';
const NOVA = '00000000-0000-4000-8000-000000000103';
const ORION = '00000000-0000-4000-8000-000000000104';

function readLocalEnv() {
  return Object.fromEntries(fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8')
    .split(/\r?\n/).filter((line) => line && !line.trim().startsWith('#') && line.includes('='))
    .map((line) => { const at = line.indexOf('='); return [line.slice(0, at).trim(), line.slice(at + 1).trim()]; }));
}

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = null; }
  return { ok: response.ok, status: response.status, body };
}

function headers(apiKey, bearer = apiKey, extra = {}) {
  return { apikey: apiKey, Authorization: `Bearer ${bearer}`, ...extra };
}

function managementQuery(projectRef, accessToken, sql) {
  const payload = JSON.stringify({ query: sql });
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.supabase.com', path: `/v1/projects/${projectRef}/database/query`, method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    }, (response) => {
      let body = '';
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => {
        if (response.statusCode !== 200 && response.statusCode !== 201) {
          reject(new Error(`Role-scoped ownership probe failed with HTTP ${response.statusCode}.`)); return;
        }
        resolve(JSON.parse(body));
      });
    });
    req.on('error', reject); req.write(payload); req.end();
  });
}

async function createUser(baseUrl, serviceKey, anonKey, persona) {
  const email = `${persona}-${crypto.randomUUID()}@fictional.example`;
  const password = crypto.randomBytes(24).toString('base64url');
  const created = await request(`${baseUrl}/auth/v1/admin/users`, {
    method: 'POST', headers: headers(serviceKey, serviceKey, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { staging_persona: persona } }),
  });
  if (!created.ok || !created.body?.id) throw new Error(`Could not create disposable ${persona} Auth user.`);
  const signedIn = await request(`${baseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST', headers: headers(anonKey, anonKey, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ email, password }),
  });
  if (!signedIn.ok || !signedIn.body?.access_token) throw new Error(`Could not sign in disposable ${persona}.`);
  const claims = JSON.parse(Buffer.from(signedIn.body.access_token.split('.')[1], 'base64url').toString('utf8'));
  if (claims.sub !== created.body.id || claims.role !== 'authenticated') {
    throw new Error(`Disposable ${persona} received an unexpected Auth token context.`);
  }
  return { persona, id: created.body.id, accessToken: signedIn.body.access_token };
}

async function rpcGrant(baseUrl, serviceKey, user, programId, role, participantId = null) {
  const response = await request(`${baseUrl}/rest/v1/rpc/grant_portal_ownership`, {
    method: 'POST', headers: headers(serviceKey, serviceKey, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      target_auth_user_id: user.id, target_program_id: programId, target_portal_role: role,
      target_participant_id: participantId, grant_source_input: 'staging_test',
      reason_input: 'Disposable staging authorization matrix verification', actor_auth_user_id_input: null,
    }),
  });
  if (!response.ok) throw new Error(`Could not grant ${user.persona} staging ownership (HTTP ${response.status}).`);
}

async function selectIds(baseUrl, anonKey, token, table, column = 'id', filter = '') {
  const response = await request(`${baseUrl}/rest/v1/${table}?select=${column}${filter}`, {
    headers: headers(anonKey, token, { Accept: 'application/json' }),
  });
  if (!response.ok) {
    const detail = [response.body?.code, response.body?.message, response.body?.details, response.body?.hint].filter(Boolean).join(' ');
    throw new Error(`${table} ownership read failed with HTTP ${response.status}${detail ? ` (${detail})` : ''}.`);
  }
  return (response.body || []).map((row) => row[column]);
}

function assertExact(actual, expected, label) {
  const normalizedActual = [...actual].sort();
  const normalizedExpected = [...expected].sort();
  if (JSON.stringify(normalizedActual) !== JSON.stringify(normalizedExpected)) {
    throw new Error(`${label} did not match the explicit staging ownership boundary.`);
  }
}

async function main() {
  await assertStagingDatabaseSafety({ requireLegacyBaseline: true });
  const config = resolveConfiguration();
  const env = readLocalEnv();
  const anonKey = env.REACT_APP_SUPABASE_ANON_KEY;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const accessToken = env.SUPABASE_ACCESS_TOKEN;
  if (!anonKey || !serviceKey || !accessToken) throw new Error('Staging keys and management token are required.');

  const users = [];
  let adminAssignmentId = null;
  try {
    for (const persona of ['family', 'student', 'facilitator', 'internal-admin']) {
      users.push(await createUser(config.supabaseUrl, serviceKey, anonKey, persona));
    }
    const family = users.find((user) => user.persona === 'family');
    const student = users.find((user) => user.persona === 'student');
    const facilitator = users.find((user) => user.persona === 'facilitator');
    const admin = users.find((user) => user.persona === 'internal-admin');
    await rpcGrant(config.supabaseUrl, serviceKey, family, FAMILY_PROGRAM, 'family_guardian', NOVA);
    await rpcGrant(config.supabaseUrl, serviceKey, student, CAMP_PROGRAM, 'student', NOVA);
    await rpcGrant(config.supabaseUrl, serviceKey, facilitator, CAMP_PROGRAM, 'facilitator');

    const familyGrantRows = await request(
      `${config.supabaseUrl}/rest/v1/portal_participant_access?select=id&auth_user_id=eq.${family.id}&participant_id=eq.${NOVA}`,
      { headers: headers(serviceKey) },
    );
    if (!familyGrantRows.ok || familyGrantRows.body?.length !== 1) {
      throw new Error('The explicit disposable family participant grant was not stored.');
    }
    const familyRoleProbe = await managementQuery(config.detectedProjectRef, accessToken, `
      set local role authenticated;
      select set_config('request.jwt.claim.sub', '${family.id}', true);
      select private.portal_can_access_participant('${NOVA}'::uuid, 'STAGING-LANTERN-2026') as helper_result,
        count(*) filter (where id='${NOVA}'::uuid)::int as visible_nova
      from public.participants;
    `);
    const roleProbe = familyRoleProbe?.[0] || {};
    if (roleProbe.helper_result !== true || roleProbe.visible_nova !== 1) {
      throw new Error('The direct authenticated-role ownership probe did not expose exactly the granted participant.');
    }
    const authUserProbe = await request(`${config.supabaseUrl}/auth/v1/user`, {
      headers: headers(anonKey, family.accessToken),
    });
    if (!authUserProbe.ok || authUserProbe.body?.id !== family.id) {
      throw new Error('The disposable family bearer token was not accepted by staging Auth.');
    }
    const ownMembership = await selectIds(
      config.supabaseUrl, anonKey, family.accessToken, 'portal_program_memberships', 'program_id',
    );
    assertExact(ownMembership, [FAMILY_PROGRAM], 'Family ownership row read');

    const roles = await request(`${config.supabaseUrl}/rest/v1/crm_admin_roles?select=id&key=eq.internal_admin&limit=1`, {
      headers: headers(serviceKey),
    });
    const roleId = roles.body?.[0]?.id;
    const assignment = await request(`${config.supabaseUrl}/rest/v1/crm_admin_role_assignments?select=id`, {
      method: 'POST', headers: headers(serviceKey, serviceKey, { 'Content-Type': 'application/json', Prefer: 'return=representation' }),
      body: JSON.stringify({ auth_user_id: admin.id, role_id: roleId, status: 'active' }),
    });
    adminAssignmentId = assignment.body?.[0]?.id || null;
    if (!assignment.ok || !adminAssignmentId) throw new Error('Could not assign disposable internal admin.');

    const familyPrograms = await selectIds(config.supabaseUrl, anonKey, family.accessToken, 'pilot_programs');
    const familyParticipants = await selectIds(config.supabaseUrl, anonKey, family.accessToken, 'participants', 'id', `&id=in.(${NOVA},${ORION})`);
    const studentPrograms = await selectIds(config.supabaseUrl, anonKey, student.accessToken, 'pilot_programs');
    const studentParticipants = await selectIds(config.supabaseUrl, anonKey, student.accessToken, 'participants', 'id', `&id=in.(${NOVA},${ORION})`);
    const facilitatorPrograms = await selectIds(config.supabaseUrl, anonKey, facilitator.accessToken, 'pilot_programs');
    const facilitatorParticipants = await selectIds(config.supabaseUrl, anonKey, facilitator.accessToken, 'participants');
    assertExact(familyPrograms, [FAMILY_PROGRAM], 'Family program read');
    assertExact(familyParticipants, [NOVA], 'Family participant read');
    assertExact(studentPrograms, [CAMP_PROGRAM], 'Student program read');
    assertExact(studentParticipants, [NOVA], 'Student participant read');
    assertExact(facilitatorPrograms, [CAMP_PROGRAM], 'Facilitator program read');
    if (!facilitatorParticipants.includes(NOVA) || !facilitatorParticipants.includes(ORION)) {
      throw new Error('Facilitator did not receive assigned-program participant access.');
    }
    if (familyParticipants.includes(ORION) || studentParticipants.includes(ORION)) {
      throw new Error('A family or student actor crossed the explicit participant boundary.');
    }

    const deniedWrite = await request(`${config.supabaseUrl}/rest/v1/participants`, {
      method: 'POST', headers: headers(anonKey, family.accessToken, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ role: 'student', nickname: 'Must Not Exist' }),
    });
    if (deniedWrite.ok) throw new Error('Family direct write was unexpectedly allowed.');

    const anonymousResponse = await request(`${config.supabaseUrl}/rest/v1/participants?select=id`, {
      headers: headers(anonKey, anonKey, { Accept: 'application/json' }),
    });
    const anonymousRows = anonymousResponse.ok && Array.isArray(anonymousResponse.body)
      ? anonymousResponse.body.length : 0;
    if ((anonymousResponse.ok && anonymousRows > 0)
      || (!anonymousResponse.ok && ![401, 403].includes(anonymousResponse.status))) {
      throw new Error('Anonymous participant access was not safely denied.');
    }
    const adminRows = await selectIds(config.supabaseUrl, anonKey, admin.accessToken, 'participants');
    const serviceRows = await selectIds(config.supabaseUrl, serviceKey, serviceKey, 'participants');
    if (adminRows.length !== serviceRows.length || serviceRows.length < 4) {
      throw new Error('Internal-admin/service-role control reads did not match the staging fixture.');
    }

    const audit = await request(`${config.supabaseUrl}/rest/v1/portal_ownership_audit_events?select=id&target_auth_user_id=in.(${family.id},${student.id},${facilitator.id})`, {
      headers: headers(serviceKey),
    });
    if (!audit.ok || audit.body?.length !== 3) throw new Error('Ownership audit evidence was incomplete.');

    const result = {
      generated_at: new Date().toISOString(), scope: 'disposable staging-only Auth/RLS authorization matrix',
      assertions: {
        anonymous_sensitive_rows: 0, anonymous_denial_status: anonymousResponse.status,
        family_program_rows: familyPrograms.length,
        family_participant_rows: familyParticipants.length, student_program_rows: studentPrograms.length,
        student_participant_rows: studentParticipants.length, facilitator_program_rows: facilitatorPrograms.length,
        facilitator_participant_rows: facilitatorParticipants.length, internal_admin_participant_rows: adminRows.length,
        service_role_participant_rows: serviceRows.length, direct_family_write_denied: true,
        ownership_audit_events: audit.body.length, email_inference_used: false, access_code_grant_used: false,
      },
    };
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, `${JSON.stringify(result, null, 2)}\n`, { mode: 0o600 });
    console.log('Staging portal ownership matrix passed. Disposable Auth users will now be removed.');
  } finally {
    if (adminAssignmentId) await request(`${config.supabaseUrl}/rest/v1/crm_admin_role_assignments?id=eq.${adminAssignmentId}`, { method: 'DELETE', headers: headers(serviceKey) });
    for (const user of users) {
      await request(`${config.supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(user.id)}`, { method: 'DELETE', headers: headers(serviceKey) });
    }
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
