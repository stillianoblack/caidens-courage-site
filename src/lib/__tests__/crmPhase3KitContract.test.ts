// eslint-disable-next-line @typescript-eslint/no-var-requires
const { KitV4Provider, CAPABILITIES } = require('../../../netlify/functions/_lib/kitV4Provider');
export {};

function response(body: unknown, status = 200) { return { ok: status >= 200 && status < 300, status, text: async () => body === null ? '' : JSON.stringify(body) }; }
describe('Kit v4 adapter contract', () => {
  test('uses v4 URL, server header and cursor pagination without leaking key', async () => {
    const calls: any[] = []; const fetch = jest.fn(async (url, options) => { calls.push([url, options]); return response({ subscribers: [{ id: 1, state: 'active' }], pagination: { has_next_page: true, end_cursor: 'next' } }); });
    const provider = new KitV4Provider({ apiKey: 'server-secret', fetch });
    const result = await provider.listSubscribers({ limit: 10, cursor: 'cursor' });
    expect(calls[0][0]).toContain('/v4/subscribers'); expect(calls[0][0]).toContain('after=cursor');
    expect(calls[0][1].headers['X-Kit-Api-Key']).toBe('server-secret'); expect(JSON.stringify(result)).not.toContain('server-secret'); expect(result.nextCursor).toBe('next');
  });
  test('upsert refuses missing consent and sends adult allowlist only', async () => {
    const fetch = jest.fn(async (_url, options) => response({ subscriber: { id: 9, state: 'active' } })); const provider = new KitV4Provider({ apiKey: 'key', fetch });
    await expect(provider.upsertContact({ email: 'adult@example.com' })).rejects.toMatchObject({ code: 'consent_required' });
    await provider.upsertContact({ contactId: 'adult-1', email: 'adult@example.com', firstName: 'Ada', lastName: 'L', explicitConfirmedConsent: true, childName: 'must-not-send', privateNote: 'must-not-send' });
    const sent = fetch.mock.calls[0][1].body; expect(sent).toContain('adult@example.com'); expect(sent).not.toContain('childName'); expect(sent).not.toContain('privateNote');
  });
  test('normalizes retryable API errors and declares unsupported capabilities', async () => {
    const provider = new KitV4Provider({ apiKey: 'key', fetch: async () => response({ errors: ['slow down'] }, 429) });
    await expect(provider.listTags()).rejects.toMatchObject({ code: 'kit_429', retryable: true });
    expect(CAPABILITIES.sequenceRemove).toBe(false); expect(CAPABILITIES.webhookCryptographicVerification).toBe(false); expect(CAPABILITIES.broadcastDeliveredMetric).toBe(false);
  });
});
