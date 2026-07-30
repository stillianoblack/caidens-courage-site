async function safeLoad(supabase, table, correlationId) {
  const { data, error } = await supabase.from(table).select('*').limit(10000);
  if (error) {
    console.warn('[ACADEMY_OUTCOMES_SOURCE_UNAVAILABLE]', {
      correlationId,
      table,
      code: error.code || null,
    });
    return { rows: [], unavailable: table };
  }
  return { rows: data || [], unavailable: null };
}

async function loadAcademyData(supabase, correlationId) {
  const sources = [
    ['programs', 'pilot_programs'],
    ['participants', 'participants'],
    ['assessments', 'assessment_results_v2'],
    ['modules', 'module_results'],
    ['missions', 'participant_mission_progress'],
    ['questions', 'question_attempts'],
    ['weeks', 'participant_week_progress'],
    ['wallets', 'player_wallets'],
    ['rewards', 'player_reward_claims'],
    ['sessions', 'kid_play_sessions'],
    ['overrides', 'academy_reporting_overrides'],
  ];
  const loaded = await Promise.all(
    sources.map(async ([key, table]) => [key, await safeLoad(supabase, table, correlationId)]),
  );
  const data = {};
  const unavailableSources = [];
  for (const [key, result] of loaded) {
    data[key] = result.rows;
    if (result.unavailable) unavailableSources.push(result.unavailable);
  }
  return { data, unavailableSources };
}

module.exports = { loadAcademyData, safeLoad };
