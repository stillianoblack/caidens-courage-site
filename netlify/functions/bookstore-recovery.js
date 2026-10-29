const { resendConfigured, sendBookstoreRecoveryEmail } = require('./_lib/emailProvider');
const {
  RECOVERY_PUBLIC_MESSAGE,
  requestBookstoreRecovery,
  resolveRecoveryTtl,
  jsonResponse,
  createSupabaseBookstoreStore,
  getServiceClient,
  publicSiteOrigin,
  clientIp,
} = require('./_lib/bookstoreDelivery');

exports.handler = async function bookstoreRecovery(event) {
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'method_not_allowed' });

  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return jsonResponse(200, { message: RECOVERY_PUBLIC_MESSAGE });
  }

  const email = typeof body.email === 'string' ? body.email : '';
  const client = getServiceClient();
  if (!client || !resendConfigured()) {
    return jsonResponse(200, { message: RECOVERY_PUBLIC_MESSAGE });
  }

  try {
    const result = await requestBookstoreRecovery({
      email,
      ip: clientIp(event),
      store: createSupabaseBookstoreStore(client),
      mailer: { send: sendBookstoreRecoveryEmail },
      origin: publicSiteOrigin(),
      ttlSeconds: resolveRecoveryTtl(process.env.BOOKSTORE_RECOVERY_TOKEN_TTL_SECONDS),
    });
    return jsonResponse(result.statusCode, result.body);
  } catch (error) {
    console.error('[bookstore] Recovery request failed.');
    return jsonResponse(200, { message: RECOVERY_PUBLIC_MESSAGE });
  }
};
