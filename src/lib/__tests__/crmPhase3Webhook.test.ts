// eslint-disable-next-line @typescript-eslint/no-var-requires
const { restrictiveWebhookState, webhook } = require('../../../netlify/functions/_lib/providerHandlers');
export {};
describe('Kit webhook safety', () => {
  const original = process.env;
  beforeEach(() => { process.env = { ...original }; }); afterAll(() => { process.env = original; });
  test('maps only restrictive supported events', () => {
    expect(restrictiveWebhookState('unsubscribe')).toEqual(['provider_unsubscribe','unsubscribed']);
    expect(restrictiveWebhookState('complaint')).toEqual(['provider_complaint','suppressed']);
    expect(restrictiveWebhookState('bounce')).toEqual(['provider_bounce','suppressed']);
    expect(restrictiveWebhookState('subscribe')).toBeNull();
  });
  test('disabled or missing shared-secret verification is rejected before processing', async () => {
    delete process.env.KIT_WEBHOOKS_ENABLED;
    expect((await webhook({ httpMethod: 'POST', headers: {}, body: '{}' })).statusCode).toBe(404);
    process.env.KIT_WEBHOOKS_ENABLED = 'true'; process.env.KIT_WEBHOOK_SECRET = 'secret';
    expect((await webhook({ httpMethod: 'POST', headers: {}, body: '{}' })).statusCode).toBe(401);
  });
});
