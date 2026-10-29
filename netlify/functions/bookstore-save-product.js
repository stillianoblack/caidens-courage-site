const { requireAdmin } = require('./_lib/adminAuth');
const {
  HISTORICAL_BUNDLE_KEY,
  planPaymentLinkActivation,
  createStripeBookstoreClient,
  jsonResponse,
} = require('./_lib/bookstoreDelivery');

function basePayload(body) {
  return {
    title: String(body.title || '').trim(),
    display_price_cents: body.displayPriceCents,
    currency: String(body.currency || '').trim().toLowerCase(),
    payment_link_url: body.paymentLinkUrl ? String(body.paymentLinkUrl).trim() : null,
    stripe_product_id: body.stripeProductId ? String(body.stripeProductId).trim() : null,
    stripe_price_id: body.stripePriceId ? String(body.stripePriceId).trim() : null,
    is_active: body.isActive === true,
  };
}

exports.handler = async function bookstoreSaveProduct(event) {
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'method_not_allowed' });
  const admin = await requireAdmin(event);
  if (admin.response) return admin.response;

  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return jsonResponse(400, { error: 'invalid_json' });
  }

  const key = typeof body.key === 'string' ? body.key.trim() : '';
  if (!key) return jsonResponse(400, { error: 'unknown_product' });
  if (key === HISTORICAL_BUNDLE_KEY || body.digitalSalesEnabled === true) {
    return jsonResponse(409, {
      error: key === HISTORICAL_BUNDLE_KEY ? 'historical_record_locked' : 'digital_sales_disabled',
      message: key === HISTORICAL_BUNDLE_KEY
        ? 'The historical hardcover bundle was left unchanged.'
        : 'Digital sales stay closed until delivery is approved.',
    });
  }

  const client = admin.context.supabase;
  const { data: current, error: readError } = await client
    .from('commerce_products')
    .select('*')
    .eq('key', key)
    .maybeSingle();
  if (readError) return jsonResponse(500, { error: 'catalog_unavailable' });

  const fulfillment = body.fulfillmentType || current?.fulfillment_type || 'physical';
  let verifiedPriceId = null;
  if (fulfillment !== 'digital') {
    let proof = null;
    const url = body.paymentLinkUrl ? String(body.paymentLinkUrl).trim() : '';
    const needsLookup = url.startsWith('https://buy.stripe.com/');
    const currentLink = current?.payment_link_url || '';
    const changed = !current
      || currentLink !== url
      || current.display_price_cents !== body.displayPriceCents
      || String(current.currency || '').toLowerCase() !== String(body.currency || '').toLowerCase()
      || current.is_active !== (body.isActive === true);
    if (needsLookup && changed && process.env.STRIPE_SECRET_KEY) {
      try {
        const link = await createStripeBookstoreClient(process.env.STRIPE_SECRET_KEY).findPaymentLink(url);
        proof = link ? { lineItems: link.line_items?.data || [] } : null;
      } catch (error) {
        console.error('[bookstore] Payment Link could not be verified.');
        return jsonResponse(error.retryable ? 503 : 409, {
          error: 'payment_link_not_verified',
          message: 'The Payment Link could not be verified, so checkout was not activated.',
        });
      }
    }
    const decision = planPaymentLinkActivation({
      key,
      displayPriceCents: body.displayPriceCents,
      currency: body.currency,
      paymentLinkUrl: body.paymentLinkUrl,
      isActive: body.isActive === true,
      current: current
        ? {
            paymentLinkUrl: current.payment_link_url,
            displayPriceCents: current.display_price_cents,
            currency: current.currency,
            isActive: current.is_active,
          }
        : null,
      proof,
    });
    if (!decision.ok) {
      return jsonResponse(409, {
        error: decision.reason,
        message: 'Checkout stays off until the Payment Link matches this product’s USD price.',
      });
    }
    verifiedPriceId = decision.verifiedPriceId || null;
  }

  const payload = {
    key,
    ...basePayload(body),
    ...(verifiedPriceId ? { stripe_price_id: verifiedPriceId, payment_link_verified_at: new Date().toISOString() } : {}),
    ...(body.availability
      ? {
          subtitle: body.subtitle || null,
          description: body.description || null,
          availability: body.availability,
          fulfillment_type: fulfillment,
          sort_order: body.sortOrder ?? 100,
          is_featured: Boolean(body.isFeatured),
          digital_sales_enabled: false,
          kindle_product_url: body.kindleProductUrl || null,
        }
      : {}),
  };

  let { error } = await client.from('commerce_products').upsert(payload, { onConflict: 'key' });
  if (error && payload.payment_link_verified_at && /payment_link_verified_at/.test(error.message || '')) {
    const withoutTimestamp = { ...payload };
    delete withoutTimestamp.payment_link_verified_at;
    ({ error } = await client.from('commerce_products').upsert(withoutTimestamp, { onConflict: 'key' }));
  }
  if (error) {
    console.error('[bookstore] Product save failed.');
    return jsonResponse(500, { error: 'save_failed', message: 'The product was not saved.' });
  }
  return jsonResponse(200, { ok: true });
};
