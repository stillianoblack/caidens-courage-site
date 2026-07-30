const { requireAdmin, json } = require('./_lib/adminAuth');
const { loadAcademyData } = require('./_lib/academyData');
const { buildAcademyOutcomes } = require('./_lib/academyOutcomes');

const OVERRIDES = new Set(['automatic', 'include', 'exclude']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

exports.handler = async (event) => {
  if (!['GET', 'PATCH'].includes(event.httpMethod)) {
    return json(405, { error: 'Method not allowed.' }, 'method-not-allowed');
  }
  const auth = await requireAdmin(event);
  if (auth.response) return auth.response;
  const { supabase, correlationId } = auth.context;

  if (event.httpMethod === 'PATCH') {
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return json(400, { error: 'The cohort update could not be read.' }, correlationId);
    }
    const participantId = String(body.participantId || '').trim();
    const reportingOverride = String(body.reportingOverride || '').trim().toLowerCase();
    const reason = String(body.reason || '').trim().slice(0, 500) || null;
    if (!UUID.test(participantId) || !OVERRIDES.has(reportingOverride)) {
      return json(400, { error: 'Choose a valid student and reporting status.' }, correlationId);
    }
    const { data, error } = await supabase
      .from('academy_reporting_overrides')
      .upsert({
        participant_id: participantId,
        reporting_override: reportingOverride,
        reporting_override_reason: reason,
        updated_by: 'admin_session',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'participant_id' })
      .select('participant_id,reporting_override,reporting_override_reason,updated_at')
      .single();
    if (error) {
      console.error('[ACADEMY_REPORTING_OVERRIDE_FAILED]', {
        correlationId,
        code: error.code || null,
      });
      return json(503, { error: 'Academy reporting overrides require the additive migration.' }, correlationId);
    }
    await supabase.from('admin_audit_events').insert({
      event_type: 'academy_reporting_override',
      entity_type: 'participant',
      entity_id: participantId,
      metadata: {
        reporting_override: reportingOverride,
        reason_provided: Boolean(reason),
      },
      created_at: new Date().toISOString(),
    });
    return json(200, { override: data }, correlationId);
  }

  const { data, unavailableSources } = await loadAcademyData(supabase, correlationId);
  const academy = buildAcademyOutcomes(data, {
    weeklyProgressSourceAvailable: !unavailableSources.includes('participant_week_progress'),
  });
  return json(200, { academy, unavailableSources }, correlationId);
};

exports._test = { OVERRIDES };
