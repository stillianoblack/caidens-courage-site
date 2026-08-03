const crypto = require('crypto');

function safeText(value, max = 160) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

const { generateFamilyClaimCode, generateStudentPin, hashStudentPin } = require('./studentPinCrypto');
const { validateClientRuntime } = require('./supabaseRuntime');

const GRADE_BANDS = {
  kindergarten: 'k-2', '1': 'k-2', '2': 'k-2',
  '3': '3-5', '4': '3-5', '5': '3-5',
  '6': '6-8', '7': '6-8', '8': '6-8',
};

function reportSafeIdentifier(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex').slice(0, 12);
}

function logCreateParticipantStage(context, stage, status, errorCategory) {
  console.info('[CREATE_PARTICIPANT_TRANSACTION]', {
    correlationId: context.correlationId,
    participantRef: context.participantId ? reportSafeIdentifier(context.participantId) : null,
    programRef: reportSafeIdentifier(context.programCode),
    operationStage: stage,
    status,
    ...(errorCategory ? { errorCategory } : {}),
  });
}

function normalizeParticipantPinStatus(row) {
  if (row.student_pin_enabled === false) return 'disabled';
  return row.student_pin_enabled === true && Boolean(
    row.student_pin_hash || row.student_pin_fingerprint || row.student_pin_reveal_value,
  ) ? 'ready' : 'missing';
}

async function createParticipantForCamp(supabase, programCode, input, context = {}) {
  const logContext = { correlationId: context.correlationId || null, programCode, participantId: null };
  const firstName = safeText(input.childFirstName, 80);
  const lastName = safeText(input.childLastName, 80) || null;
  const nickname = safeText(input.childNickname, 80) || firstName;
  const gradeLevel = safeText(input.gradeLevel, 20).toLowerCase();
  const parentEmail = safeText(input.parentEmail, 200).toLowerCase() || null;
  const parentFirstName = safeText(input.parentFirstName, 80) || null;
  const parentLastName = safeText(input.parentLastName, 80) || null;
  const parentPhone = safeText(input.parentPhone, 40) || null;
  if (!firstName || (!lastName && !safeText(input.childNickname, 80)) || !GRADE_BANDS[gradeLevel]) {
    logCreateParticipantStage(logContext, 'create_participant_failed', 'failed', 'validation_error');
    return { status: 400, code: 'validation_error' };
  }
  if (parentEmail && (!parentFirstName || !parentLastName)) {
    logCreateParticipantStage(logContext, 'create_participant_failed', 'failed', 'parent_validation_error');
    return { status: 400, code: 'parent_validation_error' };
  }

  let duplicateQuery = supabase
    .from('participants')
    .select('id')
    .eq('program_code', programCode)
    .eq('role', 'student')
    .ilike('nickname', nickname);
  if (lastName) duplicateQuery = duplicateQuery.ilike('last_name', lastName);
  const { data: duplicates, error: duplicateError } = await duplicateQuery.limit(1);
  if (duplicateError) {
    logCreateParticipantStage(logContext, 'create_participant_failed', 'failed', 'duplicate_check_failed');
    return { status: 503, code: 'participant_duplicate_check_failed' };
  }
  if (duplicates?.length) {
    logCreateParticipantStage(logContext, 'create_participant_failed', 'failed', 'participant_already_exists');
    return { status: 409, code: 'participant_already_exists' };
  }

  const pin = generateStudentPin();
  const { hash, fingerprint } = hashStudentPin(programCode, pin);
  const claimCode = generateFamilyClaimCode();
  const now = new Date().toISOString();
  const participantPayload = {
    role: 'student',
    nickname,
    first_name: firstName,
    last_name: lastName,
    program_code: programCode,
    group_name: null,
    grade_level: gradeLevel,
    grade_band: GRADE_BANDS[gradeLevel],
    student_pin_hash: hash,
    student_pin_fingerprint: fingerprint,
    student_pin_reveal_value: pin,
    student_pin_enabled: true,
    student_pin_last_rotated_at: now,
    family_claim_code: claimCode,
    family_claim_code_created_at: now,
    parent_connection_status: parentEmail ? 'invited' : 'unclaimed',
    guardian_email: parentEmail,
    guardian_phone: parentPhone,
  };
  const { data: participant, error: participantError } = await supabase
    .from('participants')
    .insert(participantPayload)
    .select('id')
    .single();
  if (participantError || !participant?.id) {
    logCreateParticipantStage(logContext, 'create_participant_failed', 'failed', 'participant_insert_failed');
    return { status: 503, code: 'participant_create_failed' };
  }
  logContext.participantId = participant.id;
  logCreateParticipantStage(logContext, 'participant_insert_succeeded', 'succeeded');

  const { data: link, error: linkError } = await supabase
    .from('student_family_links')
    .insert({
      student_id: participant.id,
      camp_program_code: programCode,
      family_program_code: null,
      parent_first_name: parentFirstName,
      parent_last_name: parentLastName,
      parent_email: parentEmail,
      parent_phone: parentPhone,
      relationship: 'parent',
      parent_claimed: false,
    })
    .select('id')
    .single();
  if (linkError || !link?.id) {
    const { error: rollbackError } = await supabase
      .from('participants')
      .delete()
      .eq('id', participant.id)
      .eq('program_code', programCode);
    logCreateParticipantStage(
      logContext,
      rollbackError ? 'create_participant_failed' : 'create_participant_compensated',
      rollbackError ? 'failed' : 'compensated',
      rollbackError ? 'participant_compensation_failed' : 'family_link_insert_failed',
    );
    return {
      status: 503,
      code: rollbackError ? 'participant_create_rollback_failed' : 'family_link_create_failed',
    };
  }
  logCreateParticipantStage(logContext, 'family_link_insert_succeeded', 'succeeded');
  logCreateParticipantStage(logContext, 'create_participant_committed', 'committed');

  return {
    participantId: participant.id,
    linkId: link.id,
    displayName: nickname,
    studentPin: pin,
    familyClaimCode: claimCode,
    parentConnectionStatus: parentEmail ? 'invited' : 'unclaimed',
  };
}

