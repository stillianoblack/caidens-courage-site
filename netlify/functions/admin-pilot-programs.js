const { json, requireAdmin } = require('./_lib/adminAuth');

const PROGRAM_DIRECTORY_FIELDS = 'id,program_name,program_type,pilot_status,created_at';

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed.' }, 'method-not-allowed');
  }

  const auth = await requireAdmin(event);
  if (auth.response) return auth.response;

  const { data, error } = await auth.context.supabase
    .from('pilot_programs')
    .select(PROGRAM_DIRECTORY_FIELDS)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[ADMIN_PROGRAM_DIRECTORY_FAILED]', {
      correlationId: auth.context.correlationId,
      code: error.code || null,
    });
    return json(500, { error: 'Programs could not be loaded.' }, auth.context.correlationId);
  }

  const programs = (data || []).map((program) => ({
    id: program.id,
    displayName: program.program_name,
    programType: program.program_type,
    status: program.pilot_status,
    createdAt: program.created_at,
  }));

  return json(200, { programs }, auth.context.correlationId);
};
