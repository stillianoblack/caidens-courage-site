const { getServiceClient, jsonResponse } = require('./_lib/bookstoreDelivery');
const { decryptClaimCode, normalizeEmail } = require('./_lib/academyMembership');

exports.handler = async function academyBundleCode(event) {
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'method_not_allowed' });
  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return jsonResponse(400, { error: 'invalid_json' });
  }
  const email = normalizeEmail(body.parentEmail);
  const programCode = String(body.programCode || '').trim();
  const secret = process.env.ACADEMY_CLAIM_CODE_KEY;
  if (!email || !programCode) return jsonResponse(400, { error: 'invalid_request' });
  if (!secret) return jsonResponse(409, { error: 'claim_code_unavailable' });

  const client = getServiceClient();
  if (!client) return jsonResponse(503, { error: 'claim_not_configured' });
  const programResult = await client
    .from('pilot_programs')
    .select('admin_email')
    .eq('program_code', programCode)
    .maybeSingle();
  if (!programResult.data || normalizeEmail(programResult.data.admin_email) !== email) {
    return jsonResponse(403, { error: 'email_mismatch' });
  }
  const claimResult = await client
    .from('academy_bundle_claims')
    .select('claim_code_ciphertext, customer_email, activated_at, claim_deadline_at')
    .eq('customer_email', email)
    .is('activated_at', null)
    .order('purchase_verified_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  const claim = claimResult.data;
  if (!claim) return jsonResponse(404, { error: 'claim_not_found' });
  if (claim.claim_deadline_at && new Date(claim.claim_deadline_at).getTime() < Date.now()) {
    return jsonResponse(409, { error: 'unclaimed_offer_expired' });
  }
  const claimCode = decryptClaimCode(claim.claim_code_ciphertext, secret);
  if (!claimCode) return jsonResponse(409, { error: 'claim_code_unavailable' });
  return jsonResponse(200, { claimCode });
};
