const { getServiceSupabase } = require('./_lib/pushSender');
const { generateStudentPin, hashStudentPin } = require('./_lib/studentPinCrypto');

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
    const { error } = await supabase
      .from('participants')
      .update({
        student_pin_hash: hash,
        student_pin_fingerprint: fingerprint,
        student_pin_enabled: true,
        student_pin_last_rotated_at: now,
      })
      .eq('id', participantId)
      .eq('program_code', programCode);

    if (!error) {
      return { pin };
    }

    if (!/duplicate|unique|23505/i.test(error.message)) {
      return { error: error.message };
    }
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

  if (!UUID_RE.test(participantId) || !programCode) {
    return jsonResponse({ error: 'Missing participant or program.' }, 400);
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return jsonResponse({ error: 'Service unavailable.' }, 503);
  }

  const { data: participant, error: lookupError } = await supabase
    .from('participants')
    .select('id, program_code, role')
    .eq('id', participantId)
    .eq('program_code', programCode)
    .eq('role', 'student')
    .maybeSingle();

  if (lookupError || !participant) {
    return jsonResponse({ error: 'Student not found.' }, 404);
  }

  const result = await assignUniquePin(supabase, programCode, participantId);
  if (result.error) {
    return jsonResponse({ error: result.error }, 500);
  }

  return jsonResponse({
    success: true,
    participantId,
    programCode,
    pin: result.pin,
  });
};
