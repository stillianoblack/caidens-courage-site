import { kitWebhookFixtures } from '../../test-fixtures/kitWebhookFixtures';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { restrictiveWebhookState, webhook } = require('../../../netlify/functions/_lib/providerHandlers');
export {};
describe('Kit webhook safety', () => {
  const original = process.env;
  beforeEach(() => { process.env = { ...original }; }); afterAll(() => { process.env = original; });
  test('maps only restrictive supported events', () => {
    expect(restrictiveWebhookState(kitWebhookFixtures.unsubscribe.event.type)).toEqual(['provider_unsubscribe','unsubscribed']);
    expect(restrictiveWebhookState(kitWebhookFixtures.complaint.event.type)).toEqual(['provider_complaint','suppressed']);
    expect(restrictiveWebhookState(kitWebhookFixtures.bounce.event.type)).toEqual(['provider_bounce','suppressed']);
    expect(restrictiveWebhookState(kitWebhookFixtures.unknown.event.type)).toBeNull();
  });
  test('disabled or missing shared-secret verification is rejected before processing', async () => {
    delete process.env.KIT_WEBHOOKS_ENABLED;
    expect((await webhook({ httpMethod: 'POST', headers: {}, body: '{}' })).statusCode).toBe(404);
    process.env.KIT_WEBHOOKS_ENABLED = 'true'; process.env.KIT_WEBHOOK_SECRET = 'secret';
    expect((await webhook({ httpMethod: 'POST', headers: {}, body: '{}' })).statusCode).toBe(401);
  });
});
