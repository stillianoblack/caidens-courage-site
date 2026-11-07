const {
  addDays,
  hashClaimCode,
  normalizeEmail,
  planBundleClaim,
  planClaimTokenUse,
} = require('./academyMembership');
const { recoveredClaimLocked } = require('./activationPreviewGuard');

const ACADEMY_HANDOFF_COOKIE = 'cc_academy_handoff';
const ACADEMY_HANDOFF_TTL_SECONDS = 30 * 60;

function createHandoffSecret() {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('base64url');
}

function buildAcademyHandoffCookie(secret, { secure = true } = {}) {
  const parts = [
    `${ACADEMY_HANDOFF_COOKIE}=${encodeURIComponent(secret)}`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/',
    `Max-Age=${ACADEMY_HANDOFF_TTL_SECONDS}`,
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

function readAcademyHandoff(cookieHeader) {
  const source = Array.isArray(cookieHeader) ? cookieHeader.join('; ') : String(cookieHeader || '');
  for (const part of source.split(';')) {
    const trimmed = part.trim();
    const separator = trimmed.indexOf('=');
    if (separator <= 0) continue;
    if (trimmed.slice(0, separator) !== ACADEMY_HANDOFF_COOKIE) continue;
    try {
      return decodeURIComponent(trimmed.slice(separator + 1));
    } catch {
      return '';
    }
  }
  return '';
}

function cookieHeaderFrom(event) {
  const headers = event?.headers || {};
  const direct = headers.cookie || headers.Cookie;
  if (direct) return direct;
  const multi = event?.multiValueHeaders?.cookie || event?.multiValueHeaders?.Cookie;
  return multi || '';
}

function planInvitationHandoff({ tokenRow, claim, now = new Date() } = {}) {
  if (!tokenRow || tokenRow.purpose !== 'invitation') return { ok: false, reason: 'token_invalid' };
  if (!tokenRow.expiresAt || new Date(tokenRow.expiresAt).getTime() <= now.getTime()) {
    return { ok: false, reason: 'token_expired' };
  }
  if (!claim) return { ok: false, reason: 'claim_not_found' };
  if (claim.activatedAt) return { ok: false, reason: 'already_claimed' };
  if (claim.claimDeadlineAt && new Date(claim.claimDeadlineAt).getTime() <= now.getTime()) {
    return { ok: false, reason: 'offer_expired' };
  }
  return { ok: true };
}

function planAuthenticatedFamilyActivation({
  program,
  parentEmail,
  claim,
  orderStatus = 'paid',
  now = new Date(),
} = {}) {
  const email = normalizeEmail(parentEmail);
  const owner = normalizeEmail(program?.adminEmail);
  const purchaser = normalizeEmail(claim?.customerEmail);
  if (!program?.id || !email || !owner || !purchaser || email !== owner || email !== purchaser) {
    return { ok: false, reason: 'email_mismatch' };
  }
  return planBundleClaim({
    order: {
      proof: 'stripe_webhook',
      status: orderStatus,
      customerEmail: claim.customerEmail,
      productKey: claim.productKey,
      paidAt: claim.purchaseVerifiedAt,
      claimDeadlineAt: claim.claimDeadlineAt,
    },
    parentEmail: email,
    existingClaim: claim.activatedAt
      ? { activatedAt: claim.activatedAt, entitlementId: claim.entitlementId }
      : null,
    now,
  });
}

function duplicateActivation(claim) {
  return {
    ok: true,
    status: 200,
    granted: true,
    duplicate: true,
    startsAt: claim?.activatedAt || null,
    endsAt: null,
    progressRetained: true,
  };
}

async function establishBundleHandoff({
  store,
  invitationToken,
  now = new Date(),
  secret = createHandoffSecret(),
  secure = true,
} = {}) {
  const presented = String(invitationToken || '').trim();
  if (!presented) return { ok: false, status: 400, reason: 'invalid_request' };
  const token = await store.tokenByHash(hashClaimCode(presented));
  const claim = token ? await store.claimById(token.claimId) : null;
  const decision = planInvitationHandoff({
    tokenRow: token,
    claim,
    now,
  });
  if (!decision.ok) {
    return { ok: false, status: decision.reason === 'claim_not_found' ? 404 : 409, reason: decision.reason };
  }
  const expiresAt = new Date(now.getTime() + ACADEMY_HANDOFF_TTL_SECONDS * 1000).toISOString();
  await store.insertActivationToken({
    claimId: claim.id,
    tokenHash: hashClaimCode(secret),
    expiresAt,
  });
  return {
    ok: true,
    status: 200,
    granted: false,
    ready: true,
    days: claim.durationDays,
    productKey: claim.productKey,
    cookie: buildAcademyHandoffCookie(secret, { secure }),
  };
}

async function readBundleHandoff({ store, handoffSecret, now = new Date() } = {}) {
  const presented = String(handoffSecret || '').trim();
  if (!presented) return { ok: false, status: 409, reason: 'token_invalid' };
  const token = await store.tokenByHash(hashClaimCode(presented));
  if (!token || token.purpose !== 'activation') return { ok: false, status: 409, reason: 'token_invalid' };
  const claim = await store.claimById(token.claimId);
  if (!claim) return { ok: false, status: 404, reason: 'claim_not_found' };
  if (claim.activatedAt) return duplicateActivation(claim);
  const decision = planClaimTokenUse({
    tokenRow: token,
    now,
    purpose: 'activation',
  });
  if (!decision.ok) return { ok: false, status: 409, reason: decision.reason };
  if (claim.claimDeadlineAt && new Date(claim.claimDeadlineAt).getTime() <= now.getTime()) {
    return { ok: false, status: 409, reason: 'offer_expired' };
  }
  return {
    ok: true,
    status: 200,
    granted: false,
    ready: true,
    days: claim.durationDays,
    productKey: claim.productKey,
  };
}

async function activateBundleForSignedInFamily({
  store,
  verificationStore,
  handoffSecret,
  ownerSecret,
  now = new Date(),
  env = process.env,
} = {}) {
  const presented = String(handoffSecret || '').trim();
  const owner = String(ownerSecret || '').trim();
  if (!presented) return { ok: false, status: 400, reason: 'invalid_request' };
  if (!verificationStore || typeof verificationStore.consumeAuthorization !== 'function') {
    return { ok: false, status: 503, reason: 'verification_unavailable', granted: false };
  }

  const token = await store.tokenByHash(hashClaimCode(presented));
  if (!token || token.purpose !== 'activation') return { ok: false, status: 409, reason: 'token_invalid' };
  const claim = await store.claimById(token.claimId);
  if (!claim) return { ok: false, status: 404, reason: 'claim_not_found' };
  if (recoveredClaimLocked(claim, env)) {
    return { ok: false, status: 409, reason: 'recovered_claim_locked', granted: false };
  }
  if (claim.productKey === 'hardcover_bundle') {
    return { ok: false, status: 409, reason: 'historical_record_locked' };
  }
  if (claim.activatedAt) return duplicateActivation(claim);

  const handoff = planClaimTokenUse({ tokenRow: token, now, purpose: 'activation' });
  if (!handoff.ok) return { ok: false, status: 409, reason: handoff.reason };

  let familyProgramId = null;
  try {
    familyProgramId = owner
      ? await verificationStore.consumeAuthorization({
        claimId: claim.id,
        authorizationHash: hashClaimCode(owner),
        now,
      })
      : null;
  } catch {
    return { ok: false, status: 503, reason: 'verification_unavailable', granted: false };
  }
  if (!familyProgramId) {
    return { ok: false, status: 409, reason: 'verification_required', granted: false };
  }

  const order = claim.checkoutSessionId ? await store.orderBySession(claim.checkoutSessionId) : null;
  if (!order) return { ok: false, status: 409, reason: 'purchase_not_verified' };
  if (order.productKey === 'hardcover_bundle') {
    return { ok: false, status: 409, reason: 'historical_record_locked' };
  }

  const program = await store.familyById(familyProgramId);
  const email = normalizeEmail(claim.customerEmail);
  const decision = planAuthenticatedFamilyActivation({
    program,
    parentEmail: email,
    claim,
    orderStatus: order.status,
    now,
  });
  if (!decision.ok) return { ok: false, status: 409, reason: decision.reason };
  if (decision.duplicate) return duplicateActivation(claim);

  const existing = await store.activeEntitlementForOrder(claim.checkoutSessionId);
  if (existing) {
    await store.activateClaim({
      claimId: claim.id,
      entitlementId: existing.id,
      activatedAt: existing.startsAt || decision.startsAt,
    });
    await store.markTokenUsed(token.id, decision.startsAt);
    return duplicateActivation({ activatedAt: existing.startsAt || decision.startsAt });
  }

  const entitlement = await store.insertEntitlement({
    familyProgramId: program.id,
    customerEmail: email,
    kind: 'bundle_included',
    status: 'active',
    startsAt: decision.startsAt,
    endsAt: decision.endsAt,
    productKey: claim.productKey,
    orderReference: claim.checkoutSessionId,
  });
  const claimed = await store.activateClaim({
    claimId: claim.id,
    entitlementId: entitlement.id,
    activatedAt: decision.startsAt,
  });
  if (!claimed) {
    await store.cancelEntitlement(entitlement.id);
    return duplicateActivation(claim);
  }
  await store.markTokenUsed(token.id, decision.startsAt);
  return {
    ok: true,
    status: 200,
    granted: true,
    duplicate: false,
    startsAt: decision.startsAt,
    endsAt: decision.endsAt,
    progressRetained: true,
  };
}

function publicActivationBody(result) {
  if (!result?.ok) return { error: result?.reason || 'claim_unavailable', granted: false };
  if (result.granted) {
    return {
      granted: true,
      duplicate: Boolean(result.duplicate),
      startsAt: result.startsAt,
      endsAt: result.endsAt,
      progressRetained: true,
    };
  }
  return {
    granted: false,
    ready: true,
    days: result.days,
    productKey: result.productKey,
  };
}

function expectedEndsAt(now, days) {
  return addDays(now, days).toISOString();
}

module.exports = {
  ACADEMY_HANDOFF_COOKIE,
  ACADEMY_HANDOFF_TTL_SECONDS,
  createHandoffSecret,
  buildAcademyHandoffCookie,
  readAcademyHandoff,
  cookieHeaderFrom,
  planInvitationHandoff,
  planAuthenticatedFamilyActivation,
  establishBundleHandoff,
  readBundleHandoff,
  activateBundleForSignedInFamily,
  publicActivationBody,
  expectedEndsAt,
};
