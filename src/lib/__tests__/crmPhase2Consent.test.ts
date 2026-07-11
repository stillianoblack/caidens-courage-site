// eslint-disable-next-line @typescript-eslint/no-var-requires
const { applyConsentEvent, mostRestrictiveStatus, validateAdultContact } = require('../../../netlify/functions/_lib/crmWorkflowRules');
export {};

describe('CRM Phase 2 consent safety', () => {
  test('suppressed and unsubscribed states cannot be weakened', () => {
    expect(mostRestrictiveStatus(['confirmed','unsubscribed'])).toBe('unsubscribed');
    expect(mostRestrictiveStatus(['suppressed','confirmed'])).toBe('suppressed');
    expect(applyConsentEvent({ status: 'unsubscribed', version: 2 }, { status_after: 'confirmed', occurred_at: '2026-01-01', source: 'signup' })).toMatchObject({ status: 'unsubscribed', version: 3 });
  });
  test('explicit confirmed consent requires complete evidence', () => {
    expect(validateAdultContact({ contactKind: 'marketing_contact', communicationStatus: 'confirmed' }).ok).toBe(false);
    expect(validateAdultContact({ contactKind: 'marketing_contact', communicationStatus: 'confirmed', consentSource: 'form', consentTimestamp: '2026-01-01', noticeVersion: 'v1' }).ok).toBe(true);
  });
  test('children are rejected and do-not-enroll defaults true', () => {
    expect(validateAdultContact({ contactKind: 'student' }).ok).toBe(false);
    expect(validateAdultContact({ contactKind: 'marketing_contact' }).value.doNotEnroll).toBe(true);
  });
});
