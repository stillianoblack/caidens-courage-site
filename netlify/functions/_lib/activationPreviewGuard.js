const ACTIVATION_STAGING_PROJECT_REF = 'gpcsombdaxlvlizoupqw';
const ACTIVATION_PRODUCTION_PROJECT_REF = 'bnopaocdqkknjzmmkaen';
const STAGING_PREVIEW_ORIGIN = 'https://caidens-courage-staging.netlify.app';
const RECOVERED_FOUNDERS_RESERVE_SESSION_ID = 'cs_test_a1FleCE2Pvd5QHUL4PUEPJgqOgtIwsmQzgHVWgsgYP5Hh8yuws0mt5aydO';

const PRODUCTION_SITE_ORIGINS = new Set([
  'https://caidenscourage.com',
  'https://www.caidenscourage.com',
  'https://caidenvale.com',
  'https://www.caidenvale.com',
  'https://quiet-pothos-3ae8ce.netlify.app',
]);

function projectRefFromSupabaseUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    const match = url.hostname.match(/^([a-z0-9]+)\.supabase\.co$/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function serviceRoleClaims(key) {
  const parts = String(key || '').trim().split('.');
  if (parts.length !== 3 || !parts[1]) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    if (!payload || typeof payload.ref !== 'string' || payload.role !== 'service_role') return null;
    return payload;
  } catch {
    return null;
  }
}

function resolveActivationSupabase(env = process.env) {
  const url = String(env.SUPABASE_URL || '').trim();
  const key = String(env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !key) return { ok: false, reason: 'missing_configuration' };

  const urlRef = projectRefFromSupabaseUrl(url);
  const claims = serviceRoleClaims(key);
  const keyRef = claims?.ref || null;
  if (
    urlRef === ACTIVATION_PRODUCTION_PROJECT_REF
    || keyRef === ACTIVATION_PRODUCTION_PROJECT_REF
  ) {
    return { ok: false, reason: 'production_identity_refused' };
  }
  if (!urlRef || !keyRef || urlRef !== keyRef || urlRef !== ACTIVATION_STAGING_PROJECT_REF) {
    return { ok: false, reason: 'mismatched_credentials' };
  }
  return { ok: true, url, key };
}

function createActivationServiceClient(env = process.env, createClientImpl) {
  const resolved = resolveActivationSupabase(env);
  if (!resolved.ok) return null;
  const createClient = createClientImpl || require('@supabase/supabase-js').createClient;
  let transport;
  try {
    transport = global.WebSocket || require('ws');
  } catch {
    transport = undefined;
  }
  const options = {
    auth: { persistSession: false, autoRefreshToken: false },
  };
  if (transport) options.realtime = { transport };
  return createClient(resolved.url, resolved.key, options);
}

function httpsOrigin(value) {
  try {
    const url = new URL(String(value || '').trim());
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    if (url.pathname !== '/' && url.pathname !== '') return null;
    if (url.search || url.hash) return null;
    return url.origin;
  } catch {
    return null;
  }
}

function explicitPreviewOrigins(env = process.env) {
  return String(env.ACADEMY_PREVIEW_ORIGINS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function configuredPreviewOrigins(env = process.env) {
  const explicit = explicitPreviewOrigins(env);
  const context = String(env.CONTEXT || '').trim().toLowerCase();
  if (context === 'branch-deploy') return explicit;
  return [STAGING_PREVIEW_ORIGIN, ...explicit];
}

function resolvePreviewClaimOrigin(origin, env = process.env) {
  const candidate = httpsOrigin(origin);
  if (!candidate || PRODUCTION_SITE_ORIGINS.has(candidate)) return null;
  const allowed = new Set(
    configuredPreviewOrigins(env)
      .map((item) => httpsOrigin(item))
      .filter((item) => item && !PRODUCTION_SITE_ORIGINS.has(item)),
  );
  return allowed.has(candidate) ? candidate : null;
}

function claimLinkOrigin({ publicOrigin, env = process.env } = {}) {
  const context = String(env.CONTEXT || '').trim().toLowerCase();
  const origin = context === 'branch-deploy'
    ? String(env.DEPLOY_PRIME_URL || '').trim()
    : publicOrigin;
  return resolvePreviewClaimOrigin(origin, env);
}

function recoveredClaimLocked(claim, env = process.env) {
  const sessionId = String(claim?.checkoutSessionId || claim?.checkout_session_id || '').trim();
  if (!sessionId || sessionId !== RECOVERED_FOUNDERS_RESERVE_SESSION_ID) return false;
  return env.ACADEMY_ALLOW_RECOVERED_CLAIM_ACTIVATION !== 'approved';
}

module.exports = {
  ACTIVATION_PRODUCTION_PROJECT_REF,
  ACTIVATION_STAGING_PROJECT_REF,
  RECOVERED_FOUNDERS_RESERVE_SESSION_ID,
  STAGING_PREVIEW_ORIGIN,
  claimLinkOrigin,
  createActivationServiceClient,
  recoveredClaimLocked,
  resolveActivationSupabase,
  resolvePreviewClaimOrigin,
};
