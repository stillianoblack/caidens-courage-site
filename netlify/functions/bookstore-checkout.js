const { resendConfigured } = require('./_lib/emailProvider');
const {
  DIGITAL_PRODUCT_KEY,
  createRecoveryCode,
  hashRecoveryCode,
  planDigitalCheckout,
  verifyConfiguredPrice,
  jsonResponse,
  createSupabaseBookstoreStore,
  createStripeBookstoreClient,
  getServiceClient,
  digitalSalesEnvEnabled,
  publicSiteOrigin,
} = require('./_lib/bookstoreDelivery');

async function createStripeCheckoutSession({ secretKey, plan, successUrl, cancelUrl }) {
  const body = new URLSearchParams();
  body.set('mode', 'payment');
  body.set('line_items[0][price]', plan.priceId);
  body.set('line_items[0][quantity]', '1');
  body.set('success_url', successUrl);
  body.set('cancel_url', cancelUrl);
  body.set('metadata[product_key]', plan.productKey);
  body.set('metadata[product_title]', plan.title);
  body.set('metadata[amount_cents]', String(plan.amountCents));
  body.set('client_reference_id', plan.productKey);

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  const payload = await response.json();
  if (!response.ok) {
    const message = payload?.error?.message || 'Stripe could not start checkout.';
    const error = new Error(message);
    error.statusCode = 502;
    throw error;
  }
  return payload;
}

exports.handler = async function bookstoreCheckout(event) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'method_not_allowed' });
  }

  let requestBody = {};
  try {
    requestBody = event.body ? JSON.parse(event.body) : {};
  } catch {
    return jsonResponse(400, { error: 'invalid_json' });
  }

  if (requestBody.productKey !== DIGITAL_PRODUCT_KEY) {
    return jsonResponse(400, { error: 'unknown_product' });
  }

  const client = getServiceClient();
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!client || !stripeSecret) {
    return jsonResponse(503, { error: 'checkout_not_configured', message: 'Digital checkout is not configured yet.' });
  }

  const { data, error } = await client
    .from('commerce_products')
    .select('key, title, display_price_cents, currency, stripe_price_id, digital_sales_enabled, is_active')
    .eq('key', DIGITAL_PRODUCT_KEY)
    .maybeSingle();
  if (error) return jsonResponse(500, { error: 'catalog_unavailable' });

  const plan = planDigitalCheckout({
    envEnabled: digitalSalesEnvEnabled(),
    emailConfigured: resendConfigured(),
    product: data
      ? {
          key: data.key,
          title: data.title,
          displayPriceCents: data.display_price_cents,
          currency: data.currency,
          stripePriceId: data.stripe_price_id,
          digitalSalesEnabled: data.digital_sales_enabled === true && data.is_active === true,
        }
      : null,
  });
  if (!plan.ok) {
    return jsonResponse(plan.status, {
      error: plan.reason,
      message: plan.reason === 'digital_sales_disabled'
        ? 'Digital sales are not open yet.'
        : 'Digital checkout is not configured yet.',
    });
  }

  const stripe = createStripeBookstoreClient(stripeSecret);
  try {
    const price = await stripe.retrievePrice(plan.priceId);
    const priceCheck = verifyConfiguredPrice({ price, priceId: plan.priceId, amountCents: plan.amountCents });
    if (!priceCheck.ok) {
      return jsonResponse(409, { error: priceCheck.reason, message: 'Digital checkout is not configured yet.' });
    }
  } catch (priceError) {
    console.error('[bookstore] Stripe price could not be verified.');
    return jsonResponse(priceError.retryable ? 503 : 409, { error: 'price_not_verified' });
  }

  const origin = publicSiteOrigin().replace(/\/$/, '');
  const recoverySecret = createRecoveryCode();
  let session;
  try {
    session = await createStripeCheckoutSession({
      secretKey: stripeSecret,
      plan,
      successUrl: `${origin}/story/books/download?checkout=success`,
      cancelUrl: `${origin}/story/books`,
    });
  } catch (checkoutError) {
    console.error('[bookstore] Stripe checkout session was not created.');
    return jsonResponse(checkoutError.statusCode || 502, { error: 'checkout_failed' });
  }

  try {
    const store = createSupabaseBookstoreStore(client);
    await store.saveIntent({
      stripeCheckoutSessionId: session.id,
      productKey: plan.productKey,
      productTitleSnapshot: plan.title,
      amountCents: plan.amountCents,
      currency: plan.currency,
      stripePriceId: plan.priceId,
      recoveryCodeHash: hashRecoveryCode(recoverySecret),
    });
  } catch (intentError) {
    console.error('[bookstore] Checkout intent was not saved.');
    return jsonResponse(500, { error: 'checkout_not_recorded' });
  }

  return jsonResponse(200, { url: session.url });
};
