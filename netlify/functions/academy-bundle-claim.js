const { jsonResponse } = require('./_lib/bookstoreDelivery');
const { createActivationServiceClient } = require('./_lib/activationPreviewGuard');
const { createSupabaseBundleStore } = require('./_lib/academyBundleStore');
const { createSupabaseVerificationStore } = require('./_lib/academyActivationVerification');
const {
  activateBundleForSignedInFamily,
  cookieHeaderFrom,
  publicActivationBody,
  readAcademyHandoff,
} = require('./_lib/academyBundleActivation');
const { readOwnerCookie } = require('./_lib/academyActivationVerification');

async function handleBundleClaim(event, deps = {}) {
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'method_not_allowed', granted: false });

  const client = deps.store ? null : createActivationServiceClient(deps.env);
  const store = deps.store || (client ? createSupabaseBundleStore(client) : null);
  const verificationStore = deps.verificationStore || (client ? createSupabaseVerificationStore(client) : null);
  if (!store || !verificationStore) return jsonResponse(503, { error: 'claim_not_configured', granted: false });

  try {
    const result = await activateBundleForSignedInFamily({
      store,
      verificationStore,
      handoffSecret: deps.handoffSecret || readAcademyHandoff(cookieHeaderFrom(event)),
      ownerSecret: deps.ownerSecret || readOwnerCookie(cookieHeaderFrom(event)),
      now: deps.now,
      env: deps.env,
    });
    return jsonResponse(result.status || 503, publicActivationBody(result));
  } catch {
    return jsonResponse(503, { error: 'claim_unavailable', granted: false });
  }
}

exports.handleBundleClaim = handleBundleClaim;
exports.handler = function academyBundleClaim(event) {
  return handleBundleClaim(event);
};
