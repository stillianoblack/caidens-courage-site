const { jsonResponse } = require('./_lib/bookstoreDelivery');
const { createActivationServiceClient } = require('./_lib/activationPreviewGuard');
const { createSupabaseBundleStore } = require('./_lib/academyBundleStore');
const {
  cookieHeaderFrom,
  establishBundleHandoff,
  publicActivationBody,
  readAcademyHandoff,
  readBundleHandoff,
} = require('./_lib/academyBundleActivation');

function responseFor(result) {
  const response = jsonResponse(result?.status || 503, publicActivationBody(result));
  if (result?.cookie) {
    response.headers['Set-Cookie'] = result.cookie;
  }
  return response;
}

async function handleBundleExchange(event, deps = {}) {
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'method_not_allowed' });
  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return jsonResponse(400, { error: 'invalid_json' });
  }

  const client = deps.store ? null : createActivationServiceClient(deps.env);
  const store = deps.store || (client ? createSupabaseBundleStore(client) : null);
  if (!store) return jsonResponse(503, { error: 'claim_not_configured' });

  try {
    const invitationToken = String(body.token || '').trim();
    const result = invitationToken
      ? await establishBundleHandoff({
        store,
        invitationToken,
        now: deps.now,
        secret: deps.secret,
        secure: true,
      })
      : await readBundleHandoff({
        store,
        handoffSecret: readAcademyHandoff(cookieHeaderFrom(event)),
        now: deps.now,
      });
    return responseFor(result);
  } catch (error) {
    return jsonResponse(error.status || 503, { error: error.reason || 'claim_unavailable', granted: false });
  }
}

exports.handleBundleExchange = handleBundleExchange;
exports.handler = function academyBundleExchange(event) {
  return handleBundleExchange(event);
};
