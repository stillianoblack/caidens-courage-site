const { hashClaimCode } = require('../../../netlify/functions/_lib/academyMembership');
const {
  confirmActivationVerification,
  createMemoryVerificationStore,
  generateVerificationCode,
  sendActivationVerification,
} = require('../../../netlify/functions/_lib/academyActivationVerification');
const { establishBundleHandoff } = require('../../../netlify/functions/_lib/academyBundleActivation');

const NOW = new Date('2026-11-03T15:30:00.000Z');
const HANDOFF = 'handoff-fixture-secret';
const CODE = '12345678';

function store() {
  const claim = {
    id: 'claim-1',
    customerEmail: 'parent@example.com',
    activatedAt: null,
    checkoutSessionId: 'cs_test_fixture',
  };
  const families = [{ id: 'program-1', adminEmail: 'parent@example.com', accessCode: 'FAM-EXAMPLE' }];
  const tokens = [{
    id: 'invite-1',
    claimId: claim.id,
    purpose: 'invitation',
    tokenHash: hashClaimCode('invite-fixture-token'),
    expiresAt: '2026-11-03T16:00:00.000Z',
    usedAt: null,
  }];
  return {
    tokens,
    async tokenByHash(hash) {
      return tokens.find((token) => token.tokenHash === hash) || null;
    },
    async claimById() {
      return claim;
    },
    async insertActivationToken(row) {
      tokens.push({
        id: 'handoff-1',
        claimId: row.claimId,
        purpose: 'activation',
        tokenHash: row.tokenHash,
        expiresAt: row.expiresAt,
        usedAt: null,
      });
    },
    async familyByAccessCode(code) {
      return families.find((family) => family.accessCode === code) || null;
    },
  };
}

function mailer() {
  const messages = [];
  return {
    messages,
    async send(payload) {
      messages.push(payload);
      return { success: true };
    },
  };
}

async function open(bundle, verificationStore = createMemoryVerificationStore()) {
  await establishBundleHandoff({
    store: bundle,
    invitationToken: 'invite-fixture-token',
    now: NOW,
    secret: HANDOFF,
  });
  return verificationStore;
}

