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

async function resolveProgramCode(supabase, rawProgramCode) {
  const trimmed = String(rawProgramCode || '').trim();
  if (!trimmed) return null;

  const { data: directMatch } = await supabase
    .from('pilot_programs')
    .select('program_code')
    .eq('program_code', trimmed)
    .eq('pilot_status', 'active')
    .maybeSingle();

  if (directMatch?.program_code) {
    return String(directMatch.program_code);
  }

  const { data: accessMatch } = await supabase
    .from('pilot_programs')
    .select('program_code')
    .or(`family_access_code.eq.${trimmed},facilitator_access_code.eq.${trimmed}`)
    .eq('pilot_status', 'active')
    .limit(1)
    .maybeSingle();

  if (accessMatch?.program_code) {
    return String(accessMatch.program_code);
  }

  return trimmed;
}

async function logPinVerificationFailure(supabase, programCode, pin) {
  const fingerprint = buildPinFingerprint(programCode, pin);

  const { data: programRows } = await supabase
    .from('pilot_programs')
    .select('program_code')
    .eq('program_code', programCode)
    .eq('pilot_status', 'active')
    .limit(1);

  if (!programRows?.length) {
    console.warn('[VERIFY_STUDENT_PIN]', { reason: 'no_program_match', program_code: programCode });
    return;
  }

  const { data: fingerprintRows } = await supabase
    .from('participants')
    .select('id, student_pin_hash, student_pin_enabled, student_pin_fingerprint')
    .eq('program_code', programCode)
    .eq('role', 'student')
    .eq('student_pin_fingerprint', fingerprint)
    .limit(5);

  if (!fingerprintRows?.length) {
    const { count } = await supabase
      .from('participants')
      .select('id', { count: 'exact', head: true })
      .eq('program_code', programCode)
      .eq('role', 'student');

    console.warn('[VERIFY_STUDENT_PIN]', {
      reason: 'no_participant_match',
      program_code: programCode,
      student_count: count ?? 0,
    });
    return;
  }

  const row = fingerprintRows[0];
  if (!row.student_pin_hash || !row.student_pin_fingerprint) {
    console.warn('[VERIFY_STUDENT_PIN]', {
      reason: 'missing_pin_hash_or_fingerprint',
      program_code: programCode,
      participant_id: row.id,
    });
    return;
  }

  if (row.student_pin_enabled === false) {
    console.warn('[VERIFY_STUDENT_PIN]', {
      reason: 'pin_disabled',
      program_code: programCode,
      participant_id: row.id,
    });
    return;
  }

  const hashOk = verifyStudentPinHash(programCode, pin, row.student_pin_hash);
  if (!hashOk) {
    console.warn('[VERIFY_STUDENT_PIN]', {
      reason: 'pin_hash_mismatch',
      program_code: programCode,
      participant_id: row.id,
    });
    return;
  }

  console.warn('[VERIFY_STUDENT_PIN]', {
    reason: 'no_participant_match',
    program_code: programCode,
    participant_id: row.id,
  });
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

  const rawProgramCode = String(body.programCode || '').trim();
  const pin = String(body.pin || '').trim();
  const firstNameHint = String(body.firstNameHint || '').trim().toLowerCase();

  if (!rawProgramCode || !pin) {
    return jsonResponse({ error: 'Program code and PIN are required.' }, 400);
  }

  const lockKey = clientKey(event, rawProgramCode);
  const lockout = checkLockout(lockKey);
  if (lockout.locked) {
    return jsonResponse({ error: 'Too many attempts. Try again later.' }, 429);
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return jsonResponse({ error: 'Service unavailable.' }, 503);
  }

  const programCode = await resolveProgramCode(supabase, rawProgramCode);
  if (!programCode) {
    console.warn('[VERIFY_STUDENT_PIN]', { reason: 'no_program_match', program_code: rawProgramCode });
    recordFailure(lockKey);
    return jsonResponse({ error: 'Program code or PIN did not match.' }, 401);
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
    await logPinVerificationFailure(supabase, programCode, pin);
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
    String(match.nickname || '').trim() || String(match.first_name || '').trim() || 'Student';

  return jsonResponse({
    success: true,
    participantId: match.id,
    displayName,
    programCode: match.program_code,
  });
};
