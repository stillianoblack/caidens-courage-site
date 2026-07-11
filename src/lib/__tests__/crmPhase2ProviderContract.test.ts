// eslint-disable-next-line @typescript-eslint/no-var-requires
const { MockEmailMarketingProvider } = require('../../../netlify/functions/_lib/emailMarketingProvider');
export {};

describe('provider-neutral mock contract', () => {
  test('implements normalized read/write operations without a network call', async () => {
    const provider = new MockEmailMarketingProvider();
    expect(await provider.verifyConfiguration()).toEqual({ ok: true, mode: 'mock' });
    expect(provider.listCapabilities().broadcastStats).toBe(true);
    expect(await provider.upsertContact({ contactId: 'adult-1', email: 'adult@example.com' })).toEqual({ externalContactId: 'mock-adult-1' });
    await provider.addContactToSegment({ contactId: 'adult-1', segmentKey: 'camp_lead' });
    await provider.removeContactFromSegment({ contactId: 'adult-1', segmentKey: 'camp_lead' });
    expect(provider.calls.map((call: [string]) => call[0])).toEqual(['upsertContact','addContactToSegment','removeContactFromSegment']);
  });
});
