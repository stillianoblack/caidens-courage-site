const { getServiceSupabase } = require('./_lib/pushSender');
const { buildPinFingerprint, verifyStudentPinHash } = require('./_lib/studentPinCrypto');

const LOCKOUT_ATTEMPTS = 8;
const LOCKOUT_MS = 15 * 60 * 1000;
const attemptStore = new Map();

function jsonResponse(body, status = 200) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function clientKey(event, programCode) {
  const ip =
    event.headers['x-nf-client-connection-ip'] ||
    event.headers['client-ip'] ||
    event.headers['x-forwarded-for'] ||
    'unknown';
  return `${programCode}|${ip}`;
}

function checkLockout(key) {
  const entry = attemptStore.get(key);
  if (!entry) return { locked: false, remaining: LOCKOUT_ATTEMPTS };
  if (entry.lockedUntil && Date.now() < entry.lockedUntil) {
    return { locked: true, remaining: 0 };
  }
  if (entry.lockedUntil && Date.now() >= entry.lockedUntil) {
    attemptStore.delete(key);
    return { locked: false, remaining: LOCKOUT_ATTEMPTS };
  }
  return { locked: false, remaining: Math.max(0, LOCKOUT_ATTEMPTS - entry.failures) };
}

function recordFailure(key) {
  const entry = attemptStore.get(key) || { failures: 0, lockedUntil: null };
  entry.failures += 1;
  if (entry.failures >= LOCKOUT_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCKOUT_MS;
  }
  attemptStore.set(key, entry);
}

function clearAttempts(key) {
  attemptStore.delete(key);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse({ error: 'Invalid request.' }, 400);
  }

  const programCode = String(body.programCode || '').trim();
  const pin = String(body.pin || '').trim();
  const firstNameHint = String(body.firstNameHint || '').trim().toLowerCase();

  if (!programCode || !pin) {
    return jsonResponse({ error: 'Program code and PIN are required.' }, 400);
  }

  const lockKey = clientKey(event, programCode);
  const lockout = checkLockout(lockKey);
  if (lockout.locked) {
    return jsonResponse({ error: 'Too many attempts. Try again later.' }, 429);
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return jsonResponse({ error: 'Service unavailable.' }, 503);
  }

  const fingerprint = buildPinFingerprint(programCode, pin);

  const { data: rows, error } = await supabase
    .from('participants')
    .select('id, first_name, nickname, student_pin_hash, student_pin_enabled, program_code')
    .eq('program_code', programCode)
    .eq('role', 'student')
    .eq('student_pin_fingerprint', fingerprint)
    .eq('student_pin_enabled', true)
    .limit(5);

  if (error) {
    console.warn('[VERIFY_STUDENT_PIN]', { reason: 'lookup_failed', message: error.message });
    return jsonResponse({ error: 'Could not verify login.' }, 500);
  }

  const candidates = (rows || []).filter((row) =>
    verifyStudentPinHash(programCode, pin, row.student_pin_hash),
  );

  if (!candidates.length) {
    recordFailure(lockKey);
    return jsonResponse({ error: 'Program code or PIN did not match.' }, 401);
  }

  let match = candidates[0];
  if (candidates.length > 1 && firstNameHint) {
    const narrowed = candidates.filter((row) => {
      const first = String(row.first_name || '').trim().toLowerCase();
      const nick = String(row.nickname || '').trim().toLowerCase();
      return first === firstNameHint || nick.startsWith(firstNameHint);
    });
    if (narrowed.length === 1) match = narrowed[0];
  }

  clearAttempts(lockKey);

  const displayName =
    String(match.nickname || '').trim() || String(match.first_name || '').trim() || 'Player';

  return jsonResponse({
    success: true,
    participantId: match.id,
    displayName,
    programCode: match.program_code,
  });
};
