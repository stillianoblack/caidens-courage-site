const crypto = require('crypto');
const { getContextSupabaseConfig } = require('./supabaseRuntime');

const COOKIE_NAME = '__Host-cc_facilitator_session';
const SHORT_TTL_SECONDS = 8 * 60 * 60;
const REMEMBERED_TTL_SECONDS = 30 * 24 * 60 * 60;

function hashToken(token) {
  return crypto.createHash('sha256').update(String(token || '')).digest('hex');
}

function parseCookie(event) {
  const header = event?.headers?.cookie || event?.headers?.Cookie || '';
  for (const part of String(header).split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() === COOKIE_NAME) {
      return decodeURIComponent(part.slice(separator + 1).trim());
    }
  }
  return null;
}

function cookieHeader(token, maxAge) {
  const expires = new Date(Date.now() + maxAge * 1000).toUTCString();
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}; Expires=${expires}`;
}

function clearCookieHeader() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function safeProgram(program) {
  return {
    id: String(program.id || ''),
    programName: String(program.program_name || '').trim(),
    programCode: String(program.program_code || '').trim(),
    programType: String(program.program_type || '').trim(),
    adminFirstName: '',
    adminEmail: '',
    estimatedStudents: Number(program.estimated_students || 0),
    ageRange: String(program.age_range || '').trim(),
    groupName: String(program.group_name || '').trim(),
    familyAccessCode: '',
    facilitatorAccessCode: null,
    pricingTier: String(program.pricing_tier || '').trim(),
    paymentStatus: String(program.payment_status || '').trim(),
    pilotStatus: String(program.pilot_status || '').trim(),
    agreedAt: String(program.agreed_at || '').trim(),
    createdAt: program.created_at || undefined,
  };
}

function requestHost(event) {
  return String(event?.headers?.['x-forwarded-host'] || event?.headers?.host || '').split(',')[0].trim().toLowerCase();
}

function originIsSameHost(event) {
  const origin = String(event?.headers?.origin || event?.headers?.Origin || '').trim();
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    return parsed.protocol === 'https:' && parsed.host.toLowerCase() === requestHost(event);
  } catch {
    return false;
  }
}

async function createFacilitatorSession(supabase, program, credential, rememberDevice) {
  const runtime = getContextSupabaseConfig();
  if (!runtime) return { error: 'runtime_context_mismatch' };
  const token = crypto.randomBytes(32).toString('base64url');
  const now = new Date();
  const ttl = rememberDevice ? REMEMBERED_TTL_SECONDS : SHORT_TTL_SECONDS;
  const expiresAt = new Date(now.getTime() + ttl * 1000);
  const identityHash = credential
    ? crypto.createHash('sha256').update(String(credential).trim().toLowerCase()).digest('hex')
    : null;
  if (identityHash) {
    const { error: rotationError } = await supabase
      .from('facilitator_compatibility_sessions')
      .update({
        revoked_at: now.toISOString(),
        revoke_reason: 'reauthorized',
      })
      .eq('environment', runtime.context)
      .eq('role', 'facilitator')
      .eq('program_id', program.id)
      .eq('facilitator_identity_hash', identityHash)
      .is('revoked_at', null);
    if (rotationError) return { error: 'facilitator_session_rotation_failed' };
  }
  const { error } = await supabase.from('facilitator_compatibility_sessions').insert({
    token_hash: hashToken(token),
    environment: runtime.context,
    role: 'facilitator',
    program_id: program.id,
    program_code: program.program_code,
    facilitator_identity_hash: identityHash,
    remember_device: Boolean(rememberDevice),
    issued_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    last_seen_at: now.toISOString(),
  });
  if (error) return { error: 'facilitator_session_create_failed' };
  return { token, ttl, expiresAt: expiresAt.toISOString() };
}

async function readFacilitatorSession(event, supabase, options = {}) {
  const runtime = getContextSupabaseConfig();
  if (!runtime) return { status: 503, code: 'runtime_context_mismatch' };
  const token = parseCookie(event);
  if (!token) return { status: 401, code: 'missing_facilitator_session' };
  const now = new Date().toISOString();
  const { data: session, error } = await supabase
    .from('facilitator_compatibility_sessions')
    .select('id, environment, role, program_id, program_code, expires_at, revoked_at')
    .eq('token_hash', hashToken(token))
    .eq('environment', runtime.context)
    .eq('role', 'facilitator')
    .is('revoked_at', null)
    .gt('expires_at', now)
    .maybeSingle();
  if (error) return { status: 503, code: 'facilitator_session_lookup_failed' };
  if (!session) return { status: 401, code: 'invalid_facilitator_session' };
  const { data: program, error: programError } = await supabase
    .from('pilot_programs')
    .select('id, program_name, program_code, program_type, estimated_students, age_range, group_name, pricing_tier, payment_status, pilot_status, agreed_at, created_at')
    .eq('id', session.program_id)
    .eq('program_code', session.program_code)
    .neq('pilot_status', 'archived')
    .maybeSingle();
  if (programError) return { status: 503, code: 'facilitator_program_lookup_failed' };
  if (!program || program.program_type === 'independent_family') {
    return { status: 403, code: 'invalid_facilitator_session' };
  }
  if (options.touch !== false) {
    await supabase.from('facilitator_compatibility_sessions')
      .update({ last_seen_at: now })
      .eq('id', session.id)
      .is('revoked_at', null);
  }
  return { session, program, safeProgram: safeProgram(program), token };
}

async function revokeFacilitatorSession(event, supabase, reason = 'signed_out') {
  const token = parseCookie(event);
  if (!token) return;
  await supabase.from('facilitator_compatibility_sessions')
    .update({ revoked_at: new Date().toISOString(), revoke_reason: reason })
    .eq('token_hash', hashToken(token))
    .is('revoked_at', null);
}

module.exports = {
  COOKIE_NAME,
  clearCookieHeader,
  cookieHeader,
  createFacilitatorSession,
  originIsSameHost,
  readFacilitatorSession,
  revokeFacilitatorSession,
  safeProgram,
};
