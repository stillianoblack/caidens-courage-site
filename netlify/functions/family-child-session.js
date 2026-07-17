const { correlationId, getServerSupabase, json } = require('./_lib/crmAuth');
const {
  authorizeFamilyCompatibilitySession,
  participantBelongsToFamily,
  safeText,
} = require('./_lib/familyCompatibilityAuth');
const {
  authorizeCampProgram,
  participantForCamp,
  sessionForCamp,
} = require('./_lib/campCompatibilityAuth');

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_END_REASONS = new Set(['idle_timeout', 'user_exit', 'signed_out']);
const ALLOWED_GRADE_LEVELS = new Set(['kindergarten', '1', '2', '3', '4', '5', '6', '7', '8']);
const REQUIRED_BASELINE_MODULES = new Set(['feelings', 'reading', 'focus-moves']);

function suffix(value) {
  const normalized = safeText(value, 80);
  return normalized ? `…${normalized.slice(-6)}` : null;
}

function sanitizeResumePayload(value) {
  const input = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const sanitized = {};
  const copyText = (key, maxLength) => {
    const text = safeText(input[key], maxLength);
    if (text) sanitized[key] = text;
  };
  copyText('route', 400);
  copyText('module', 80);
  copyText('endedFrom', 80);
  copyText('characterId', 80);
  copyText('missionId', 120);
  copyText('participant_baseline_completed_at', 60);
  if (Number.isInteger(input.week) && input.week >= 1 && input.week <= 52) {
    sanitized.week = input.week;
  }
  if (typeof input.participant_baseline_complete === 'boolean') {
    sanitized.participant_baseline_complete = input.participant_baseline_complete;
  }
  return sanitized;
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
      ...sanitizeResumePayload(row.resume_payload),
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
    metadata: {
      session_type: 'legacy_access_code',
      reused: Boolean(reused),
    },
  });
  if (!error) return true;
  const missingAuditTable =
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    /admin_audit_events.*(?:does not exist|not find|schema cache)/i.test(error.message || '');
  if (missingAuditTable) {
    console.info('[FAMILY_CHILD_SESSION]', {
      correlationId: id,
      action: 'launch_audit',
      result: 'audit_table_unavailable',
    });
    return true;
  }
  return false;
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
        resume_payload: { ...sanitizeResumePayload(session.resume_payload), ...sessionIdentity },
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

async function launchCampSession(supabase, program, participantId, input, id) {
  const participantResult = await participantForCamp(
    supabase,
    participantId,
    program.program_code,
  );
  if (!participantResult.participant) {
    return { status: participantResult.status, code: participantResult.code };
  }

  const localSessionId = safeText(input.localSessionId, 80);
  const moveFromSessionId = safeText(input.moveFromExistingSessionId, 80);
  const { data: activeRows, error: activeError } = await supabase
    .from('kid_play_sessions')
    .select('*')
    .eq('organization_id', program.id)
    .eq('child_id', participantId)
    .eq('session_source', 'facilitator_roster_launch')
    .eq('status', 'active')
    .order('started_at', { ascending: true });
  if (activeError) return { status: 503, code: 'camp_session_lookup_failed' };

  const active = activeRows || [];
  const timestamp = new Date().toISOString();
  const displayName = safeText(
    participantResult.participant.nickname || participantResult.participant.first_name,
    80,
  ) || 'Player';
  const sessionIdentity = {
    participant_display_name: displayName,
    participant_first_name: safeText(participantResult.participant.first_name, 80) || displayName,
    ...(participantResult.participant.grade_level
      ? { participant_grade_level: participantResult.participant.grade_level }
      : {}),
  };

  if (moveFromSessionId) {
    const moved = active.find((row) => row.id === moveFromSessionId);
    if (!moved) return { status: 409, code: 'camp_session_move_conflict' };
    const { error } = await supabase
      .from('kid_play_sessions')
      .update({
        status: 'moved',
        ended_at: timestamp,
        ended_reason: 'moved_to_this_device',
        updated_at: timestamp,
      })
      .eq('id', moved.id)
      .eq('status', 'active');
    if (error) return { status: 503, code: 'camp_session_move_failed' };
  } else if (active.length) {
    const reusable = active.find((row) => row.id === localSessionId);
    if (!reusable) {
      return {
        status: 409,
        code: 'camp_session_active_elsewhere',
        conflict: active[0],
        participant: participantResult.participant,
      };
    }
    const { data, error } = await supabase
      .from('kid_play_sessions')
      .update({
        last_activity_at: timestamp,
        updated_at: timestamp,
        resume_payload: { ...sanitizeResumePayload(reusable.resume_payload), ...sessionIdentity },
      })
      .eq('id', reusable.id)
      .eq('status', 'active')
      .select('*')
      .maybeSingle();
    if (error || !data) return { status: 503, code: 'camp_session_resume_failed' };
    return {
      session: data,
      participant: participantResult.participant,
      reused: true,
    };
  }

  const { data: inserted, error: insertError } = await supabase
    .from('kid_play_sessions')
    .insert({
      child_id: participantId,
      participant_id: participantId,
      organization_id: program.id,
      launched_by_user_id: null,
      session_source: 'facilitator_roster_launch',
      device_mode: 'shared_camp_device',
      status: 'active',
      started_at: timestamp,
      last_activity_at: timestamp,
      resume_payload: sessionIdentity,
      updated_at: timestamp,
    })
    .select('*')
    .single();
  if (insertError || !inserted) return { status: 503, code: 'camp_session_create_failed' };

  // Reconcile concurrent launch requests deterministically. The oldest active row wins;
  // later duplicates are ended without changing participant data or progress.
  const { data: concurrentRows, error: reconcileError } = await supabase
    .from('kid_play_sessions')
    .select('*')
    .eq('organization_id', program.id)
    .eq('child_id', participantId)
    .eq('session_source', 'facilitator_roster_launch')
    .eq('status', 'active')
    .order('started_at', { ascending: true })
    .order('id', { ascending: true });
  if (reconcileError) return { status: 503, code: 'camp_session_reconcile_failed' };
  const canonical = concurrentRows?.[0] || inserted;
  const duplicateIds = (concurrentRows || []).slice(1).map((row) => row.id);
  if (duplicateIds.length) {
    const { error } = await supabase
      .from('kid_play_sessions')
      .update({
        status: 'ended',
        ended_at: timestamp,
        ended_reason: 'duplicate_facilitator_launch',
        updated_at: timestamp,
      })
      .in('id', duplicateIds)
      .eq('status', 'active');
    if (error) return { status: 503, code: 'camp_session_reconcile_failed' };
  }

  return {
    session: canonical,
    participant: participantResult.participant,
    reused: canonical.id !== inserted.id,
  };
}

