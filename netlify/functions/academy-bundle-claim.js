const { jsonResponse } = require('./_lib/bookstoreDelivery');
const { createActivationServiceClient } = require('./_lib/activationPreviewGuard');
const { createSupabaseBundleStore } = require('./_lib/academyBundleStore');
const {
  activateBundleForSignedInFamily,
  cookieHeaderFrom,
  publicActivationBody,
  readAcademyHandoff,
} = require('./_lib/academyBundleActivation');

async function handleBundleClaim(event, deps = {}) {
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
    const result = await activateBundleForSignedInFamily({
      store,
      handoffSecret: readAcademyHandoff(cookieHeaderFrom(event)),
      familyAccessCode: body.familyAccessCode,
      parentEmail: body.parentEmail,
      now: deps.now,
      env: deps.env,
    });
    return jsonResponse(result.status || 503, publicActivationBody(result));
  } catch (error) {
    return jsonResponse(error.status || 503, { error: error.reason || 'claim_unavailable', granted: false });
  }
}

exports.handleBundleClaim = handleBundleClaim;
exports.handler = function academyBundleClaim(event) {
  return handleBundleClaim(event);
};