const CAMP_SESSION_SOURCES = new Set(['facilitator_roster_launch']);

async function authorizeCampProgram(event, supabase) {
  if (!validateClientRuntime(event)) return { status: 503, code: 'runtime_context_mismatch' };
  const programId = safeText(event.headers?.['x-camp-program-id'], 80);
  const programCode = safeText(event.headers?.['x-camp-program-code'], 120);
  const accessCode = safeText(event.headers?.['x-camp-access-code'], 160);
  if (!programId || !programCode || !accessCode) {
    return { status: 401, code: 'missing_camp_session' };
  }

  const { data, error } = await supabase
    .from('pilot_programs')
    .select('id, program_code, program_name, program_type, group_name')
    .eq('id', programId)
    .eq('program_code', programCode)
    .eq('facilitator_access_code', accessCode)
    .neq('pilot_status', 'archived')
    .maybeSingle();
  if (error) return { status: 503, code: 'camp_program_lookup_failed' };
  if (!data || data.program_type === 'independent_family') {
    return { status: 403, code: 'invalid_camp_session' };
  }
  return { program: data };
}

async function participantForCamp(supabase, participantId, programCode) {
  const { data, error } = await supabase
    .from('participants')
    .select('id, role, program_code, first_name, nickname, grade_level')
    .eq('id', participantId)
    .maybeSingle();
  if (error) return { status: 503, code: 'camp_participant_lookup_failed' };
  if (!data || data.role !== 'student' || data.program_code !== programCode) {
    return { status: 403, code: 'camp_participant_mismatch' };
  }
  return { participant: data };
}

