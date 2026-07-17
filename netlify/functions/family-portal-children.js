const crypto = require('crypto');
const { correlationId, getServerSupabase, json } = require('./_lib/crmAuth');
const {
  authorizeFamilyCompatibilitySession,
  safeText: text,
} = require('./_lib/familyCompatibilityAuth');

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function suffix(value) {
  const normalized = text(value);
  return normalized ? `…${normalized.slice(-6)}` : null;
}

function normalizeGradeLevel(value) {
  const normalized = text(value, 24).toLowerCase();
  if (normalized === 'k' || normalized === 'kindergarten') return 'kindergarten';
  const match = normalized.match(/^([1-8])(?:st|nd|rd|th)?(?:\s*grade)?$/);
  return match ? match[1] : null;
}

async function readChildren(supabase, program) {
  const participantsResult = await supabase
    .from('participants')
    .select('id, nickname, first_name, role, program_code, created_at, child_age_range, grade_level, grade_band, allow_stretch_level, b4_variant_key, b4_variant_selected_at, updated_at')
    .eq('program_code', program.program_code)
    .eq('role', 'student')
    .order('created_at', { ascending: true });
  if (participantsResult.error) return { error: participantsResult.error };

  const participantIds = (participantsResult.data || []).map((row) => row.id);
  const linksResult = participantIds.length
    ? await supabase
      .from('student_family_links')
      .select('*')
      .eq('family_program_code', program.program_code)
      .in('student_id', participantIds)
      .order('created_at', { ascending: true })
    : { data: [], error: null };
  if (linksResult.error) return { error: linksResult.error };
  return { participants: participantsResult.data || [], links: linksResult.data || [] };
}

exports.handler = async (event) => {
  const id = correlationId(event);
  if (!['GET', 'POST', 'PATCH'].includes(event.httpMethod)) {
    return json(405, { success: false, code: 'method_not_allowed' }, id);
  }
  const supabase = getServerSupabase();
  if (!supabase) return json(503, { success: false, code: 'configuration_error' }, id);

  const auth = await authorizeFamilyCompatibilitySession(event, supabase);
  if (!auth.program) {
    console.warn('[FAMILY_PORTAL_CHILDREN]', { correlationId: id, action: event.httpMethod, result: auth.code });
    return json(auth.status, { success: false, code: auth.code }, id);
  }
  const program = auth.program;

  if (event.httpMethod === 'GET') {
    const result = await readChildren(supabase, program);
    if (result.error) return json(503, { success: false, code: 'children_lookup_failed' }, id);
    console.info('[FAMILY_PORTAL_CHILDREN]', {
      correlationId: id,
      action: 'read',
      sessionType: 'legacy_access_code',
      programId: suffix(program.id),
      participantCount: result.participants.length,
    });
    return json(200, {
      success: true,
      sessionType: 'legacy_access_code',
      ownershipMode: 'server_validated_compatibility',
      programIdSuffix: suffix(program.id),
      participants: result.participants,
      links: result.links,
    }, id);
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch {
    return json(400, { success: false, code: 'invalid_json' }, id);
  }

  if (event.httpMethod === 'PATCH') {
    const participantId = text(body.participantId, 80);
    const gradeLevel = normalizeGradeLevel(body.gradeLevel);
    const allowStretchLevel = body.allowStretchLevel === true;
    if (!UUID.test(participantId) || !gradeLevel) {
      return json(400, { success: false, code: 'validation_error' }, id);
    }
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('id, role, program_code')
      .eq('id', participantId)
      .maybeSingle();
    if (participantError) return json(503, { success: false, code: 'participant_lookup_failed' }, id);
    if (!participant || participant.role !== 'student' || participant.program_code !== program.program_code) {
      return json(403, { success: false, code: 'participant_access_denied' }, id);
    }
    const { data: updated, error: updateError } = await supabase
      .from('participants')
      // grade_level is the canonical source of truth. Preserve the legacy
      // grade_band value until its database constraint is migrated separately.
      .update({ grade_level: gradeLevel, allow_stretch_level: allowStretchLevel })
      .eq('id', participantId)
      .select('id, grade_level, grade_band, allow_stretch_level')
      .maybeSingle();
    if (updateError || !updated) {
      console.warn('[FAMILY_PORTAL_CHILDREN]', {
        correlationId: id,
        action: 'update_grade',
        result: 'failed',
        participantId: suffix(participantId),
        databaseCode: updateError?.code || null,
      });
      return json(503, { success: false, code: 'grade_update_failed' }, id);
    }
    console.info('[FAMILY_PORTAL_CHILDREN]', {
      correlationId: id,
      action: 'update_grade',
      result: 'success',
      participantId: suffix(participantId),
    });
    return json(200, { success: true, participant: updated }, id);
  }

  const firstName = text(body.firstName, 80);
  const nickname = text(body.nickname, 80);
  const ageGrade = text(body.ageGrade, 40);
  const requestKey = text(event.headers?.['x-idempotency-key'], 160) || crypto.randomUUID();
  if (!firstName || !/^[a-zA-Z0-9._:-]{8,160}$/.test(requestKey)) {
    return json(400, { success: false, code: 'validation_error' }, id);
  }

  const { data, error } = await supabase.rpc('create_independent_family_child', {
    program_code_input: program.program_code,
    first_name_input: firstName,
    nickname_input: nickname,
    age_grade_input: ageGrade,
    grade_level_input: normalizeGradeLevel(ageGrade),
    idempotency_key_input: requestKey,
  });
  if (error) {
    console.warn('[FAMILY_PORTAL_CHILDREN]', {
      correlationId: id,
      action: 'create',
      result: 'database_error',
      databaseCode: error.code || 'unknown',
    });
    const missing = /create_independent_family_child|schema cache|does not exist/i.test(error.message || '');
    return json(missing ? 503 : 500, {
      success: false,
      code: missing ? 'missing_migration' : 'create_failed',
    }, id);
  }
  const result = Array.isArray(data) ? data[0] : data;
  if (!result?.participant?.id || !UUID.test(result.participant.id) || !result?.family_link?.id) {
    return json(500, { success: false, code: 'invalid_create_response' }, id);
  }
  console.info('[FAMILY_PORTAL_CHILDREN]', {
    correlationId: id,
    action: 'create',
    result: 'success',
    programId: suffix(program.id),
    participantId: suffix(result.participant.id),
    reused: Boolean(result.reused),
  });
  return json(200, {
    success: true,
    participant: result.participant,
    familyLink: result.family_link,
    reused: Boolean(result.reused),
  }, id);
};

exports._test = { normalizeGradeLevel };
