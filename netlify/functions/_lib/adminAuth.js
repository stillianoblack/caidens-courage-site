const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function correlationId(event = {}) {
  const incoming = event.headers?.['x-correlation-id'] || event.headers?.['X-Correlation-Id'];
  return /^[a-zA-Z0-9._-]{8,120}$/.test(String(incoming || ''))
    ? String(incoming)
    : crypto.randomUUID();
}

function json(statusCode, body, id) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Correlation-Id': id,
    },
    body: JSON.stringify(body),
  };
}

function getServerSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function configuredCredentials() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const passcode = process.env.ADMIN_PASSCODE?.trim();
  return email && passcode ? { email, passcode } : null;
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function signature(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

function issueAdminToken(email, secret, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ email, exp: now + SESSION_TTL_MS })).toString('base64url');
  return `${payload}.${signature(payload, secret)}`;
}

function verifyAdminToken(token, credentials, now = Date.now()) {
  if (!token || !credentials) return false;
  const [payload, suppliedSignature, extra] = String(token).split('.');
  if (!payload || !suppliedSignature || extra) return false;
  if (!safeEqual(suppliedSignature, signature(payload, credentials.passcode))) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return (
      typeof parsed.exp === 'number' &&
      parsed.exp > now &&
      safeEqual(String(parsed.email || '').toLowerCase(), credentials.email)
    );
  } catch {
    return false;
  }
}

function bearerToken(event = {}) {
  const value = event.headers?.authorization || event.headers?.Authorization || '';
  return String(value).match(/^Bearer\s+(.+)$/i)?.[1]?.trim() || null;
}

function authenticateCredentials(email, passcode) {
  const credentials = configuredCredentials();
  if (!credentials) return { configured: false, valid: false };
  const normalizedEmail = String(email || '').trim().toLowerCase();
  return {
    configured: true,
    valid: safeEqual(normalizedEmail, credentials.email) && safeEqual(String(passcode || ''), credentials.passcode),
    credentials,
  };
}

async function requireAdmin(event, suppliedClient) {
  const id = correlationId(event);
  const credentials = configuredCredentials();
  if (!credentials) {
    console.error('[ADMIN_AUTH_CONFIG_MISSING]', { correlationId: id });
    return { response: json(503, { error: 'Admin service is unavailable.' }, id) };
  }
  if (!verifyAdminToken(bearerToken(event), credentials)) {
    return { response: json(401, { error: 'Authentication required.' }, id) };
  }
  const supabase = suppliedClient || getServerSupabase();
  if (!supabase) {
    console.error('[ADMIN_DATA_CONFIG_MISSING]', { correlationId: id });
    return { response: json(503, { error: 'Admin service is unavailable.' }, id) };
  }
  return { context: { correlationId: id, supabase } };
}

module.exports = {
  authenticateCredentials,
  bearerToken,
  configuredCredentials,
  correlationId,
  getServerSupabase,
  issueAdminToken,
  json,
  requireAdmin,
  verifyAdminToken,
};
