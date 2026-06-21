const { getServiceSupabase } = require('./_lib/pushSender');
const { isMissingRevealColumnError } = require('./_lib/studentPinPersistence');

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function jsonResponse(body, status = 200) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
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

  if (actorRole === 'parent') {
    if (!parentEmail) {
      return jsonResponse({ error: 'Parent email is required.' }, 403);
    }

    const { data: participantRow } = await supabase
      .from('participants')
      .select('id, guardian_email')
      .eq('id', participantId)
      .eq('program_code', programCode)
      .eq('role', 'student')
      .maybeSingle();

    if (!participantRow) {
      return jsonResponse({ error: 'Student not found.' }, 404);
    }

    const guardianEmail = String(participantRow.guardian_email || '').trim().toLowerCase();
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
      return jsonResponse({ error: 'You do not have access to this student PIN.' }, 403);
    }
  }

  let { data, error } = await supabase
    .from('participants')
    .select('id, student_pin_reveal_value, student_pin_hash, student_pin_enabled')
    .eq('id', participantId)
    .eq('program_code', programCode)
    .eq('role', 'student')
    .maybeSingle();

  if (error && isMissingRevealColumnError(error.message)) {
    const fallback = await supabase
      .from('participants')
      .select('id, student_pin_hash, student_pin_enabled')
      .eq('id', participantId)
      .eq('program_code', programCode)
      .eq('role', 'student')
      .maybeSingle();

    if (fallback.error || !fallback.data) {
      return jsonResponse({ error: 'Student not found.' }, 404);
    }

    if (fallback.data.student_pin_enabled === false || !fallback.data.student_pin_hash) {
      return jsonResponse({ error: 'This student does not have an active PIN.' }, 404);
    }

    return jsonResponse(
      {
        error: 'PIN needs refresh. Generate a new PIN to restore reveal and copy.',
        needsRefresh: true,
      },
      409,
    );
  }

  if (error || !data) {
    return jsonResponse({ error: 'Student not found.' }, 404);
  }

  if (data.student_pin_enabled === false || !data.student_pin_hash) {
    return jsonResponse({ error: 'This student does not have an active PIN.' }, 404);
  }

  const pin = String(data.student_pin_reveal_value || '').trim();
  if (!pin) {
    return jsonResponse(
      {
        error: 'PIN needs refresh. Ask your facilitator to reset this student\'s PIN.',
        needsRefresh: true,
      },
      409,
    );
  }

  console.info('[SECURITY_AUDIT]', {
    event: 'pin_revealed',
    participantId,
    programCode,
    actorRole,
  });

  return jsonResponse({
    success: true,
    participantId,
    programCode,
    pin,
  });
};
