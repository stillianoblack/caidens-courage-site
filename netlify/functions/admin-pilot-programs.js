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

  return json(200, { programs: data || [] }, auth.context.correlationId);
};
