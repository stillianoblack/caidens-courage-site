const { correlationId, getServerSupabase, json } = require('./_lib/crmAuth');
const { validateClientRuntime } = require('./_lib/supabaseRuntime');
const {
  clearCookieHeader,
  originIsSameHost,
  readFacilitatorSession,
  revokeFacilitatorSession,
} = require('./_lib/facilitatorSession');

function response(status, body, id, extraHeaders = {}) {
  const base = json(status, body, id);
  return {
    ...base,
    headers: { ...base.headers, 'Cache-Control': 'no-store, private', Pragma: 'no-cache', ...extraHeaders },
  };
}

exports.handler = async (event) => {
  const id = correlationId(event);
  if (!['GET', 'DELETE'].includes(event.httpMethod)) {
    return response(405, { success: false, code: 'method_not_allowed' }, id);
  }
  if (!validateClientRuntime(event)) {
    return response(503, { success: false, code: 'runtime_context_mismatch' }, id);
  }
  if (event.httpMethod === 'DELETE' && !originIsSameHost(event)) {
    return response(403, { success: false, code: 'invalid_request_origin' }, id);
  }
  const supabase = getServerSupabase();
  if (!supabase) return response(503, { success: false, code: 'service_unavailable' }, id);
  if (event.httpMethod === 'DELETE') {
    await revokeFacilitatorSession(event, supabase);
    return response(200, { success: true }, id, { 'Set-Cookie': clearCookieHeader() });
  }
  const result = await readFacilitatorSession(event, supabase);
  if (!result.session) return response(result.status, { success: false, code: result.code }, id);
  return response(200, { success: true, role: 'facilitator', program: result.safeProgram }, id);
};
