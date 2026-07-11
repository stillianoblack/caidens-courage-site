// eslint-disable-next-line @typescript-eslint/no-var-requires
const { canonicalIdempotency, retryDelayMs, sanitizedError } = require('../../../netlify/functions/_lib/providerOutbox');
export {};
describe('Phase 3 outbox primitives', () => {
  test('idempotency is stable and target/version sensitive', () => {
    const input = { providerAccountId: 'p', contactId: 'c', operation: 'add_segment', targetKey: 'camp_lead', eligibilityVersion: 1 };
    expect(canonicalIdempotency(input)).toBe(canonicalIdempotency(input));
    expect(canonicalIdempotency(input)).not.toBe(canonicalIdempotency({ ...input, eligibilityVersion: 2 }));
  });
  test('backoff increases and sanitized errors mask email', () => {
    expect(retryDelayMs(3, () => 0)).toBeGreaterThan(retryDelayMs(1, () => 0));
    expect(sanitizedError({ message: 'failed adult@example.com', retryable: true })).toEqual(expect.objectContaining({ message: 'failed [redacted-email]', retryable: true }));
  });
});