describe('academy activation email verification', () => {
  test('generates an 8-digit code and stores only its hash', () => {
    const code = generateVerificationCode();
    expect(code).toMatch(/^\d{8}$/);
    const verification = createMemoryVerificationStore();
    return verification.issueVerification({
      claimId: 'claim-1',
      familyProgramId: 'program-1',
      codeHash: hashClaimCode(code),
      now: NOW,
    }).then(() => {
      expect(JSON.stringify(verification.rows)).not.toContain(code);
      expect(verification.rows[0].codeHash).toBe(hashClaimCode(code));
    });
  });

  test('accepts a valid code once and binds it to the claim and family', async () => {
    const bundle = store();
    const verification = await open(bundle);
    const delivery = mailer();
    const sent = await sendActivationVerification({
      store: bundle,
      verificationStore: verification,
      handoffSecret: HANDOFF,
      familyAccessCode: 'FAM-EXAMPLE',
      now: NOW,
      mailer: delivery,
      code: CODE,
    });
    expect(sent).toMatchObject({ ok: true, sent: true, granted: false });
    expect(delivery.messages).toEqual([{ to: 'parent@example.com', code: CODE }]);
    expect(JSON.stringify(sent)).not.toContain(CODE);

    const confirmed = await confirmActivationVerification({
      store: bundle,
      verificationStore: verification,
      handoffSecret: HANDOFF,
      code: CODE,
      now: NOW,
      authorizationSecret: 'owner-secret',
    });
    expect(confirmed.verified).toBe(true);
    expect(confirmed.cookie).toContain('HttpOnly');
    expect(confirmed.cookie).not.toContain(CODE);
    expect(verification.rows[0].familyProgramId).toBe('program-1');
    expect(verification.rows[0].claimId).toBe('claim-1');

    const reused = await confirmActivationVerification({
      store: bundle,
      verificationStore: verification,
      handoffSecret: HANDOFF,
      code: CODE,
      now: NOW,
      authorizationSecret: 'second-secret',
    });
    expect(reused).toMatchObject({ ok: false, reason: 'reused', granted: false });
    expect(reused.cookie).toBeUndefined();
  });

  test('rejects an incorrect code and exhausts attempts', async () => {
    const bundle = store();
    const verification = await open(bundle);
    await sendActivationVerification({
      store: bundle,
      verificationStore: verification,
      handoffSecret: HANDOFF,
      familyAccessCode: 'FAM-EXAMPLE',
      now: NOW,
      mailer: mailer(),
      code: CODE,
    });
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const incorrect = await confirmActivationVerification({
        store: bundle,
        verificationStore: verification,
        handoffSecret: HANDOFF,
        code: '00000000',
        now: NOW,
        authorizationSecret: `secret-${attempt}`,
      });
      expect(incorrect.reason).toBe('incorrect');
    }
    const exhausted = await confirmActivationVerification({
      store: bundle,
      verificationStore: verification,
      handoffSecret: HANDOFF,
      code: CODE,
      now: NOW,
      authorizationSecret: 'late-secret',
    });
    expect(exhausted.ok).toBe(false);
    expect(exhausted.cookie).toBeUndefined();
    expect(verification.rows[0].authorizationHash).toBeNull();
  });

  test('rejects an expired code', async () => {
    const bundle = store();
    const verification = await open(bundle);
    await sendActivationVerification({
      store: bundle,
      verificationStore: verification,
      handoffSecret: HANDOFF,
      familyAccessCode: 'FAM-EXAMPLE',
      now: NOW,
      mailer: mailer(),
      code: CODE,
    });
    const expired = await confirmActivationVerification({
      store: bundle,
      verificationStore: verification,
      handoffSecret: HANDOFF,
      code: CODE,
      now: new Date(NOW.getTime() + 11 * 60 * 1000),
      authorizationSecret: 'owner-secret',
    });
    expect(expired).toMatchObject({ ok: false, reason: 'expired', granted: false });
  });

  test('rate-limits repeated sends and ignores a caller-supplied email', async () => {
    const bundle = store();
    const verification = await open(bundle);
    const delivery = mailer();
    const first = await sendActivationVerification({
      store: bundle,
      verificationStore: verification,
      handoffSecret: HANDOFF,
      familyAccessCode: 'FAM-EXAMPLE',
      now: NOW,
      mailer: delivery,
      code: CODE,
    });
    expect(first.ok).toBe(true);
    const cooled = await sendActivationVerification({
      store: bundle,
      verificationStore: verification,
      handoffSecret: HANDOFF,
      familyAccessCode: 'FAM-EXAMPLE',
      now: new Date(NOW.getTime() + 30 * 1000),
      mailer: delivery,
      code: '87654321',
    });
    expect(cooled).toMatchObject({ ok: false, reason: 'resend_limited' });
    expect(delivery.messages).toHaveLength(1);
    expect(delivery.messages[0].to).toBe('parent@example.com');
  });

  test('fails closed when verification storage is unavailable', async () => {
    const bundle = store();
    await open(bundle);
    const delivery = mailer();
    const verificationStore = {
      async issueVerification() {
        throw new Error('storage_unavailable');
      },
    };
    const failed = await sendActivationVerification({
      store: bundle,
      verificationStore,
      handoffSecret: HANDOFF,
      familyAccessCode: 'FAM-EXAMPLE',
      now: NOW,
      mailer: delivery,
      code: CODE,
    });
    expect(failed).toMatchObject({ ok: false, status: 503, reason: 'verification_unavailable', granted: false });
    expect(delivery.messages).toHaveLength(0);
  });

  test('revokes the code when email delivery fails', async () => {
    const bundle = store();
    const verification = await open(bundle);
    const failed = await sendActivationVerification({
      store: bundle,
      verificationStore: verification,
      handoffSecret: HANDOFF,
      familyAccessCode: 'FAM-EXAMPLE',
      now: NOW,
      mailer: { async send() { return { success: false }; } },
      code: CODE,
    });
    expect(failed).toMatchObject({ ok: false, reason: 'verification_email_failed' });
    const confirm = await confirmActivationVerification({
      store: bundle,
      verificationStore: verification,
      handoffSecret: HANDOFF,
      code: CODE,
      now: NOW,
      authorizationSecret: 'owner-secret',
    });
    expect(confirm.ok).toBe(false);
    expect(confirm.cookie).toBeUndefined();
  });
});
