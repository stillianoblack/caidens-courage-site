const { json, requireCrmRequest } = require('./_lib/crmAuth');

function maskId(value) {
  const id = String(value || '').trim();
  return id ? `${id.slice(0, 8)}…` : null;
}

async function safeQuery(promise) {
  const { data, error } = await promise;
  return { data: data || [], error: error?.message || null };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed.' });
  }

  const params = new URLSearchParams(event.rawQuery || '');
  const familyProgramCode = String(params.get('familyProgramCode') || '').trim();
  const studentId = String(params.get('studentId') || '').trim();
  if (!familyProgramCode && !studentId) {
    return json(400, { error: 'Select a family program or student.' });
  }

  const required = await requireCrmRequest(event, {
    flag: 'CRM_ADMIN_DIAGNOSTICS_ENABLED',
    permission: 'crm:read',
  });
  if (required.response) return required.response;
  const { context } = required;
  if (!['internal_admin', 'audience_admin'].includes(context.assignment.role)) {
    return json(403, { error: 'Admin diagnostics access denied.' }, context.correlationId);
  }

  const { supabase } = context;
  let participantIds = studentId ? [studentId] : [];
  const directParticipants = familyProgramCode
    ? await safeQuery(
        supabase
          .from('participants')
          .select('id, first_name, nickname, program_code, role, grade_level, created_at')
          .eq('program_code', familyProgramCode)
          .eq('role', 'student'),
      )
    : { data: [], error: null };
  participantIds = Array.from(new Set([...participantIds, ...directParticipants.data.map((row) => row.id)]));

  const links = familyProgramCode
    ? await safeQuery(
        supabase
          .from('student_family_links')
          .select('id, student_id, camp_program_code, family_program_code, parent_claimed, created_at')
          .eq('family_program_code', familyProgramCode),
      )
    : await safeQuery(
        supabase
          .from('student_family_links')
          .select('id, student_id, camp_program_code, family_program_code, parent_claimed, created_at')
          .eq('student_id', studentId),
      );
  participantIds = Array.from(new Set([...participantIds, ...links.data.map((row) => row.student_id).filter(Boolean)]));

  const [participants, assessments, modules, progress, wallets, badges] = participantIds.length
    ? await Promise.all([
        safeQuery(supabase.from('participants').select('id, first_name, nickname, program_code, role, grade_level, created_at').in('id', participantIds)),
        safeQuery(supabase.from('assessment_results_v2').select('id, participant_id, program_code, assessment_type, completed_at').in('participant_id', participantIds)),
        safeQuery(supabase.from('module_results').select('id, participant_id, program_code, module_id, completed_at').in('participant_id', participantIds)),
        safeQuery(supabase.from('player_progress').select('id, participant_id, week_id, mission_id, completed_at').in('participant_id', participantIds)),
        safeQuery(supabase.from('player_wallets').select('participant_id, total_coins').in('participant_id', participantIds)),
        safeQuery(supabase.from('player_badges').select('id, participant_id, week_id, badge_name, earned_at').in('participant_id', participantIds)),
      ])
    : Array.from({ length: 6 }, () => ({ data: [], error: null }));

  const knownIds = new Set(participants.data.map((row) => row.id));
  const placeholderRows = participants.data.filter((row) =>
    ['student', 'child', 'player'].includes(String(row.nickname || row.first_name || '').trim().toLowerCase()),
  );
  const orphanLinks = links.data.filter((row) => !knownIds.has(row.student_id));
  const queryErrors = [directParticipants, links, participants, assessments, modules, progress, wallets, badges]
    .map((entry) => entry.error)
    .filter(Boolean);

  return json(200, {
    refreshedAt: new Date().toISOString(),
    source: 'supabase_no_cache',
    familyProgramCode: familyProgramCode || null,
    requestedStudentId: maskId(studentId),
    canonicalStudentIds: participantIds.map(maskId),
    students: participants.data.map((row) => ({
      ...row,
      id: maskId(row.id),
      hasDisplayName: Boolean(String(row.nickname || row.first_name || '').trim()),
    })),
    links: links.data.map((row) => ({ ...row, id: maskId(row.id), student_id: maskId(row.student_id) })),
    assessments: assessments.data.map((row) => ({ ...row, id: maskId(row.id), participant_id: maskId(row.participant_id) })),
    moduleResults: modules.data.map((row) => ({ ...row, id: maskId(row.id), participant_id: maskId(row.participant_id) })),
    playerProgress: progress.data.map((row) => ({ ...row, id: maskId(row.id), participant_id: maskId(row.participant_id) })),
    wallets: wallets.data.map((row) => ({ ...row, participant_id: maskId(row.participant_id) })),
    badges: badges.data.map((row) => ({ ...row, id: maskId(row.id), participant_id: maskId(row.participant_id) })),
    findings: {
      placeholderStudentIds: placeholderRows.map((row) => maskId(row.id)),
      orphanedLinkIds: orphanLinks.map((row) => maskId(row.id)),
      queryErrors,
    },
  }, context.correlationId);
};
