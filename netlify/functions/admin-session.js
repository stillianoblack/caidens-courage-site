const {
  authenticateCredentials,
  correlationId,
  issueAdminToken,
  json,
  requireAdmin,
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
    if (!auth.configured) {
      console.error('[ADMIN_AUTH_CONFIG_MISSING]', { correlationId: id });
      return json(503, { error: 'Admin sign-in is unavailable.' }, id);
    }
    if (!auth.valid) return json(403, { error: 'Admin access denied.' }, id);
    return json(200, {
      authenticated: true,
      token: issueAdminToken(auth.credentials.email, auth.credentials.passcode),
    }, id);
  }

  if (event.httpMethod === 'GET') {
    const auth = await requireAdmin(event);
    if (auth.response) return auth.response;
    return json(200, { authenticated: true }, auth.context.correlationId);
  }

  return json(405, { error: 'Method not allowed.' }, id);
};
