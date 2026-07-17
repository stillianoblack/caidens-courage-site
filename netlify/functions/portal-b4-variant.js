const { correlationId, getServerSupabase, json } = require('./_lib/crmAuth');
const {
  authorizeFamilyCompatibilitySession,
  participantBelongsToFamily,
} = require('./_lib/familyCompatibilityAuth');
const {
  authorizeCampProgram,
  participantForCamp,
  sessionForCamp,
} = require('./_lib/campCompatibilityAuth');

const ALLOWED_VARIANTS = new Set(['courage', 'pattern', 'shield', 'anchor', 'fusion']);

function normalizeVariant(value) {
  if (value === 'spark') return 'courage';
  return ALLOWED_VARIANTS.has(value) ? value : null;
}

function maskId(value) {
  const text = String(value || '');
  return text.length > 6 ? `…${text.slice(-6)}` : '(missing)';
}

async function authorizeCampKidSession(event, supabase, participantId) {
  const sessionId = String(event.headers?.['x-kid-session-id'] || '').trim();
  if (!sessionId) return { authorized: false, code: 'missing_camp_session' };
  const programResult = await authorizeCampProgram(event, supabase);
  if (!programResult.program) return { authorized: false, code: programResult.code };
  const participantResult = await participantForCamp(
    supabase,
    participantId,
    programResult.program.program_code,
  );
  if (!participantResult.participant) return { authorized: false, code: participantResult.code };
  const sessionResult = await sessionForCamp(supabase, sessionId, programResult.program);
  if (
    !sessionResult.session ||
    sessionResult.session.status !== 'active' ||
    (sessionResult.session.participant_id || sessionResult.session.child_id) !== participantId
  ) return { authorized: false, code: sessionResult.code || 'camp_kid_session_mismatch' };
  return { authorized: true, code: 'camp_facilitator_session' };
}

exports.handler = async (event) => {
  if (!['GET', 'PUT'].includes(event.httpMethod)) {
    return { statusCode: 405, headers: { Allow: 'GET, PUT' }, body: '' };
  }
  const id = correlationId(event);
  const supabase = getServerSupabase();
  if (!supabase) return json(503, { error: 'Portal authorization is not configured.' }, id);
  const params = new URLSearchParams(event.rawQuery || '');
  const participantId = params.get('participantId')?.trim();
  if (!participantId) return json(400, { error: 'participantId is required.' }, id);

  let authorized = false;
  let authorizationMode = null;
  const familySession = await authorizeFamilyCompatibilitySession(event, supabase);
  if (familySession.program) {
    const { data: participant, error } = await supabase
      .from('participants')
      .select('id, role, program_code')
      .eq('id', participantId)
      .maybeSingle();
    authorized = !error && participantBelongsToFamily(participant, familySession.program.program_code);
    if (authorized) authorizationMode = 'family_compatibility';
  }
  if (!authorized) {
    const campSession = await authorizeCampKidSession(event, supabase, participantId);
    authorized = campSession.authorized;
    if (authorized) authorizationMode = campSession.code;
  }
  if (!authorized) {
    console.warn('[PORTAL_B4_VARIANT]', {
      correlationId: id,
      method: event.httpMethod,
      result: 'access_denied',
      participantId: maskId(participantId),
    });
    return json(403, { error: 'Participant access denied.' }, id);
  }

  const context = { correlationId: id, supabase };

  if (event.httpMethod === 'GET') {
    const { data, error } = await context.supabase
      .from('participants')
      .select('id, b4_variant_key, b4_variant_selected_at, updated_at')
      .eq('id', participantId)
      .maybeSingle();
    if (error) return json(503, { error: 'B-4 preference is unavailable.' }, context.correlationId);
    if (!data) return json(404, { error: 'Participant not found.' }, context.correlationId);
    const normalized = normalizeVariant(data.b4_variant_key);
    const state = normalized && data.b4_variant_selected_at ? 'saved' : 'onboarding_required';
    console.info('[PORTAL_B4_VARIANT]', {
      correlationId: id,
      method: 'GET',
      result: state,
      authorizationMode,
      participantId: maskId(participantId),
    });
    return json(200, {
      state,
      participantId: data.id,
      variant: normalized,
      selectionRequired: state === 'onboarding_required',
      selectedAt: data.b4_variant_selected_at,
      updatedAt: data.updated_at,
    }, context.correlationId);
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Invalid JSON body.' }, context.correlationId); }
  const variant = normalizeVariant(body.variant);
  if (!variant) return json(400, { error: 'Invalid B-4 variant.' }, context.correlationId);

  const updatedAt = new Date().toISOString();
  const { data, error } = await context.supabase
    .from('participants')
    .update({ b4_variant_key: variant, b4_variant_selected_at: updatedAt, updated_at: updatedAt })
    .eq('id', participantId)
    .select('id, b4_variant_key, b4_variant_selected_at, updated_at')
    .maybeSingle();
  if (error) return json(503, { error: 'B-4 preference could not be saved.' }, context.correlationId);
  if (!data) return json(404, { error: 'Participant not found.' }, context.correlationId);
  console.info('[PORTAL_B4_VARIANT]', {
    correlationId: id,
    method: 'PUT',
    result: 'saved',
    authorizationMode,
    participantId: maskId(participantId),
  });
  return json(200, {
    state: 'saved',
    participantId: data.id,
    variant: data.b4_variant_key,
    selectionRequired: false,
    selectedAt: data.b4_variant_selected_at,
    updatedAt: data.updated_at,
  }, context.correlationId);
};

exports._test = {
  ALLOWED_VARIANTS,
  authorizeCampKidSession,
  normalizeVariant,
};
