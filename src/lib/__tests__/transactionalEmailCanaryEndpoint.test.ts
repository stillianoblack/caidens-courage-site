export {};

const mockSendWelcomeEmail = jest.fn();

jest.mock('../../../netlify/functions/_lib/emailProvider', () => ({
  sendWelcomeEmail: (...args: unknown[]) => mockSendWelcomeEmail(...args),
}));

const { handler } = require('../../../netlify/functions/send-welcome-email');

const ORIGINAL_ENV = process.env;

function request(body: Record<string, unknown> = { action: 'send_welcome_canary' }) {
  return {
    httpMethod: 'POST',
    headers: { 'x-correlation-id': 'email-canary-test-001' },
    body: JSON.stringify(body),
  };
}

describe('transactional email canary endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...ORIGINAL_ENV,
      CONTEXT: 'deploy-preview',
      TRANSACTIONAL_EMAIL_CANARY_ENABLED: 'true',
      CRM_ADULT_TEST_EMAIL: 'adult@example.test',
      RESEND_API_KEY: 'test-key',
      DEPLOY_PRIME_URL: 'https://preview.example.test',
      SUPABASE_URL: '',
      REACT_APP_SUPABASE_URL: '',
      SUPABASE_SERVICE_ROLE_KEY: '',
    };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  test('is closed in production', async () => {
    process.env.CONTEXT = 'production';

    const response = await handler(request());

    expect(response.statusCode).toBe(404);
    expect(mockSendWelcomeEmail).not.toHaveBeenCalled();
  });

  test('is closed unless the canary flag is explicitly enabled', async () => {
    process.env.TRANSACTIONAL_EMAIL_CANARY_ENABLED = 'false';

    const response = await handler(request());

    expect(response.statusCode).toBe(404);
    expect(mockSendWelcomeEmail).not.toHaveBeenCalled();
  });

  test('requires the server-configured adult recipient', async () => {
    delete process.env.CRM_ADULT_TEST_EMAIL;

    const response = await handler(request());

    expect(response.statusCode).toBe(503);
    expect(mockSendWelcomeEmail).not.toHaveBeenCalled();
  });

  test('ignores browser-supplied recipient and content', async () => {
    mockSendWelcomeEmail.mockResolvedValue({ success: true, providerMessageId: 'provider-id' });

    const response = await handler(request({
      action: 'send_welcome_canary',
      recipientEmail: 'attacker@example.test',
      subject: 'Browser supplied',
      body: 'Browser supplied',
    }));
    const payload = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(payload).toMatchObject({
      success: true,
      status: 'sent',
      correlationId: 'email-canary-test-001',
    });
    expect(payload.providerMessageId).toBeUndefined();
    expect(mockSendWelcomeEmail).toHaveBeenCalledWith(expect.objectContaining({
      recipientEmail: 'adult@example.test',
      emailType: 'welcome_canary',
      subject: "Caiden's Courage transactional email test",
      portalLink: 'https://preview.example.test/portal',
      idempotencyKey: expect.stringMatching(/^welcome-canary\/\d{4}-\d{2}-\d{2}\/[a-f0-9]{16}$/),
    }));
    expect(mockSendWelcomeEmail.mock.calls[0][0]).not.toEqual(expect.objectContaining({
      recipientEmail: 'attacker@example.test',
    }));
  });

  test('returns a sanitized provider failure with a support identifier', async () => {
    mockSendWelcomeEmail.mockResolvedValue({
      success: false,
      error: 'The sender domain is not verified: sensitive provider detail',
      providerStatus: 403,
      providerErrorCode: 'validation_error',
    });

    const response = await handler(request());
    const payload = JSON.parse(response.body);

    expect(response.statusCode).toBe(502);
    expect(payload.error).toBe('Email provider rejected the canary.');
    expect(payload.providerStatus).toBe(403);
    expect(payload.providerErrorCategory).toBe('sender_domain_not_verified');
    expect(payload.correlationId).toBe('email-canary-test-001');
    expect(JSON.stringify(payload)).not.toContain('sensitive provider detail');
  });
});
