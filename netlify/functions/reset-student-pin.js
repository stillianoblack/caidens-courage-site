const { getServiceSupabase } = require('./_lib/pushSender');
const { generateStudentPin, hashStudentPin } = require('./_lib/studentPinCrypto');
const { persistStudentPinUpdate } = require('./_lib/studentPinPersistence');

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function jsonResponse(body, status = 200) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

async function assignUniquePin(supabase, programCode, participantId, maxAttempts = 25) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const pin = generateStudentPin(4);
    const { hash, fingerprint } = hashStudentPin(programCode, pin);

    const { data: conflict } = await supabase
      .from('participants')
      .select('id')
      .eq('program_code', programCode)
      .eq('student_pin_fingerprint', fingerprint)
      .neq('id', participantId)
      .maybeSingle();

    if (conflict?.id) continue;

    const now = new Date().toISOString();
    const persisted = await persistStudentPinUpdate(
      supabase,
      programCode,
      participantId,
      pin,
      hash,
      fingerprint,
      now,
    );

    if (!persisted.ok) {
      if (!/duplicate|unique|23505/i.test(persisted.error || '')) {
        return { error: persisted.error };
      }
      continue;
    }

    return { pin, revealStored: persisted.revealStored };
  }

  return { error: 'Could not assign a unique PIN.' };
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

  const participantId = String(body.participantId || '').trim();
  const programCode = String(body.programCode || '').trim();
  const parentEmail = String(body.parentEmail || '').trim().toLowerCase();
  const actorRole = String(body.actorRole || 'facilitator').trim();

  if (!UUID_RE.test(participantId) || !programCode) {
    return jsonResponse({ error: 'Missing participant or program.' }, 400);
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return jsonResponse({ error: 'Service unavailable.' }, 503);
  }

  const { data: participant, error: lookupError } = await supabase
    .from('participants')
    .select('id, program_code, role, guardian_email')
    .eq('id', participantId)
    .eq('program_code', programCode)
    .eq('role', 'student')
    .maybeSingle();

  if (lookupError || !participant) {
    return jsonResponse({ error: 'Student not found.' }, 404);
  }

  if (actorRole === 'parent') {
    if (!parentEmail) {
      return jsonResponse({ error: 'Parent email is required.' }, 403);
    }

    const guardianEmail = String(participant.guardian_email || '').trim().toLowerCase();
    let authorized = guardianEmail && guardianEmail === parentEmail;

    if (!authorized) {
      const { data: links } = await supabase
        .from('student_family_links')
        .select('id, parent_email, parent_claimed')
        .eq('student_id', participantId)
        .limit(20);

      authorized = (links || []).some(
        (link) => String(link.parent_email || '').trim().toLowerCase() === parentEmail,
      );
    }

    if (!authorized) {
      return jsonResponse({ error: 'You do not have access to reset this student PIN.' }, 403);
    }
  }

  const result = await assignUniquePin(supabase, programCode, participantId);
  if (result.error) {
    return jsonResponse({ error: result.error }, 500);
  }

  console.info('[SECURITY_AUDIT]', {
    event: 'pin_reset',
    participantId,
    programCode,
  });

  return jsonResponse({
    success: true,
    participantId,
    programCode,
    pin: result.pin,
  });
};
