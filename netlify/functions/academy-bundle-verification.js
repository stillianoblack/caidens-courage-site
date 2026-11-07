const { jsonResponse } = require('./_lib/bookstoreDelivery');
const { createActivationServiceClient } = require('./_lib/activationPreviewGuard');
const { createSupabaseBundleStore } = require('./_lib/academyBundleStore');
const { cookieHeaderFrom, readAcademyHandoff } = require('./_lib/academyBundleActivation');
const {
  confirmActivationVerification,
  createSupabaseVerificationStore,
  sendActivationVerification,
} = require('./_lib/academyActivationVerification');
const { sendAcademyVerificationEmail } = require('./_lib/emailProvider');

function responseFor(result) {
  const response = jsonResponse(result?.status || 503, {
    error: result?.ok ? undefined : (result?.reason || 'verification_unavailable'),
    sent: Boolean(result?.sent),
    verified: Boolean(result?.verified),
    granted: false,
  });
  if (!result?.ok) {
    response.body = JSON.stringify({
      error: result?.reason || 'verification_unavailable',
      granted: false,
    });
  }
  if (result?.cookie) response.headers['Set-Cookie'] = result.cookie;
  return response;
}

async function handleBundleVerification(event, deps = {}) {
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'method_not_allowed', granted: false });
  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return jsonResponse(400, { error: 'invalid_json', granted: false });
  }

  const client = deps.store ? null : createActivationServiceClient(deps.env);
  const store = deps.store || (client ? createSupabaseBundleStore(client) : null);
  const verificationStore = deps.verificationStore || (client ? createSupabaseVerificationStore(client) : null);
  if (!store || !verificationStore) return jsonResponse(503, { error: 'verification_unavailable', granted: false });

  const handoffSecret = deps.handoffSecret || readAcademyHandoff(cookieHeaderFrom(event));
  const action = body.action === 'confirm' ? 'confirm' : body.action === 'send' ? 'send' : '';
  if (!action) return jsonResponse(400, { error: 'invalid_request', granted: false });

  try {
    const result = action === 'send'
      ? await sendActivationVerification({
        store,
        verificationStore,
        handoffSecret,
        familyAccessCode: body.familyAccessCode,
        now: deps.now,
        env: deps.env,
        mailer: deps.mailer || { send: sendAcademyVerificationEmail },
        code: deps.code,
      })
      : await confirmActivationVerification({
        store,
        verificationStore,
        handoffSecret,
        code: body.code,
        now: deps.now,
        authorizationSecret: deps.authorizationSecret,
      });
    return responseFor(result);
  } catch {
    return jsonResponse(503, { error: 'verification_unavailable', granted: false });
  }
}

exports.handleBundleVerification = handleBundleVerification;
exports.handler = function academyBundleVerification(event) {
  return handleBundleVerification(event);
};