exports.handler = async (event) => {
  const id = correlationId(event);
  if (!['GET', 'POST', 'PATCH'].includes(event.httpMethod)) {
    return json(405, { success: false, code: 'method_not_allowed' }, id);
  }
  const supabase = getServerSupabase();
  if (!supabase) return json(503, { success: false, code: 'configuration_error' }, id);

  let body = null;
  if (event.httpMethod !== 'GET') {
    try { body = JSON.parse(event.body || '{}'); } catch {
      return json(400, { success: false, code: 'invalid_json' }, id);
    }
  }

  const params = new URLSearchParams(event.rawQuery || '');
  const sessionId = safeText(params.get('sessionId'), 80);
  const familyAuth = await authorizeFamilyCompatibilitySession(event, supabase);
  const campRequested = Boolean(event.headers?.['x-camp-program-id']);
  const campAuth = familyAuth.program
    ? null
    : await authorizeCampProgram(event, supabase);
  const mode = familyAuth.program ? 'family' : campAuth?.program ? 'camp' : null;
  const program = familyAuth.program || campAuth?.program;
  if (!program || !mode) {
    const failed = campRequested ? campAuth : familyAuth;
    return json(failed?.status || 401, { success: false, code: failed?.code || 'missing_session' }, id);
  }

  if (event.httpMethod === 'POST') {
    const participantId = safeText(body.participantId, 80);
    if (!UUID.test(participantId)) {
      return json(400, { success: false, code: 'validation_error' }, id);
    }
    const result = mode === 'family'
      ? await launchSession(supabase, program, participantId, id)
      : await launchCampSession(supabase, program, participantId, body, id);
    if (!result.session) {
      return json(result.status, {
        success: false,
        code: result.code,
        ...(result.conflict
          ? { conflictSession: publicSession(result.conflict, result.participant) }
          : {}),
      }, id);
    }
    console.info('[FAMILY_CHILD_SESSION]', {
      correlationId: id,
      action: 'launch',
      result: 'success',
      authorizationMode: mode === 'family' ? 'family_compatibility' : 'camp_facilitator_session',
      programId: suffix(program.id),
      participantId: suffix(participantId),
      sessionId: suffix(result.session.id),
      reused: result.reused,
      pinResolved: result.pinResolved,
    });
    return json(200, {
      success: true,
      sessionType: mode === 'family' ? 'legacy_access_code' : 'facilitator_program_session',
      ownershipMode: 'server_validated_compatibility',
      reused: result.reused,
      session: publicSession(result.session, result.participant),
    }, id);
  }

  if (!UUID.test(sessionId)) return json(400, { success: false, code: 'validation_error' }, id);
  const lookup = mode === 'family'
    ? await sessionForFamily(supabase, sessionId, program)
    : await sessionForCamp(supabase, sessionId, program);
  if (lookup.error || (!lookup.session && lookup.status === 503)) {
    return json(503, { success: false, code: lookup.error || lookup.code }, id);
  }
  if (!lookup.session) return json(lookup.status || 403, { success: false, code: lookup.code || 'session_access_denied' }, id);

  if (event.httpMethod === 'GET') {
    return json(200, {
      success: true,
      session: publicSession(lookup.session, lookup.participant),
    }, id);
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
          ...sanitizeResumePayload(lookup.session.resume_payload),
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
    patch.resume_payload = {
      ...sanitizeResumePayload(body.resumePayload),
      participant_display_name: safeText(
        lookup.participant.nickname || lookup.participant.first_name,
        80,
      ) || 'Player',
      participant_first_name: safeText(lookup.participant.first_name, 80) || 'Player',
      ...(lookup.participant.grade_level
        ? { participant_grade_level: lookup.participant.grade_level }
        : {}),
    };
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
  sanitizeResumePayload,
  launchCampSession,
  launchSession,
  participantForFamily,
  publicSession,
  recordLaunchAudit,
  sessionForFamily,
};
