const { resendConfigured, sendBookstoreRecoveryEmail } = require('./_lib/emailProvider');
const {
  verifyStripeSignature,
  processBookstoreWebhookEvent,
  resolveRecoveryTtl,
  jsonResponse,
  createSupabaseBookstoreStore,
  createStripeBookstoreClient,
  getServiceClient,
  publicSiteOrigin,
} = require('./_lib/bookstoreDelivery');

exports.handler = async function bookstoreStripeWebhook(event) {
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'method_not_allowed' });

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64').toString('utf8')
    : event.body || '';
  const signature = event.headers?.['stripe-signature'] || event.headers?.['Stripe-Signature'];
  if (!secret || !verifyStripeSignature(rawBody, signature, secret)) {
    return jsonResponse(400, { error: 'invalid_signature' });
  }

  let stripeEvent;
  try {
    stripeEvent = JSON.parse(rawBody);
  } catch {
    return jsonResponse(400, { error: 'invalid_json' });
  }

  const client = getServiceClient();
  if (!client) return jsonResponse(503, { error: 'delivery_not_configured' });

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  try {
    const result = await processBookstoreWebhookEvent({
      event: stripeEvent,
      store: createSupabaseBookstoreStore(client),
      stripe: stripeSecret ? createStripeBookstoreClient(stripeSecret) : null,
      mailer: resendConfigured() ? { send: sendBookstoreRecoveryEmail } : null,
      origin: publicSiteOrigin(),
      recoveryTtlSeconds: resolveRecoveryTtl(process.env.BOOKSTORE_RECOVERY_TOKEN_TTL_SECONDS),
    });
    return jsonResponse(result.httpStatus, { outcome: result.outcome, granted: result.granted === true });
  } catch (error) {
    console.error('[bookstore] Webhook fulfillment failed.');
    return jsonResponse(500, { error: 'fulfillment_failed' });
  }
};
