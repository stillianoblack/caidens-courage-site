const { getServiceSupabase } = require('./_lib/pushSender');

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

  if (!UUID_RE.test(participantId) || !programCode) {
    return jsonResponse({ error: 'Missing participant or program.' }, 400);
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return jsonResponse({ error: 'Service unavailable.' }, 503);
  }

  const { data, error } = await supabase
    .from('participants')
    .select('id, student_pin_reveal_value, student_pin_hash, student_pin_enabled')
    .eq('id', participantId)
    .eq('program_code', programCode)
    .eq('role', 'student')
    .maybeSingle();

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
        error:
          'This PIN was created before reveal support. Reset PIN once, then reveal/copy will work without future resets.',
      },
      409,
    );
  }

  return jsonResponse({
    success: true,
    participantId,
    programCode,
    pin,
  });
};
