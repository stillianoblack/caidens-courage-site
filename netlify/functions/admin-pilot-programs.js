const { json, requireAdmin } = require('./_lib/adminAuth');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed.' }, 'method-not-allowed');
  }

  const auth = await requireAdmin(event);
  if (auth.response) return auth.response;

  const { data, error } = await auth.context.supabase
    .from('pilot_programs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[ADMIN_PILOT_PROGRAMS_FAILED]', {
      correlationId: auth.context.correlationId,
      code: error.code || null,
    });
    return json(500, { error: 'Programs could not be loaded.' }, auth.context.correlationId);
  }

  const programs = data || [];
  const codes = programs.map((row) => row.program_code).filter(Boolean);
  const statsByCode = {};

  if (codes.length) {
    const { data: participants, error: participantError } = await auth.context.supabase
      .from('participants')
      .select('program_code, updated_at, role')
      .in('program_code', codes);

    if (!participantError) {
      for (const row of participants || []) {
        const code = row.program_code;
        if (!code) continue;
        if (!statsByCode[code]) statsByCode[code] = { students: 0, lastActivityMs: 0 };
        if (row.role === 'student') statsByCode[code].students += 1;
        const updatedMs = row.updated_at ? Date.parse(row.updated_at) : 0;
        if (updatedMs > statsByCode[code].lastActivityMs) statsByCode[code].lastActivityMs = updatedMs;
      }
    }
  }

  const enrichedPrograms = programs.map((program) => {
    const stats = statsByCode[program.program_code] || { students: 0, lastActivityMs: 0 };
    return {
      ...program,
      admin_student_count: stats.students,
      admin_last_activity_at: stats.lastActivityMs
        ? new Date(stats.lastActivityMs).toISOString()
        : null,
    };
  });

  return json(200, { programs: enrichedPrograms }, auth.context.correlationId);
};
