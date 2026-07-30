function safeText(value, max = 160) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

const CAMP_SESSION_SOURCES = new Set(['facilitator_roster_launch']);

async function authorizeCampProgram(event, supabase) {
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
  participantDirectoryForCamp,
  participantForCamp,
  safeText,
  sessionForCamp,
};
