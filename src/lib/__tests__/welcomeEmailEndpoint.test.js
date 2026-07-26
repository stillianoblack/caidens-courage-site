const mockSendWelcomeEmail = jest.fn();
const mockCreateClient = jest.fn();

jest.mock('../../../netlify/functions/_lib/emailProvider', () => ({
  sendWelcomeEmail: (...args) => mockSendWelcomeEmail(...args),
}));
jest.mock('@supabase/supabase-js', () => ({
  createClient: (...args) => mockCreateClient(...args),
}));

const { handler } = require('../../../netlify/functions/send-welcome-email');

function createSupabaseMock({ existing = null } = {}) {
  const inserts = [];
  const updates = [];
  const from = jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        maybeSingle: jest.fn(async () => ({ data: existing, error: null })),
      })),
    })),
    insert: jest.fn((record) => {
      inserts.push(record);
      return {
        select: jest.fn(() => ({
          maybeSingle: jest.fn(async () => ({ data: { id: 'log-1' }, error: null })),
        })),
      };
    }),
    update: jest.fn((patch) => {
      updates.push(patch);
      return {
        eq: jest.fn(async () => ({ error: null })),
      };
    }),
  }));
  return { client: { from }, inserts, updates };
}

function request(overrides = {}) {
  return {
    httpMethod: 'POST',
    headers: { 'x-correlation-id': 'welcome-test-1234' },
    body: JSON.stringify({
      recipientEmail: ' Parent@Example.com ',
      emailType: 'welcome',
      templateType: 'family',
      programType: 'independent_family',
      recipientRole: 'parent_guardian',
      recipientName: 'Jordan',
      learnerName: 'Avery',
      programName: 'Jordan Family',
      familyAccessCode: 'FAM-ABC234',
      portalLink: 'https://caidenscourage.com/portal',
      deliveryEventKey: 'pilot-program:program-1:parent-welcome',
      relatedProgramId: 'program-1',
      ...overrides,
    }),
  };
}

describe('send-welcome-email endpoint', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role',
      RESEND_API_KEY: 'test-resend-key',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('builds and sends one branded email with durable metadata', async () => {
    const database = createSupabaseMock();
    mockCreateClient.mockReturnValue(database.client);
    mockSendWelcomeEmail.mockResolvedValue({ success: true, providerMessageId: 'resend-1' });

    const response = await handler(request());
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body).toEqual(expect.objectContaining({
      success: true,
      status: 'sent',
      providerMessageId: 'resend-1',
      correlationId: 'welcome-test-1234',
    }));
    expect(mockSendWelcomeEmail).toHaveBeenCalledTimes(1);
    expect(mockSendWelcomeEmail).toHaveBeenCalledWith(expect.objectContaining({
      subject: 'Welcome to Focus Flame Academy — Your Adventure Starts Here',
      html: expect.stringContaining('A Caiden’s Courage Learning Adventure'),
      text: expect.stringContaining('FAM-ABC234'),
    }));
    expect(database.inserts).toHaveLength(1);
    expect(database.inserts[0]).toEqual(expect.objectContaining({
      recipient_email: 'parent@example.com',
      program_type: 'independent_family',
      recipient_role: 'parent_guardian',
      template_type: 'family',
      correlation_id: 'welcome-test-1234',
      delivery_event_key: 'pilot-program:program-1:parent-welcome',
      email_provider: 'resend',
      retry_eligible: false,
    }));
    expect(database.inserts[0].recipient_identifier).toMatch(/^[a-f0-9]{64}$/);
    expect(database.updates).toContainEqual(expect.objectContaining({
      status: 'sent',
      provider_message_id: 'resend-1',
      retry_eligible: false,
    }));
  });

  test('suppresses a repeated delivery event before contacting Resend', async () => {
    const database = createSupabaseMock({
      existing: {
        id: 'log-1',
        status: 'sent',
        provider_message_id: 'resend-existing',
        retry_eligible: false,
      },
    });
    mockCreateClient.mockReturnValue(database.client);

    const response = await handler(request());
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.status).toBe('duplicate_suppressed');
    expect(body.providerMessageId).toBe('resend-existing');
    expect(mockSendWelcomeEmail).not.toHaveBeenCalled();
    expect(database.inserts).toHaveLength(0);
  });

  test('records a recoverable failure without exposing credentials in structured logs', async () => {
    const database = createSupabaseMock();
    mockCreateClient.mockReturnValue(database.client);
    mockSendWelcomeEmail.mockResolvedValue({ success: false, error: 'provider unavailable' });
    const info = jest.spyOn(console, 'info').mockImplementation(() => {});

    const response = await handler(request());
    const logText = JSON.stringify(info.mock.calls);
    info.mockRestore();

    expect(response.statusCode).toBe(502);
    expect(JSON.parse(response.body)).toEqual(expect.objectContaining({
      success: false,
      status: 'failed',
      correlationId: 'welcome-test-1234',
    }));
    expect(database.updates).toContainEqual(expect.objectContaining({
      status: 'failed',
      retry_eligible: true,
    }));
    expect(logText).not.toContain('Parent@Example.com');
    expect(logText).not.toContain('FAM-ABC234');
    expect(logText).toContain('recipient_identifier');
  });

  test('does not import or call Kit, CRM, campaigns, or webhooks', async () => {
    const database = createSupabaseMock();
    mockCreateClient.mockReturnValue(database.client);
    mockSendWelcomeEmail.mockResolvedValue({ success: true, providerMessageId: 'resend-1' });

    await handler(request());

    const loadedModules = Object.keys(require.cache);
    expect(loadedModules.some((name) => /kitService|sync-kit-event|crmClassifier|webhook/i.test(name))).toBe(false);
  });
});
