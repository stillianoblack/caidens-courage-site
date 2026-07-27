const { requireAdmin, json } = require('./_lib/adminAuth');

const ALLOWED_STATUSES = new Set([
  'Draft',
  'Setup',
  'Ready',
  'Active',
  'Needs attention',
  'Reporting',
  'Complete',
  'Archived',
]);
const ALLOWED_NOTE_TYPES = new Set([
  'Facilitator follow-up',
  'Principal follow-up',
  'Parent communication',
  'Technical issue',
  'Training need',
  'Expansion opportunity',
]);

function text(value, max = 2000) {
  return String(value || '').trim().slice(0, max);
}

exports.handler = async (event) => {
  if (!['GET', 'POST'].includes(event.httpMethod)) {
    return json(405, { error: 'Method not allowed.' }, 'method-not-allowed');
  }
  const auth = await requireAdmin(event);
  if (auth.response) return auth.response;
  const { supabase, correlationId } = auth.context;
  const programId = text(
    event.queryStringParameters?.programId ||
      (() => {
        try {
          return JSON.parse(event.body || '{}').programId;
        } catch {
          return '';
        }
      })(),
    80,
  );
  if (!programId) return json(400, { error: 'Select a pilot program.' }, correlationId);

  if (event.httpMethod === 'GET') {
    const [state, notes, reports] = await Promise.all([
      supabase.from('pilot_rollout_state').select('*').eq('program_id', programId).maybeSingle(),
      supabase.from('pilot_rollout_notes').select('*').eq('program_id', programId).order('note_date', { ascending: false }),
      supabase.from('pilot_outcome_reports').select('id,program_id,status,created_at,reporting_start,reporting_end,include_charts,include_notes,include_student_appendix').eq('program_id', programId).order('created_at', { ascending: false }),
    ]);
    const unavailable = [state.error, notes.error, reports.error].some(Boolean);
    return json(200, {
      state: state.data || null,
      notes: notes.data || [],
      reports: reports.data || [],
      persistenceAvailable: !unavailable,
    }, correlationId);
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'The rollout update could not be read.' }, correlationId);
  }
  if (body.action === 'save_state') {
    const status = text(body.status, 40);
    if (!ALLOWED_STATUSES.has(status)) {
      return json(400, { error: 'Choose a valid rollout status.' }, correlationId);
    }
    const record = {
      program_id: programId,
      status,
      status_reason: text(body.statusReason, 500) || null,
      checklist: body.checklist && typeof body.checklist === 'object' ? body.checklist : {},
      baseline_window_start: body.baselineWindowStart || null,
      baseline_window_end: body.baselineWindowEnd || null,
      program_window_start: body.programWindowStart || null,
      program_window_end: body.programWindowEnd || null,
      post_window_start: body.postWindowStart || null,
      post_window_end: body.postWindowEnd || null,
      reporting_date: body.reportingDate || null,
      matched_data_target: Number(body.matchedDataTarget || 0),
      completion_target: Number(body.completionTarget || 0),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('pilot_rollout_state')
      .upsert(record, { onConflict: 'program_id' })
      .select('*')
      .single();
    if (error) {
      console.error('[PILOT_ROLLOUT_SAVE_FAILED]', { correlationId, code: error.code || null });
      return json(503, { error: 'Rollout tracking is not available yet.' }, correlationId);
    }
    return json(200, { state: data }, correlationId);
  }
  if (body.action === 'add_note') {
    const noteType = text(body.noteType, 80);
    const note = text(body.note);
    if (!ALLOWED_NOTE_TYPES.has(noteType) || !note) {
      return json(400, { error: 'Choose a note type and enter a note.' }, correlationId);
    }
    const { data, error } = await supabase
      .from('pilot_rollout_notes')
      .insert({
        program_id: programId,
        note_date: body.noteDate || new Date().toISOString().slice(0, 10),
        owner_name: text(body.ownerName, 120) || 'Admin',
        note_type: noteType,
        note_status: text(body.noteStatus, 40) || 'Open',
        note,
        next_action_date: body.nextActionDate || null,
      })
      .select('*')
      .single();
    if (error) {
      console.error('[PILOT_ROLLOUT_NOTE_FAILED]', { correlationId, code: error.code || null });
      return json(503, { error: 'The rollout note could not be saved.' }, correlationId);
    }
    return json(200, { note: data }, correlationId);
  }
  return json(400, { error: 'Choose a supported rollout action.' }, correlationId);
};
