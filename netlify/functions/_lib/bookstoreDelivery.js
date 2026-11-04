function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

function publicSiteOrigin(env = process.env) {
  const context = String(env.CONTEXT || '').trim().toLowerCase();
  if (context === 'branch-deploy') return String(env.DEPLOY_PRIME_URL || '').trim();
  return String(env.URL || env.DEPLOY_PRIME_URL || '').trim();
}

module.exports = {
  jsonResponse,
  publicSiteOrigin,
};
