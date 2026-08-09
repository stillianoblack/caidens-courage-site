#!/usr/bin/env node
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { assertStagingDatabaseSafety, resolveConfiguration } = require('./lib/stagingSafetyGate');

const ROOT = path.resolve(__dirname, '..');
const OWNED = '00000000-0000-4000-8000-000000000103';
const OTHER = '00000000-0000-4000-8000-000000000104';
const FAMILY_PROGRAM = '00000000-0000-4000-8000-000000000110';

function env() {
  return Object.fromEntries(fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8').split(/\r?\n/)
    .filter((line) => line && !line.trim().startsWith('#') && line.includes('='))
    .map((line) => { const at = line.indexOf('='); return [line.slice(0, at).trim(), line.slice(at + 1).trim()]; }));
}
async function request(url, options = {}) {
  const response = await fetch(url, options); const text = await response.text();
  let body = null; try { body = text ? JSON.parse(text) : null; } catch { body = null; }
  return { ok: response.ok, status: response.status, body };
}
const headers = (key, bearer = key, extra = {}) => ({ apikey: key, Authorization: `Bearer ${bearer}`, ...extra });

async function main() {
  await assertStagingDatabaseSafety({ requireLegacyBaseline: true });
  const config = resolveConfiguration(); const local = env();
  const anon = local.REACT_APP_SUPABASE_ANON_KEY; const service = local.SUPABASE_SERVICE_ROLE_KEY;
  if (!anon || !service) throw new Error('Staging API credentials are required.');
  process.env.SUPABASE_URL = config.supabaseUrl;
  process.env.SUPABASE_SERVICE_ROLE_KEY = service;
  process.env.PORTAL_AUTH_OWNERSHIP_ENABLED = 'true';
  const endpoint = require('../netlify/functions/portal-b4-variant');

  const original = await request(`${config.supabaseUrl}/rest/v1/participants?select=b4_variant_key&id=eq.${OWNED}`, { headers: headers(service) });
  if (!original.ok || !original.body?.[0]) throw new Error('B-4 staging column could not be read.');
  const originalVariant = original.body[0].b4_variant_key;
  const email = `b4-variant-${crypto.randomUUID()}@fictional.example`;
  const password = crypto.randomBytes(24).toString('base64url');
  let userId = null;
  try {
    const created = await request(`${config.supabaseUrl}/auth/v1/admin/users`, { method: 'POST', headers: headers(service, service, { 'Content-Type': 'application/json' }), body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { staging_persona: 'b4-variant-test' } }) });
    userId = created.body?.id; if (!created.ok || !userId) throw new Error('Disposable B-4 Auth user could not be created.');
    const signIn = await request(`${config.supabaseUrl}/auth/v1/token?grant_type=password`, { method: 'POST', headers: headers(anon, anon, { 'Content-Type': 'application/json' }), body: JSON.stringify({ email, password }) });
    const token = signIn.body?.access_token; if (!signIn.ok || !token) throw new Error('Disposable B-4 Auth user could not sign in.');
    const grant = await request(`${config.supabaseUrl}/rest/v1/rpc/grant_portal_ownership`, { method: 'POST', headers: headers(service, service, { 'Content-Type': 'application/json' }), body: JSON.stringify({ target_auth_user_id: userId, target_program_id: FAMILY_PROGRAM, target_portal_role: 'family_guardian', target_participant_id: OWNED, grant_source_input: 'staging_test', reason_input: 'Disposable B-4 variant ownership verification', actor_auth_user_id_input: null }) });
    if (!grant.ok) throw new Error('Disposable B-4 ownership grant failed.');

    const invoke = (participantId, method, body) => endpoint.handler({ httpMethod: method, rawQuery: `participantId=${participantId}`, headers: { authorization: `Bearer ${token}` }, body: body ? JSON.stringify(body) : null });
    const saved = await invoke(OWNED, 'PUT', { variant: 'pattern' });
    const loaded = await invoke(OWNED, 'GET');
    const legacy = await invoke(OWNED, 'PUT', { variant: 'spark' });
    const invalid = await invoke(OWNED, 'PUT', { variant: 'invalid' });
    const cross = await invoke(OTHER, 'PUT', { variant: 'fusion' });
    const parse = (result) => result.body ? JSON.parse(result.body) : {};
    if (saved.statusCode !== 200 || parse(saved).variant !== 'pattern') throw new Error('Owned B-4 save did not persist pattern.');
    if (loaded.statusCode !== 200 || parse(loaded).variant !== 'pattern') throw new Error('B-4 refresh did not restore pattern.');
    if (legacy.statusCode !== 200 || parse(legacy).variant !== 'courage') throw new Error('Legacy spark did not normalize to courage.');
    if (invalid.statusCode !== 400 || cross.statusCode !== 403) throw new Error('B-4 allowlist or cross-participant denial failed.');
    console.log('Staging B-4 persistence, legacy normalization, invalid-value rejection, and ownership isolation passed.');
  } finally {
    await request(`${config.supabaseUrl}/rest/v1/participants?id=eq.${OWNED}`, { method: 'PATCH', headers: headers(service, service, { 'Content-Type': 'application/json' }), body: JSON.stringify({ b4_variant_key: originalVariant }) });
    if (userId) await request(`${config.supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(userId)}`, { method: 'DELETE', headers: headers(service) });
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
