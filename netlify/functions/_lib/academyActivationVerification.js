const crypto = require('crypto');
const { hashClaimCode, normalizeEmail } = require('./academyMembership');
const { recoveredClaimLocked } = require('./activationPreviewGuard');

const OWNER_COOKIE = 'cc_academy_owner';
const CODE_TTL_MS = 10 * 60 * 1000;
const AUTHORIZATION_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_SENDS_PER_HOUR = 3;
const RESEND_COOLDOWN_MS = 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

function unavailable(reason = 'verification_unavailable') {
  const failure = new Error(reason);
  failure.status = 503;
  failure.reason = reason;
  return failure;
}

function generateVerificationCode() {
  return String(crypto.randomInt(0, 100_000_000)).padStart(8, '0');
}

function createAuthorizationSecret() {
  return crypto.randomBytes(32).toString('base64url');
}

function normalizeVerificationCode(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length === 8 ? digits : '';
}

function buildOwnerCookie(secret, { secure = true } = {}) {
  const parts = [
    `${OWNER_COOKIE}=${encodeURIComponent(secret)}`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/',
    'Max-Age=600',
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

function readOwnerCookie(cookieHeader) {
  const source = Array.isArray(cookieHeader) ? cookieHeader.join('; ') : String(cookieHeader || '');
  for (const part of source.split(';')) {
    const trimmed = part.trim();
    const separator = trimmed.indexOf('=');
    if (separator <= 0) continue;
    if (trimmed.slice(0, separator) !== OWNER_COOKIE) continue;
    try {
      return decodeURIComponent(trimmed.slice(separator + 1));
    } catch {
      return '';
    }
  }
  return '';
}

function createMemoryVerificationStore() {
  const rows = [];
  return {
    rows,
    async issueVerification({ claimId, familyProgramId, codeHash, now }) {
      const recent = rows.filter((row) => (
        row.claimId === claimId
        && new Date(row.createdAt).getTime() > now.getTime() - HOUR_MS
      ));
      if (recent.length >= MAX_SENDS_PER_HOUR) return 'resend_limited';
      const latest = recent.reduce((current, row) => (
        !current || row.createdAt > current.createdAt ? row : current
      ), null);
      if (latest && new Date(latest.createdAt).getTime() > now.getTime() - RESEND_COOLDOWN_MS) {
        return 'resend_limited';
      }
      rows.forEach((row) => {
        if (row.claimId === claimId && !row.codeConsumedAt) row.codeConsumedAt = now.toISOString();
      });
      rows.push({
        id: `verification-${rows.length + 1}`,
        claimId,
        familyProgramId,
        codeHash,
        expiresAt: new Date(now.getTime() + CODE_TTL_MS).toISOString(),
        attemptCount: 0,
        codeConsumedAt: null,
        authorizationHash: null,
        authorizationExpiresAt: null,
        authorizationConsumedAt: null,
        createdAt: now.toISOString(),
      });
      return 'issued';
    },
    async consumeVerificationCode({ claimId, codeHash, authorizationHash, now }) {
      const open = rows
        .filter((row) => row.claimId === claimId && !row.codeConsumedAt)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
      if (!open) {
        const reused = rows.some((row) => row.claimId === claimId && row.codeHash === codeHash && row.codeConsumedAt);
        return { outcome: reused ? 'reused' : 'expired' };
      }
      if (new Date(open.expiresAt).getTime() <= now.getTime()) {
        open.codeConsumedAt = now.toISOString();
        return { outcome: 'expired' };
      }
      if (open.attemptCount >= MAX_ATTEMPTS) {
        open.codeConsumedAt = now.toISOString();
        return { outcome: 'attempts_exhausted' };
      }
      if (open.codeHash !== codeHash) {
        open.attemptCount += 1;
        if (open.attemptCount >= MAX_ATTEMPTS) open.codeConsumedAt = now.toISOString();
        return { outcome: 'incorrect' };
      }
      open.codeConsumedAt = now.toISOString();
      open.authorizationHash = authorizationHash;
      open.authorizationExpiresAt = new Date(now.getTime() + AUTHORIZATION_TTL_MS).toISOString();
      return { outcome: 'verified', familyProgramId: open.familyProgramId };
    },
    async consumeAuthorization({ claimId, authorizationHash, now }) {
      const row = rows.find((item) => (
        item.claimId === claimId
        && item.authorizationHash === authorizationHash
        && item.codeConsumedAt
        && !item.authorizationConsumedAt
        && item.authorizationExpiresAt
        && new Date(item.authorizationExpiresAt).getTime() > now.getTime()
      ));
      if (!row) return null;
      row.authorizationConsumedAt = now.toISOString();
      return row.familyProgramId;
    },
    async revokeVerification({ claimId, codeHash, now }) {
      const row = rows.find((item) => item.claimId === claimId && item.codeHash === codeHash && !item.codeConsumedAt);
      if (!row) return false;
      row.codeConsumedAt = now.toISOString();
      return true;
    },
  };
}

function createSupabaseVerificationStore(client) {
  return {
    async issueVerification({ claimId, familyProgramId, codeHash, now }) {
      const result = await client.rpc('issue_academy_activation_code', {
        p_claim_id: claimId,
        p_family_program_id: familyProgramId,
        p_code_hash: codeHash,
        p_now: now.toISOString(),
      });
      if (result.error || typeof result.data !== 'string') throw unavailable();
      return result.data;
    },
    async consumeVerificationCode({ claimId, codeHash, authorizationHash, now }) {
      const result = await client.rpc('consume_academy_activation_code', {
        p_claim_id: claimId,
        p_code_hash: codeHash,
        p_authorization_hash: authorizationHash,
        p_now: now.toISOString(),
      });
      if (result.error || !result.data || typeof result.data !== 'object') throw unavailable();
      return {
        outcome: result.data.outcome,
        familyProgramId: result.data.familyProgramId || null,
      };
    },
    async consumeAuthorization({ claimId, authorizationHash, now }) {
      const result = await client.rpc('consume_academy_activation_authorization', {
        p_claim_id: claimId,
        p_authorization_hash: authorizationHash,
        p_now: now.toISOString(),
      });
      if (result.error) throw unavailable();
      return result.data || null;
    },
    async revokeVerification({ claimId, codeHash, now }) {
      const result = await client.rpc('revoke_academy_activation_code', {
        p_claim_id: claimId,
        p_code_hash: codeHash,
        p_now: now.toISOString(),
      });
      if (result.error) throw unavailable();
      return result.data === true;
    },
  };
}

async function readyClaim({ store, handoffSecret, now }) {
  const presented = String(handoffSecret || '').trim();
  if (!presented) return { ok: false, status: 409, reason: 'token_invalid' };
  const token = await store.tokenByHash(hashClaimCode(presented));
  if (!token || token.purpose !== 'activation') return { ok: false, status: 409, reason: 'token_invalid' };
  const claim = await store.claimById(token.claimId);
  if (!claim) return { ok: false, status: 404, reason: 'claim_not_found' };
  if (claim.activatedAt) return { ok: false, status: 409, reason: 'already_claimed', claim };
  if (token.usedAt || !token.expiresAt || new Date(token.expiresAt).getTime() <= now.getTime()) {
    return { ok: false, status: 409, reason: 'token_expired', claim };
  }
  return { ok: true, claim };
}

async function sendActivationVerification({
  store,
  verificationStore,
  handoffSecret,
  familyAccessCode,
  now = new Date(),
  env = process.env,
  mailer,
  code = generateVerificationCode(),
} = {}) {
  if (!verificationStore || typeof verificationStore.issueVerification !== 'function') {
    return { ok: false, status: 503, reason: 'verification_unavailable' };
  }
  const ready = await readyClaim({ store, handoffSecret, now });
  if (!ready.ok) return { ok: false, status: ready.status, reason: ready.reason, granted: false };
  if (recoveredClaimLocked(ready.claim, env)) {
    return { ok: false, status: 409, reason: 'recovered_claim_locked', granted: false };
  }
  const program = await store.familyByAccessCode(String(familyAccessCode || '').trim());
  const familyEmail = normalizeEmail(program?.adminEmail);
  const purchaseEmail = normalizeEmail(ready.claim.customerEmail);
  if (!program?.id || !familyEmail || familyEmail !== purchaseEmail) {
    return { ok: false, status: 409, reason: 'email_mismatch', granted: false };
  }

  const codeHash = hashClaimCode(code);
  let issued;
  try {
    issued = await verificationStore.issueVerification({
      claimId: ready.claim.id,
      familyProgramId: program.id,
      codeHash,
      now,
    });
  } catch {
    return { ok: false, status: 503, reason: 'verification_unavailable', granted: false };
  }
  if (issued === 'resend_limited') {
    return { ok: false, status: 429, reason: 'resend_limited', granted: false };
  }
  if (issued !== 'issued') {
    return { ok: false, status: 503, reason: 'verification_unavailable', granted: false };
  }

  let sent = { success: false };
  try {
    sent = await mailer.send({ to: program.adminEmail, code });
  } catch {
    sent = { success: false };
  }
  if (!sent?.success) {
    try {
      await verificationStore.revokeVerification({ claimId: ready.claim.id, codeHash, now });
    } catch {
      return { ok: false, status: 503, reason: 'verification_unavailable', granted: false };
    }
    return { ok: false, status: 503, reason: 'verification_email_failed', granted: false };
  }
  return { ok: true, status: 200, sent: true, granted: false };
}

async function confirmActivationVerification({
  store,
  verificationStore,
  handoffSecret,
  code,
  now = new Date(),
  authorizationSecret = createAuthorizationSecret(),
} = {}) {
  if (!verificationStore || typeof verificationStore.consumeVerificationCode !== 'function') {
    return { ok: false, status: 503, reason: 'verification_unavailable' };
  }
  const normalized = normalizeVerificationCode(code);
  if (!normalized) return { ok: false, status: 409, reason: 'incorrect', granted: false };
  const ready = await readyClaim({ store, handoffSecret, now });
  if (!ready.ok) return { ok: false, status: ready.status, reason: ready.reason, granted: false };

  let consumed;
  try {
    consumed = await verificationStore.consumeVerificationCode({
      claimId: ready.claim.id,
      codeHash: hashClaimCode(normalized),
      authorizationHash: hashClaimCode(authorizationSecret),
      now,
    });
  } catch {
    return { ok: false, status: 503, reason: 'verification_unavailable', granted: false };
  }
  if (consumed?.outcome !== 'verified' || !consumed.familyProgramId) {
    return { ok: false, status: 409, reason: consumed?.outcome || 'unavailable', granted: false };
  }
  return {
    ok: true,
    status: 200,
    verified: true,
    granted: false,
    cookie: buildOwnerCookie(authorizationSecret),
    authorizationSecret,
  };
}

module.exports = {
  AUTHORIZATION_TTL_MS,
  CODE_TTL_MS,
  MAX_ATTEMPTS,
  MAX_SENDS_PER_HOUR,
  OWNER_COOKIE,
  RESEND_COOLDOWN_MS,
  buildOwnerCookie,
  confirmActivationVerification,
  createAuthorizationSecret,
  createMemoryVerificationStore,
  createSupabaseVerificationStore,
  generateVerificationCode,
  normalizeVerificationCode,
  readOwnerCookie,
  sendActivationVerification,
};
