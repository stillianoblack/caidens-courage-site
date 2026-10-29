const { requireAdmin } = require('./_lib/adminAuth');
const { sendAcademyClaimEmail } = require('./_lib/emailProvider');
const { jsonResponse, publicSiteOrigin } = require('./_lib/bookstoreDelivery');
const { createInvitationToken, hashClaimCode } = require('./_lib/academyMembership');

const BUNDLE_KEYS = ['courage_adventure_paperback_bundle', 'courage_adventure_bundle'];

function publicOrder(order, fulfillment, claim) {
  return {
    orderId: order.id,
    productKey: order.product_key,
    title: order.product_title_snapshot,
    amountCents: order.amount_cents,
    currency: order.currency,
    customerEmail: order.customer_email,
    status: order.status,
    createdAt: order.created_at,
    shipping: fulfillment
      ? {
          name: fulfillment.shipping_name,
          line1: fulfillment.shipping_line1,
          line2: fulfillment.shipping_line2,
          city: fulfillment.shipping_city,
          state: fulfillment.shipping_state,
          postalCode: fulfillment.shipping_postal_code,
          country: fulfillment.shipping_country,
          method: fulfillment.shipping_method_label,
          shippingCents: fulfillment.shipping_cents,
          taxCents: fulfillment.tax_cents,
          fulfillmentStatus: fulfillment.fulfillment_status,
        }
      : null,
    invitationSent: Boolean(claim?.invitation_sent_at),
    invitationClaimed: Boolean(claim?.activated_at),
  };
}

exports.handler = async function academyBundleAdmin(event) {
  const admin = await requireAdmin(event);
  if (admin.response) return admin.response;
  const client = admin.context.supabase;

  if (event.httpMethod === 'GET') {
    const ordersResult = await client
      .from('bookstore_orders')
      .select('id, product_key, product_title_snapshot, amount_cents, currency, customer_email, status, created_at, stripe_checkout_session_id')
      .in('product_key', BUNDLE_KEYS)
      .order('created_at', { ascending: false })
      .limit(100);
    if (ordersResult.error) {
      const missing = ordersResult.error.code === '42P01';
      return jsonResponse(200, { orders: [], migrationApplied: !missing });
    }
    const orders = ordersResult.data || [];
    const orderIds = orders.map((order) => order.id);
    const sessionIds = orders.map((order) => order.stripe_checkout_session_id).filter(Boolean);
    const fulfillmentResult = orderIds.length
      ? await client.from('bookstore_order_fulfillment').select('order_id, shipping_name, shipping_line1, shipping_line2, shipping_city, shipping_state, shipping_postal_code, shipping_country, shipping_method_label, shipping_cents, tax_cents, fulfillment_status').in('order_id', orderIds)
      : { data: [] };
    const claimResult = sessionIds.length
      ? await client.from('academy_bundle_claims').select('checkout_session_id, invitation_sent_at, activated_at').in('checkout_session_id', sessionIds)
      : { data: [] };
    const fulfillmentByOrder = new Map((fulfillmentResult.data || []).map((row) => [row.order_id, row]));
    const claimBySession = new Map((claimResult.data || []).map((row) => [row.checkout_session_id, row]));
    return jsonResponse(200, {
      migrationApplied: true,
      orders: orders.map((order) => publicOrder(order, fulfillmentByOrder.get(order.id), claimBySession.get(order.stripe_checkout_session_id))),
    });
  }

  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'method_not_allowed' });
  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return jsonResponse(400, { error: 'invalid_json' });
  }
  const orderId = String(body.orderId || '').trim();
  if (!orderId) return jsonResponse(400, { error: 'invalid_request' });
  const orderResult = await client
    .from('bookstore_orders')
    .select('id, product_key, customer_email, status, stripe_checkout_session_id')
    .eq('id', orderId)
    .maybeSingle();
  if (orderResult.error || !orderResult.data || !BUNDLE_KEYS.includes(orderResult.data.product_key) || orderResult.data.status !== 'paid') {
    return jsonResponse(404, { error: 'order_not_found' });
  }
  const claimResult = await client
    .from('academy_bundle_claims')
    .select('id, duration_days, product_key, activated_at, customer_email')
    .eq('checkout_session_id', orderResult.data.stripe_checkout_session_id)
    .maybeSingle();
  if (!claimResult.data || claimResult.data.activated_at) return jsonResponse(409, { error: 'invitation_not_resendable' });
  if (claimResult.data.customer_email !== orderResult.data.customer_email) return jsonResponse(409, { error: 'email_mismatch' });

  const token = createInvitationToken();
  const { error } = await client.from('academy_claim_tokens').insert({
    claim_id: claimResult.data.id,
    purpose: 'invitation',
    token_hash: hashClaimCode(token),
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  });
  if (error) return jsonResponse(500, { error: 'invitation_not_saved' });
  const origin = publicSiteOrigin().replace(/\/$/, '');
  const sent = await sendAcademyClaimEmail({
    to: orderResult.data.customer_email,
    claimUrl: `${origin}/story/books/claim#token=${encodeURIComponent(token)}`,
    days: claimResult.data.duration_days,
    productTitle: claimResult.data.product_key,
    idempotencyKey: `academy-bundle-admin-${claimResult.data.id}-${hashClaimCode(token).slice(0, 12)}`,
  });
  if (!sent.success) return jsonResponse(503, { error: 'invitation_email_failed' });
  await client.from('academy_bundle_claims').update({ invitation_sent_at: new Date().toISOString() }).eq('id', claimResult.data.id);
  return jsonResponse(200, { sent: true });
};
