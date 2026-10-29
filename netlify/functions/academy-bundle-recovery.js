const { sendAcademyClaimEmail } = require('./_lib/emailProvider');
const { getServiceClient, jsonResponse, publicSiteOrigin } = require('./_lib/bookstoreDelivery');
const { createInvitationToken, hashClaimCode, normalizeEmail } = require('./_lib/academyMembership');

const PUBLIC_MESSAGE = 'If an unclaimed Academy invitation matches that email, a new one-time link is on its way.';

exports.handler = async function academyBundleRecovery(event) {
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'method_not_allowed' });
  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return jsonResponse(400, { error: 'invalid_json' });
  }
  const email = normalizeEmail(body.email);
  if (!email) return jsonResponse(400, { error: 'invalid_request' });
  const client = getServiceClient();
  if (!client) return jsonResponse(200, { message: PUBLIC_MESSAGE });

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const recent = await client
    .from('academy_claim_tokens')
    .select('id, academy_bundle_claims!inner(customer_email)')
    .eq('purpose', 'invitation')
    .gte('created_at', since)
    .eq('academy_bundle_claims.customer_email', email);
  if (!recent.error && (recent.data || []).length >= 5) {
    return jsonResponse(200, { message: PUBLIC_MESSAGE });
  }

  const claimResult = await client
    .from('academy_bundle_claims')
    .select('id, product_key, duration_days, claim_deadline_at, activated_at')
    .eq('customer_email', email)
    .is('activated_at', null)
    .order('purchase_verified_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  const claim = claimResult.data;
  if (!claim || new Date(claim.claim_deadline_at).getTime() <= Date.now()) {
    return jsonResponse(200, { message: PUBLIC_MESSAGE });
  }

  const token = createInvitationToken();
  const { error } = await client.from('academy_claim_tokens').insert({
    claim_id: claim.id,
    purpose: 'invitation',
    token_hash: hashClaimCode(token),
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  });
  if (error) return jsonResponse(200, { message: PUBLIC_MESSAGE });

  const origin = publicSiteOrigin().replace(/\/$/, '');
  const sent = await sendAcademyClaimEmail({
    to: email,
    claimUrl: `${origin}/story/books/claim#token=${encodeURIComponent(token)}`,
    days: claim.duration_days,
    productTitle: claim.product_key === 'courage_adventure_bundle' ? 'Signature Reserve Hardcover Bundle' : 'Paperback Adventure Bundle',
    idempotencyKey: `academy-bundle-recovery-${claim.id}-${hashClaimCode(token).slice(0, 12)}`,
  });
  if (!sent.success) {
    return jsonResponse(503, { error: 'invitation_email_failed', message: PUBLIC_MESSAGE });
  }
  return jsonResponse(200, { message: PUBLIC_MESSAGE });
};
