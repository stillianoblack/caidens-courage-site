const { resendConfigured } = require('./_lib/emailProvider');
const {
  approvedShippingRateIds,
  applyCheckoutShippingCountries,
  bundlePriceMatches,
  isReservedHistoricalPaymentLink,
  planBundleCheckout,
} = require('./_lib/academyMembership');
const {
  jsonResponse,
  createStripeBookstoreClient,
  getServiceClient,
  publicSiteOrigin,
} = require('./_lib/bookstoreDelivery');

const BUNDLE_KEYS = new Set([
  'courage_adventure_paperback_bundle',
  'courage_adventure_bundle',
]);

async function createBundleCheckoutSession({ secretKey, plan, successUrl, cancelUrl, automaticTax }) {
  const body = new URLSearchParams();
  body.set('mode', 'payment');
  body.set('line_items[0][price]', plan.priceId);
  body.set('line_items[0][quantity]', '1');
  body.set('success_url', successUrl);
  body.set('cancel_url', cancelUrl);
  body.set('billing_address_collection', 'required');
  applyCheckoutShippingCountries(body);
  plan.shippingRateIds.forEach((rateId, index) => {
    body.set(`shipping_options[${index}][shipping_rate]`, rateId);
  });
  if (automaticTax) body.set('automatic_tax[enabled]', 'true');
  body.set('metadata[purpose]', 'academy_bundle');
  body.set('metadata[product_key]', plan.productKey);
  body.set('metadata[product_title]', plan.title);
  body.set('metadata[amount_cents]', String(plan.amountCents));
  body.set('metadata[stripe_product_id]', plan.stripeProductId);
  body.set('metadata[fulfillment]', 'physical_bundle');
  body.set('metadata[academy_days]', String(plan.days));
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
    const error = new Error('checkout_failed');
    error.statusCode = 502;
    throw error;
  }
  return payload;
}

exports.handler = async function academyBundleCheckout(event) {
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'method_not_allowed' });
  let requestBody = {};
  try {
    requestBody = event.body ? JSON.parse(event.body) : {};
  } catch {
    return jsonResponse(400, { error: 'invalid_json' });
  }
  if (!BUNDLE_KEYS.has(requestBody.productKey) || requestBody.productKey === 'hardcover_bundle') {
    return jsonResponse(400, { error: 'unknown_product' });
  }

  const client = getServiceClient();
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!client || !stripeSecret) {
    return jsonResponse(503, { error: 'checkout_not_configured' });
  }

  const { data, error } = await client
    .from('commerce_products')
    .select('key, title, display_price_cents, currency, stripe_product_id, stripe_price_id, is_active, payment_link_verified_at, payment_link_url')
    .eq('key', requestBody.productKey)
    .maybeSingle();
  if (error) return jsonResponse(500, { error: 'catalog_unavailable' });
  if (isReservedHistoricalPaymentLink(data?.payment_link_url)) {
    return jsonResponse(409, { error: 'historical_record_locked' });
  }

  const plan = planBundleCheckout({
    secretKey: stripeSecret,
    salesEnabled: process.env.BOOKSTORE_BUNDLE_SALES_ENABLED === 'true',
    emailConfigured: resendConfigured(),
    shippingRateIds: approvedShippingRateIds(process.env.STRIPE_BUNDLE_SHIPPING_RATE_IDS),
    product: data
      ? {
          key: data.key,
          title: data.title,
          displayPriceCents: data.display_price_cents,
          currency: data.currency,
          stripePriceId: data.stripe_price_id,
          stripeProductId: data.stripe_product_id,
          isActive: data.is_active === true,
          paymentLinkVerifiedAt: data.payment_link_verified_at,
          paymentLinkUrl: data.payment_link_url,
        }
      : null,
  });
  if (!plan.ok) return jsonResponse(plan.status, { error: plan.reason, granted: false });

  const stripe = createStripeBookstoreClient(stripeSecret);
  try {
    const price = await stripe.retrievePrice(plan.priceId);
    if (!bundlePriceMatches(price, plan)) {
      return jsonResponse(409, { error: 'price_not_verified', granted: false });
    }
  } catch (priceError) {
    return jsonResponse(priceError.retryable ? 503 : 409, { error: 'price_not_verified', granted: false });
  }

  const origin = publicSiteOrigin().replace(/\/$/, '');
  try {
    const session = await createBundleCheckoutSession({
      secretKey: stripeSecret,
      plan,
      successUrl: `${origin}/story/books?bundle=submitted`,
      cancelUrl: `${origin}/story/books`,
      automaticTax: process.env.STRIPE_AUTOMATIC_TAX_ENABLED === 'true',
    });
    return jsonResponse(200, { url: session.url, granted: false });
  } catch {
    return jsonResponse(502, { error: 'checkout_failed', granted: false });
  }
};
