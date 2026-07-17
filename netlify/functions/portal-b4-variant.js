const { correlationId, getServerSupabase, json } = require('./_lib/crmAuth');
const {
  authorizeFamilyCompatibilitySession,
  participantBelongsToFamily,
} = require('./_lib/familyCompatibilityAuth');

const ALLOWED_VARIANTS = new Set(['courage', 'pattern', 'shield', 'anchor', 'fusion']);

function normalizeVariant(value) {
  if (value === 'spark') return 'courage';
  return ALLOWED_VARIANTS.has(value) ? value : null;
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
  const familySession = await authorizeFamilyCompatibilitySession(event, supabase);
  if (familySession.program) {
    const { data: participant, error } = await supabase
      .from('participants')
      .select('id, role, program_code')
      .eq('id', participantId)
      .maybeSingle();
    authorized = !error && participantBelongsToFamily(participant, familySession.program.program_code);
  }
  if (!authorized) {
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
    return json(200, {
      participantId: data.id,
      variant: normalized,
      selectionRequired: !normalized || !data.b4_variant_selected_at,
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
  return json(200, {
    participantId: data.id,
    variant: data.b4_variant_key,
    selectionRequired: false,
    selectedAt: data.b4_variant_selected_at,
    updatedAt: data.updated_at,
  }, context.correlationId);
};

exports._test = { ALLOWED_VARIANTS, normalizeVariant };