async function participantDirectoryForCamp(supabase, programCode) {
  const selects = [
    'id, nickname, first_name, last_name, role, program_code, created_at, grade_level, grade_band, allow_stretch_level, b4_variant_key, b4_variant_selected_at, student_pin_enabled, student_pin_hash, student_pin_fingerprint, student_pin_reveal_value',
    'id, nickname, first_name, last_name, role, program_code, created_at, grade_level, grade_band, allow_stretch_level, student_pin_enabled, student_pin_hash, student_pin_fingerprint, student_pin_reveal_value',
    'id, nickname, first_name, last_name, role, program_code, created_at, student_pin_enabled, student_pin_hash, student_pin_fingerprint, student_pin_reveal_value',
    'id, nickname, first_name, role, program_code, created_at, student_pin_enabled, student_pin_hash, student_pin_fingerprint, student_pin_reveal_value',
    'id, nickname, first_name, last_name, role, program_code, created_at, grade_level, grade_band, allow_stretch_level, b4_variant_key, b4_variant_selected_at',
    'id, nickname, first_name, last_name, role, program_code, created_at, grade_level, grade_band, allow_stretch_level',
    'id, nickname, first_name, last_name, role, program_code, created_at',
    'id, nickname, first_name, role, program_code, created_at',
  ];
  let data = null;
  let lastError = null;
  for (const select of selects) {
    const result = await supabase
      .from('participants')
      .select(select)
      .eq('program_code', programCode)
      .eq('role', 'student')
      .order('created_at', { ascending: true });
    if (!result.error) {
      data = result.data;
      lastError = null;
      break;
    }
    lastError = result.error;
    if (!/column|schema cache|42703/i.test(`${result.error.code || ''} ${result.error.message || ''}`)) {
      break;
    }
  }
  if (lastError) {
    console.error('[CAMP_PARTICIPANT_DIRECTORY]', {
      result: 'failed',
      code: lastError.code || null,
      message: safeText(lastError.message, 240) || 'unknown_query_error',
    });
    return { status: 503, code: 'camp_participant_directory_failed' };
  }
  return {
    participants: (data || []).map((row) => ({
      id: row.id,
      nickname: safeText(row.nickname, 80) || null,
      first_name: safeText(row.first_name, 80) || null,
      last_name: safeText(row.last_name, 80) || null,
      role: 'student',
      program_code: row.program_code,
      created_at: row.created_at,
      grade_level: safeText(row.grade_level, 20) || null,
      grade_band: safeText(row.grade_band, 20) || null,
      allow_stretch_level: typeof row.allow_stretch_level === 'boolean'
        ? row.allow_stretch_level
        : null,
      b4_variant_key: safeText(row.b4_variant_key, 20) || null,
      b4_variant_selected_at: row.b4_variant_selected_at || null,
      pin_status: normalizeParticipantPinStatus(row),
    })),
  };
}

async function sessionForCamp(supabase, sessionId, program) {
  const { data, error } = await supabase
    .from('kid_play_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('organization_id', program.id)
    .maybeSingle();
  if (error) return { status: 503, code: 'camp_session_lookup_failed' };
  if (!data || !CAMP_SESSION_SOURCES.has(data.session_source)) {
    return { status: 403, code: 'camp_kid_session_mismatch' };
  }
  const participantId = data.participant_id || data.child_id;
  if (!participantId || data.child_id !== participantId) {
    return { status: 403, code: 'camp_kid_session_mismatch' };
  }
  const participant = await participantForCamp(supabase, participantId, program.program_code);
  if (!participant.participant) return participant;
  return { session: data, participant: participant.participant };
}

module.exports = {
  CAMP_SESSION_SOURCES,
  authorizeCampProgram,
  createParticipantForCamp,
  participantDirectoryForCamp,
  participantForCamp,
  normalizeParticipantPinStatus,
  safeText,
  sessionForCamp,
};
