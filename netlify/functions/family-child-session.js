const { correlationId, getServerSupabase, json } = require('./_lib/crmAuth');
const {
  authorizeFamilyCompatibilitySession,
  participantBelongsToFamily,
  safeText,
} = require('./_lib/familyCompatibilityAuth');

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_END_REASONS = new Set(['idle_timeout', 'user_exit', 'signed_out']);
const ALLOWED_GRADE_LEVELS = new Set(['kindergarten', '1', '2', '3', '4', '5', '6', '7', '8']);
const REQUIRED_BASELINE_MODULES = new Set(['feelings', 'reading', 'focus-moves']);

function suffix(value) {
  const normalized = safeText(value, 80);
  return normalized ? `…${normalized.slice(-6)}` : null;
}

function publicSession(row, participant) {
  const displayName = safeText(
    participant?.nickname || participant?.first_name,
    80,
  ) || 'Player';
  return {
    id: row.id,
    child_id: row.child_id,
    participant_id: row.participant_id,
    organization_id: row.organization_id,
    launched_by_user_id: null,
    session_source: row.session_source,
    device_mode: row.device_mode,
    status: row.status,
    started_at: row.started_at,
    last_activity_at: row.last_activity_at,
    ended_at: row.ended_at,
    ended_reason: row.ended_reason,
    device_label: row.device_label,
    resume_payload: {
      ...(row.resume_payload || {}),
      participant_display_name: displayName,
      participant_first_name: safeText(participant?.first_name, 80) || displayName,
      ...(participant?.grade_level
        ? { participant_grade_level: participant.grade_level }
        : {}),
    },
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function participantForFamily(supabase, participantId, programCode) {
  const { data, error } = await supabase
    .from('participants')
    .select('id, role, program_code, first_name, nickname, grade_level, student_pin_enabled, student_pin_hash, student_pin_fingerprint')
    .eq('id', participantId)
    .maybeSingle();
  if (error) return { error: 'participant_lookup_failed' };
  if (!participantBelongsToFamily(data, programCode)) return { denied: true };
  return { participant: data };
}

async function sessionForFamily(supabase, sessionId, program) {
  const { data, error } = await supabase
    .from('kid_play_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('organization_id', program.id)
    .eq('session_source', 'family_home')
    .maybeSingle();
  if (error) return { error: 'session_lookup_failed' };
  if (!data) return { denied: true };
  const participant = await participantForFamily(
    supabase,
    data.participant_id || data.child_id,
    program.program_code,
  );
  if (!participant.participant) return participant;
  return { session: data, participant: participant.participant };
}

async function recordLaunchAudit(supabase, id, participantId, reused) {
  const { error } = await supabase.from('admin_audit_events').insert({
    actor_auth_user_id: null,
    actor_role: 'family_compatibility',
    action: 'family_child_session_launched',
    target_type: 'participant',
    target_id: participantId,
    organization_id: null,
    request_correlation_id: id,
    reason: null,
    metadata: { session_type: 'legacy_access_code', reused: Boolean(reused) },
  });
  return !error;
}

async function launchSession(supabase, program, participantId, id) {
  const participantResult = await participantForFamily(
    supabase,
    participantId,
    program.program_code,
  );
  if (participantResult.error) return { status: 503, code: participantResult.error };
  if (!participantResult.participant) return { status: 403, code: 'participant_access_denied' };

  // Resolve PIN/access state on the server without returning hashes, fingerprints, or reveal values.
  const pinResolved = Boolean(
    participantResult.participant.student_pin_enabled !== false &&
    participantResult.participant.student_pin_hash &&
    participantResult.participant.student_pin_fingerprint,
  );

  const { data: activeRows, error: activeError } = await supabase
    .from('kid_play_sessions')
    .select('*')
    .eq('organization_id', program.id)
    .eq('session_source', 'family_home')
    .eq('status', 'active')
    .order('last_activity_at', { ascending: false });
  if (activeError) return { status: 503, code: 'session_lookup_failed' };

  const reusable = (activeRows || []).find(
    (row) => (row.participant_id || row.child_id) === participantId,
  );
  const supersededIds = (activeRows || [])
    .filter((row) => !reusable || row.id !== reusable.id)
    .map((row) => row.id);
  const timestamp = new Date().toISOString();
  const displayName = safeText(
    participantResult.participant.nickname || participantResult.participant.first_name,
    80,
  ) || 'Player';
  const sessionIdentity = {
    participant_display_name: displayName,
    participant_first_name: safeText(participantResult.participant.first_name, 80) || displayName,
  };

  if (supersededIds.length) {
    const { error } = await supabase
      .from('kid_play_sessions')
      .update({
        status: 'ended',
        ended_at: timestamp,
        ended_reason: 'superseded_by_family_child_switch',
        updated_at: timestamp,
      })
      .in('id', supersededIds)
      .eq('status', 'active');
    if (error) return { status: 503, code: 'session_switch_failed' };
  }

  let session = reusable;
  if (session) {
    const { data, error } = await supabase
      .from('kid_play_sessions')
      .update({
        last_activity_at: timestamp,
        updated_at: timestamp,
        resume_payload: { ...(session.resume_payload || {}), ...sessionIdentity },
      })
      .eq('id', session.id)
      .eq('status', 'active')
      .select('*')
      .maybeSingle();
    if (error || !data) return { status: 503, code: 'session_resume_failed' };
    session = data;
  } else {
    const { data, error } = await supabase
      .from('kid_play_sessions')
      .insert({
        child_id: participantId,
        participant_id: participantId,
        organization_id: program.id,
        launched_by_user_id: null,
        session_source: 'family_home',
        device_mode: 'home_device',
        status: 'active',
        started_at: timestamp,
        last_activity_at: timestamp,
        resume_payload: sessionIdentity,
        updated_at: timestamp,
      })
      .select('*')
      .single();
    if (error || !data) return { status: 503, code: 'session_create_failed' };
    session = data;
  }

  if (!(await recordLaunchAudit(supabase, id, participantId, Boolean(reusable)))) {
    if (!reusable) {
      await supabase
        .from('kid_play_sessions')
        .update({ status: 'ended', ended_at: timestamp, ended_reason: 'audit_failed', updated_at: timestamp })
        .eq('id', session.id);
    }
    return { status: 503, code: 'session_audit_failed' };
  }

  return {
    session,
    participant: participantResult.participant,
    reused: Boolean(reusable),
    pinResolved,
  };
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
    return json(auth.status, { success: false, code: auth.code }, id);
  }
  const program = auth.program;

  if (event.httpMethod === 'POST') {
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch {
      return json(400, { success: false, code: 'invalid_json' }, id);
    }
    const participantId = safeText(body.participantId, 80);
    if (!UUID.test(participantId)) {
      return json(400, { success: false, code: 'validation_error' }, id);
    }
    const result = await launchSession(supabase, program, participantId, id);
    if (!result.session) return json(result.status, { success: false, code: result.code }, id);
    console.info('[FAMILY_CHILD_SESSION]', {
      correlationId: id,
      action: 'launch',
      result: 'success',
      programId: suffix(program.id),
      participantId: suffix(participantId),
      sessionId: suffix(result.session.id),
      reused: result.reused,
      pinResolved: result.pinResolved,
    });
    return json(200, {
      success: true,
      sessionType: 'legacy_access_code',
      ownershipMode: 'server_validated_compatibility',
      reused: result.reused,
      session: publicSession(result.session, result.participant),
    }, id);
  }

  const params = new URLSearchParams(event.rawQuery || '');
  const sessionId = safeText(params.get('sessionId'), 80);
  if (!UUID.test(sessionId)) return json(400, { success: false, code: 'validation_error' }, id);
  const lookup = await sessionForFamily(supabase, sessionId, program);
  if (lookup.error) return json(503, { success: false, code: lookup.error }, id);
  if (!lookup.session) return json(403, { success: false, code: 'session_access_denied' }, id);

  if (event.httpMethod === 'GET') {
    return json(200, {
      success: true,
      session: publicSession(lookup.session, lookup.participant),
    }, id);
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch {
    return json(400, { success: false, code: 'invalid_json' }, id);
  }
  if (body.action === 'grade') {
    const gradeLevel = safeText(body.gradeLevel, 20).toLowerCase();
    if (!ALLOWED_GRADE_LEVELS.has(gradeLevel)) {
      return json(400, { success: false, code: 'validation_error' }, id);
    }
    const participantId = lookup.session.participant_id || lookup.session.child_id;
    const { data: updated, error: gradeError } = await supabase
      .from('participants')
      .update({ grade_level: gradeLevel })
      .eq('id', participantId)
      .eq('program_code', program.program_code)
      .eq('role', 'student')
      .select('id, grade_level')
      .maybeSingle();
    if (gradeError || !updated) {
      console.warn('[FAMILY_CHILD_SESSION]', {
        correlationId: id,
        action: 'update_grade',
        result: 'failed',
        participantId: suffix(participantId),
        databaseCode: gradeError?.code || null,
      });
      return json(503, { success: false, code: 'grade_update_failed' }, id);
    }
    console.info('[FAMILY_CHILD_SESSION]', {
      correlationId: id,
      action: 'update_grade',
      result: 'success',
      participantId: suffix(participantId),
    });
    return json(200, { success: true, gradeLevel: updated.grade_level }, id);
  }
  if (body.action === 'baseline') {
    const record = body.record && typeof body.record === 'object' ? body.record : {};
    const completedModules = Array.isArray(record.completedModules)
      ? record.completedModules.map((value) => safeText(value, 30))
      : [];
    const scores = [record.feelingsScore, record.readingScore, record.focusMovesScore];
    const completedAt = safeText(record.completedAt, 60);
    const completedDate = Date.parse(completedAt);
    const validModules =
      completedModules.length === REQUIRED_BASELINE_MODULES.size &&
      completedModules.every((moduleId) => REQUIRED_BASELINE_MODULES.has(moduleId));
    const validScores = scores.every(
      (score) => Number.isInteger(score) && score >= 0 && score <= 100,
    );
    if (!validModules || !validScores || !Number.isFinite(completedDate)) {
      return json(400, { success: false, code: 'validation_error' }, id);
    }

    const participantId = lookup.session.participant_id || lookup.session.child_id;
    const { data: existingRows, error: existingError } = await supabase
      .from('assessment_results_v2')
      .select('id')
      .eq('participant_id', participantId)
      .eq('assessment_type', 'baseline')
      .not('completed_at', 'is', null)
      .limit(1);
    if (existingError) {
      return json(503, { success: false, code: 'baseline_lookup_failed' }, id);
    }

    if (!existingRows?.length) {
      const totalScore = scores.reduce((sum, score) => sum + score, 0);
      const { error: insertError } = await supabase.from('assessment_results_v2').insert({
        participant_id: participantId,
        role: 'student',
        program_code: lookup.participant.program_code,
        group_name: null,
        assessment_type: 'baseline',
        reading_score: record.readingScore,
        focus_score: record.focusMovesScore,
        confidence_score: record.feelingsScore,
        total_score: totalScore,
        max_score: 60,
        percent_score: Math.min(100, Math.round((totalScore / 60) * 100)),
        answers_json: { completedModules },
        completed_at: new Date(completedDate).toISOString(),
      });
      if (insertError) {
        console.warn('[FAMILY_CHILD_SESSION]', {
          correlationId: id,
          action: 'save_baseline',
          result: 'failed',
          participantId: suffix(participantId),
          databaseCode: insertError.code || null,
        });
        return json(503, { success: false, code: 'baseline_save_failed' }, id);
      }
    }

    const timestamp = new Date().toISOString();
    const { data: updatedSession, error: sessionError } = await supabase
      .from('kid_play_sessions')
      .update({
        resume_payload: {
          ...(lookup.session.resume_payload || {}),
          participant_baseline_complete: true,
          participant_baseline_completed_at: new Date(completedDate).toISOString(),
        },
        last_activity_at: timestamp,
        updated_at: timestamp,
      })
      .eq('id', sessionId)
      .eq('status', 'active')
      .select('*')
      .maybeSingle();
    if (sessionError || !updatedSession) {
      return json(503, { success: false, code: 'session_update_failed' }, id);
    }
    console.info('[FAMILY_CHILD_SESSION]', {
      correlationId: id,
      action: 'save_baseline',
      result: 'success',
      participantId: suffix(participantId),
      reused: Boolean(existingRows?.length),
    });
    return json(200, { success: true, baselineComplete: true }, id);
  }
  const action = body.action === 'end' ? 'end' : 'activity';
  const timestamp = new Date().toISOString();
  const patch = { last_activity_at: timestamp, updated_at: timestamp };
  if (body.resumePayload && typeof body.resumePayload === 'object' && !Array.isArray(body.resumePayload)) {
    patch.resume_payload = body.resumePayload;
  }
  if (action === 'end') {
    patch.status = 'ended';
    patch.ended_at = timestamp;
    patch.ended_reason = ALLOWED_END_REASONS.has(body.reason) ? body.reason : 'user_exit';
  }
  const { data, error } = await supabase
    .from('kid_play_sessions')
    .update(patch)
    .eq('id', sessionId)
    .eq('status', 'active')
    .select('*')
    .maybeSingle();
  if (error) return json(503, { success: false, code: 'session_update_failed' }, id);
  if (!data) return json(409, { success: false, code: 'session_not_active' }, id);
  return json(200, {
    success: true,
    session: publicSession(data, lookup.participant),
  }, id);
};

exports._test = {
  UUID,
  ALLOWED_GRADE_LEVELS,
  REQUIRED_BASELINE_MODULES,
  launchSession,
  participantForFamily,
  publicSession,
  sessionForFamily,
};
