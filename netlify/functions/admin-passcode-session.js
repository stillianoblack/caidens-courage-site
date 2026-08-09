const {
  authenticateCredentials,
  clearSessionCookie,
  correlationId,
  issueAdminToken,
  json,
  requireAdmin,
  sessionCookie,
} = require('./_lib/adminAuth');

exports.handler = async (event) => {
  const id = correlationId(event);
  if (event.httpMethod === 'POST') {
    let payload;
    try {
      payload = JSON.parse(event.body || '{}');
    } catch {
      return json(400, { error: 'Sign-in information is invalid.' }, id);
    }
    const auth = authenticateCredentials(payload.email, payload.passcode);
    if (!auth.configured) return json(503, { error: 'Admin analytics are unavailable.' }, id);
    if (!auth.valid) return json(403, { error: 'Admin access denied.' }, id);
    const response = json(200, { authenticated: true }, id);
    response.headers['Set-Cookie'] = sessionCookie(issueAdminToken(auth.credentials.passcode));
    return response;
  }
  if (event.httpMethod === 'GET') {
    const auth = await requireAdmin(event);
    if (auth.response) return auth.response;
    return json(200, { authenticated: true }, auth.context.correlationId);
  }
  if (event.httpMethod === 'DELETE') {
    const response = json(200, { authenticated: false }, id);
    response.headers['Set-Cookie'] = clearSessionCookie();
    return response;
  }
  return json(405, { error: 'Method not allowed.' }, id);
};
