const crypto = require('crypto');
const {
  normalizeGradeLevel,
} = require('../../../src/shared/gradeContract');

function safeText(value, max = 160) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

const { generateFamilyClaimCode, generateStudentPin, hashStudentPin } = require('./studentPinCrypto');
const { validateClientRuntime } = require('./supabaseRuntime');
const { originIsSameHost, readFacilitatorSession } = require('./facilitatorSession');

function reportSafeIdentifier(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex').slice(0, 12);
}

function logCreateParticipantStage(context, stage, status, errorCategory, databaseError) {
  console.info('[CREATE_PARTICIPANT_TRANSACTION]', {
    correlationId: context.correlationId,
    participantRef: context.participantId ? reportSafeIdentifier(context.participantId) : null,
    programRef: reportSafeIdentifier(context.programCode),
    operationStage: stage,
    status,
    ...(errorCategory ? { errorCategory } : {}),
    ...(databaseError || {}),
  });
}

function safeDatabaseIdentifier(value) {
  const identifier = String(value || '').trim();
  return /^[a-z_][a-z0-9_]{0,62}$/i.test(identifier) ? identifier : null;
}

function sanitizeParticipantInsertError(error) {
  const databaseCode = /^[A-Z0-9]{3,10}$/i.test(String(error?.code || ''))
    ? String(error.code)
    : null;
  const message = String(error?.message || '');
  const relation = safeDatabaseIdentifier(
    error?.relation || message.match(/relation ["']([a-z_][a-z0-9_]*)["']/i)?.[1],
  );
  const constraint = safeDatabaseIdentifier(
    error?.constraint || message.match(/constraint ["']([a-z_][a-z0-9_]*)["']/i)?.[1],
  );
  let errorCategory = 'unknown_database_error';
  let sanitizedMessage = 'Participant insert failed.';
  if (databaseCode === '23514' && constraint === 'participants_grade_band_check') {
    errorCategory = 'grade_band_constraint_violation';
    sanitizedMessage = 'Participant grade storage was incompatible with the production schema.';
  } else if (databaseCode === '23505') {
    errorCategory = 'unique_constraint_violation';
    sanitizedMessage = 'Participant insert conflicted with an existing unique value.';
  } else if (databaseCode === '23503') {
    errorCategory = 'foreign_key_violation';
    sanitizedMessage = 'Participant insert referenced an unavailable related record.';
  } else if (databaseCode === '42501' || databaseCode === 'PGRST301') {
    errorCategory = 'permission_failure';
    sanitizedMessage = 'Participant insert was not authorized.';
  } else if (databaseCode?.startsWith('22')) {
    errorCategory = 'invalid_input';
    sanitizedMessage = 'Participant insert contained an invalid value.';
  }
  return {
    errorCategory,
    metadata: {
      databaseCode,
      relation,
      constraint,
      sanitizedMessage,
    },
  };
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
  const gradeLevel = normalizeGradeLevel(safeText(input.gradeLevel, 20));
  const parentEmail = safeText(input.parentEmail, 200).toLowerCase() || null;
  const parentFirstName = safeText(input.parentFirstName, 80) || null;
  const parentLastName = safeText(input.parentLastName, 80) || null;
  const parentPhone = safeText(input.parentPhone, 40) || null;
  if (!firstName || (!lastName && !safeText(input.childNickname, 80)) || !gradeLevel) {
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
    const sanitizedError = sanitizeParticipantInsertError(participantError);
    logCreateParticipantStage(
      logContext,
      'create_participant_failed',
      'failed',
      sanitizedError.errorCategory,
      sanitizedError.metadata,
    );
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
  if (event.httpMethod !== 'GET' && !originIsSameHost(event)) {
    return { status: 403, code: 'invalid_request_origin' };
  }
  const programId = safeText(event.headers?.['x-camp-program-id'], 80);
  const programCode = safeText(event.headers?.['x-camp-program-code'], 120);
  if (!programId || !programCode) {
    return { status: 401, code: 'missing_camp_session' };
  }
  const authenticated = await readFacilitatorSession(event, supabase);
  if (!authenticated.session) return authenticated;
  if (authenticated.program.id !== programId || authenticated.program.program_code !== programCode) {
    return { status: 403, code: 'invalid_camp_session' };
  }
  return { program: authenticated.program };
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

async function inviteParentForCamp(supabase, programCode, input) {
  const participantId = safeText(input.participantId, 80);
  const parentEmail = safeText(input.parentEmail, 320).toLowerCase();
  const parentFirstName = safeText(input.parentFirstName, 80) || null;
  const parentLastName = safeText(input.parentLastName, 80) || 'Family';
  if (!participantId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) {
    return { status: 400, code: 'validation_error' };
  }

  const { data: participant, error: participantError } = await supabase
    .from('participants')
    .select('id, role, program_code, first_name, nickname, family_claim_code')
    .eq('id', participantId)
    .maybeSingle();
  if (participantError) return { status: 503, code: 'camp_participant_lookup_failed' };
  if (!participant || participant.role !== 'student' || participant.program_code !== programCode) {
    return { status: 403, code: 'camp_participant_mismatch' };
  }

  const familyClaimCode = safeText(participant.family_claim_code, 120) || generateFamilyClaimCode();
  const participantUpdate = await supabase
    .from('participants')
    .update({
      parent_connection_status: 'invited',
      guardian_email: parentEmail,
      family_claim_code: familyClaimCode,
      family_claim_code_created_at: new Date().toISOString(),
    })
    .eq('id', participantId)
    .eq('program_code', programCode);
  if (participantUpdate.error) return { status: 503, code: 'parent_invite_participant_update_failed' };

  const existingLink = await supabase
    .from('student_family_links')
    .select('id')
    .eq('student_id', participantId)
    .eq('camp_program_code', programCode)
    .limit(1);
  if (existingLink.error) return { status: 503, code: 'parent_invite_link_lookup_failed' };

  const linkPayload = {
    parent_email: parentEmail,
    parent_first_name: parentFirstName,
    parent_last_name: parentLastName,
    family_program_code: null,
    relationship: 'parent',
    parent_claimed: false,
  };
  const linkResult = existingLink.data?.[0]?.id
    ? await supabase.from('student_family_links').update(linkPayload).eq('id', existingLink.data[0].id)
    : await supabase.from('student_family_links').insert({
        student_id: participantId,
        camp_program_code: programCode,
        family_program_code: null,
        parent_phone: null,
        ...linkPayload,
      });
  if (linkResult.error) return { status: 503, code: 'parent_invite_link_update_failed' };

  return {
    participantId,
    childName: safeText(participant.nickname, 80) || safeText(participant.first_name, 80) || 'Student',
    familyClaimCode,
    familyClaimUrl: `/portal?code=${encodeURIComponent(familyClaimCode)}&audience=parents&claim=1`,
    parentConnectionStatus: 'invited',
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
  inviteParentForCamp,
  participantDirectoryForCamp,
  participantForCamp,
  normalizeParticipantPinStatus,
  sanitizeParticipantInsertError,
  safeText,
  sessionForCamp,
};
