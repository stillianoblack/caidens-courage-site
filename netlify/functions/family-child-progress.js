const { correlationId, getServerSupabase, json } = require('./_lib/crmAuth');
const {
  authorizeFamilyCompatibilitySession,
  participantBelongsToFamily,
  safeText,
} = require('./_lib/familyCompatibilityAuth');

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

exports.handler = async (event) => {
  const id = correlationId(event);
  if (!['GET', 'POST'].includes(event.httpMethod)) {
    return json(405, { success: false, code: 'method_not_allowed' }, id);
  }
  const supabase = getServerSupabase();
  if (!supabase) return json(503, { success: false, code: 'configuration_error' }, id);
  const auth = await authorizeFamilyCompatibilitySession(event, supabase);
  if (!auth.program) return json(auth.status, { success: false, code: auth.code }, id);

  const params = new URLSearchParams(event.rawQuery || '');
  let body = {};
  if (event.httpMethod === 'POST') {
    try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { success: false, code: 'invalid_json' }, id); }
  }
  const participantId = safeText(event.httpMethod === 'POST' ? body.participantId : params.get('participantId'), 80);
  const view = safeText(params.get('view'), 20);
  const weekId = safeText(params.get('weekId'), 40);
  if (!UUID.test(participantId)) return json(400, { success: false, code: 'validation_error' }, id);
  if (view === 'summary' && !/^week-[1-9][0-9]*$/.test(weekId)) {
    return json(400, { success: false, code: 'validation_error' }, id);
  }
  const { data: participant, error: participantError } = await supabase
    .from('participants')
    .select('id, role, program_code, group_name')
    .eq('id', participantId)
    .maybeSingle();
  if (participantError) return json(503, { success: false, code: 'participant_lookup_failed' }, id);
  if (!participantBelongsToFamily(participant, auth.program.program_code)) {
    return json(403, { success: false, code: 'participant_access_denied' }, id);
  }

  if (event.httpMethod === 'POST') {
    const moduleInput = body.module && typeof body.module === 'object' ? body.module : {};
    const attemptsInput = Array.isArray(body.attempts) ? body.attempts : [];
    const moduleId = safeText(moduleInput.moduleId, 120);
    const moduleTitle = safeText(moduleInput.moduleTitle, 200);
    const character = safeText(moduleInput.character, 80);
    const skillArea = safeText(moduleInput.skillArea, 120) || null;
    const score = Number(moduleInput.score);
    const maxScore = Number(moduleInput.maxScore);
    const completedAt = safeText(moduleInput.completedAt, 40);
    const timeSpentSeconds = moduleInput.timeSpentSeconds == null ? null : Number(moduleInput.timeSpentSeconds);
    const answersJson = moduleInput.answersJson && typeof moduleInput.answersJson === 'object' && !Array.isArray(moduleInput.answersJson)
      ? moduleInput.answersJson
      : {};
    if (!moduleId || !moduleTitle || !character || !Number.isFinite(score) || !Number.isFinite(maxScore) ||
        score < 0 || maxScore < 1 || score > maxScore || !completedAt || Number.isNaN(Date.parse(completedAt)) ||
        (timeSpentSeconds != null && (!Number.isFinite(timeSpentSeconds) || timeSpentSeconds < 0)) ||
        attemptsInput.length > 50 || JSON.stringify(answersJson).length > 100000) {
      return json(400, { success: false, code: 'validation_error' }, id);
    }
    const attemptRows = attemptsInput.map((attempt) => ({
      participant_id: participantId,
      program_code: participant.program_code,
      week_number: Number.isInteger(attempt.weekNumber) && attempt.weekNumber >= 1 && attempt.weekNumber <= 52 ? attempt.weekNumber : null,
      mission_id: safeText(attempt.missionId, 120) || moduleId,
      character: safeText(attempt.character, 80) || character,
      question_id: safeText(attempt.questionId, 160),
      grade_level: safeText(attempt.gradeLevel, 40) || null,
      grade_band: safeText(attempt.gradeBand, 40) || null,
      content_version: safeText(attempt.contentVersion, 80) || null,
      selected_answer: safeText(attempt.selectedAnswer, 500) || null,
      correct_answer: safeText(attempt.correctAnswer, 500) || null,
      first_selected_answer: safeText(attempt.firstSelectedAnswer, 500) || null,
      final_selected_answer: safeText(attempt.selectedAnswer, 500) || null,
      is_correct_first_try: attempt.isCorrectFirstTry === true,
      is_correct_final: attempt.isCorrectFinal === true,
      attempts_count: Number.isInteger(attempt.attemptCount) && attempt.attemptCount >= 1 ? attempt.attemptCount : 1,
      hints_used_count: attempt.usedHint === true ? 1 : 0,
      used_hint: attempt.usedHint === true,
      attempt_type: ['initial', 'replay', 'challenge'].includes(attempt.attemptType) ? attempt.attemptType : 'initial',
      attempt_scope: safeText(attempt.attemptScope, 40) || null,
      is_replay: attempt.isReplay === true,
      completed_at: !Number.isNaN(Date.parse(attempt.completedAt)) ? new Date(attempt.completedAt).toISOString() : new Date(completedAt).toISOString(),
      module_id: safeText(attempt.moduleId, 120) || moduleId,
    }));
    if (attemptRows.some((row) => !row.question_id)) {
      return json(400, { success: false, code: 'validation_error' }, id);
    }
    const { count, error: countError } = await supabase
      .from('module_results')
      .select('id', { count: 'exact', head: true })
      .eq('participant_id', participantId)
      .eq('module_id', moduleId);
    if (countError) return json(503, { success: false, code: 'completion_lookup_failed' }, id);

    const moduleResult = await supabase
      .from('module_results')
      .insert({
        participant_id: participantId,
        role: 'student',
        program_code: participant.program_code,
        group_name: participant.group_name || null,
        module_id: moduleId,
        module_title: moduleTitle,
        character,
        skill_area: skillArea,
        score,
        max_score: maxScore,
        percent_score: Math.round((score / maxScore) * 10000) / 100,
        time_spent_seconds: timeSpentSeconds,
        attempt_number: Number(count || 0) + 1,
        answers_json: { ...answersJson, participant_id: participantId },
        completed_at: new Date(completedAt).toISOString(),
      })
      .select('id')
      .single();
    if (moduleResult.error || !moduleResult.data?.id) {
      return json(503, { success: false, code: 'completion_save_failed' }, id);
    }

    if (attemptRows.length) {
      const attemptResult = await supabase.from('question_attempts').insert(attemptRows);
      if (attemptResult.error) return json(503, { success: false, code: 'attempt_save_failed' }, id);
    }
    return json(200, {
      success: true,
      recordId: moduleResult.data.id,
      attemptCount: attemptRows.length,
    }, id);
  }

  const { data, error } = await supabase
    .from('player_progress')
    .select('week_id, mission_id, completed_at')
    .eq('participant_id', participantId);
  if (error) return json(503, { success: false, code: 'progress_lookup_failed' }, id);
  if (view !== 'summary') return json(200, { success: true, rows: data || [] }, id);

  const [walletResult, badgeResult] = await Promise.all([
    supabase
      .from('player_wallets')
      .select('total_coins')
      .eq('participant_id', participantId)
      .maybeSingle(),
    supabase
      .from('player_badges')
      .select('badge_name')
      .eq('participant_id', participantId)
      .eq('week_id', weekId),
  ]);
  if (walletResult.error) return json(503, { success: false, code: 'wallet_lookup_failed' }, id);
  if (badgeResult.error) return json(503, { success: false, code: 'badge_lookup_failed' }, id);

  return json(200, {
    success: true,
    rows: data || [],
    totalCoins: Number(walletResult.data?.total_coins || 0),
    badges: (badgeResult.data || [])
      .map((row) => row.badge_name)
      .filter((value) => typeof value === 'string' && value.trim())
      .map((value) => value.trim()),
  }, id);
};
