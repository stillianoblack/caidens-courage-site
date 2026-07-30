const { requireAdmin, json } = require('./_lib/adminAuth');
const { buildPilotOutcomes } = require('./_lib/pilotOutcomes');

async function safeLoad(supabase, table, correlationId) {
  const { data, error } = await supabase.from(table).select('*').limit(10000);
  if (error) {
    console.warn('[PILOT_OUTCOMES_SOURCE_UNAVAILABLE]', {
      correlationId,
      table,
      code: error.code || null,
    });
    return { rows: [], unavailable: table };
  }
  return { rows: data || [], unavailable: null };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed.' }, 'method-not-allowed');
  }
  const auth = await requireAdmin(event);
  if (auth.response) return auth.response;
  const { supabase, correlationId } = auth.context;
  const sources = [
    ['programs', 'pilot_programs'],
    ['participants', 'participants'],
    ['assessments', 'assessment_results_v2'],
    ['modules', 'module_results'],
    ['weeks', 'participant_week_progress'],
    ['wallets', 'player_wallets'],
    ['rewards', 'player_reward_claims'],
    ['sessions', 'kid_play_sessions'],
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
  const outcomes = buildPilotOutcomes(data, {
    publishedWeeks: Number(event.queryStringParameters?.publishedWeeks || 0),
    weeklyProgressSourceAvailable: !unavailableSources.includes('participant_week_progress'),
  });
  const programId = String(event.queryStringParameters?.programId || '').trim();
  if (programId) {
    const program = outcomes.programs.find((row) => row.id === programId);
    if (!program) return json(404, { error: 'Program outcomes were not found.' }, correlationId);
    return json(200, { program, unavailableSources }, correlationId);
  }
  return json(
    200,
    {
      summary: outcomes.summary,
      programs: outcomes.programs.map(({ students, ...program }) => program),
      unavailableSources,
    },
    correlationId,
  );
};
