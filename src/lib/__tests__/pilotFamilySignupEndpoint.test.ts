const mockRpc = jest.fn();
const mockSendWelcomeEmail = jest.fn();

jest.mock('../../../netlify/functions/_lib/crmAuth', () => ({
  correlationId: () => 'test-correlation',
  getServerSupabase: () => ({ rpc: mockRpc }),
  json: (statusCode: number, body: Record<string, unknown>, id: string) => ({
    statusCode,
    headers: { 'X-Correlation-Id': id },
    body: JSON.stringify({ ...body, correlationId: id }),
  }),
}));

jest.mock('../../../netlify/functions/_lib/emailProvider', () => ({
  sendWelcomeEmail: (...args: unknown[]) => mockSendWelcomeEmail(...args),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { handler } = require('../../../netlify/functions/pilot-family-signup');

const validRecord = {
  program_name: 'Test Family',
  program_code: 'CMP-TEST1234',
  program_type: 'independent_family',
  admin_first_name: 'Parent',
  admin_email: 'parent@example.com',
  estimated_students: 1,
  estimated_student_count_range: '1 child',
  age_grade_band: '3rd–5th',
  age_range: 'Ages 8–10',
  group_name: 'Test Family',
  family_access_code: 'FAM-TEST1234',
  facilitator_access_code: null,
  pricing_tier: 'independent_family',
  payment_status: 'pending',
  pilot_status: 'active',
  agreed_to_terms: true,
  agreed_at: '2026-07-13T00:00:00.000Z',
};

describe('pilot family signup endpoint', () => {
  beforeEach(() => {
    mockRpc.mockReset();
    mockSendWelcomeEmail.mockReset();
    mockSendWelcomeEmail.mockResolvedValue({ success: true, providerMessageId: 'email-1' });
  });

  test('rejects a missing child before any database write', async () => {
    const response = await handler({
      httpMethod: 'POST',
      headers: { 'x-idempotency-key': 'request-1234' },
      body: JSON.stringify({ record: validRecord, childFirstName: '' }),
    });

    expect(response.statusCode).toBe(400);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  test('rejects an invalid email before any database write', async () => {
    const response = await handler({
      httpMethod: 'POST',
      headers: { 'x-idempotency-key': 'request-1234' },
      body: JSON.stringify({
        record: { ...validRecord, admin_email: 'not-an-email' },
        childFirstName: 'London',
      }),
    });
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe('validation_error');
    expect(body.supportCode).toBeTruthy();
    expect(mockRpc).not.toHaveBeenCalled();
  });

  test('keeps unexpected database errors structured and sanitized', async () => {
    const warning = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    mockRpc.mockResolvedValue({
      data: null,
      error: {
        code: '42501',
        message: 'permission denied for table pilot_programs',
        details: null,
        hint: null,
      },
    });

    const response = await handler({
      httpMethod: 'POST',
      headers: { 'x-idempotency-key': 'request-1234' },
      body: JSON.stringify({ record: validRecord, childFirstName: 'London' }),
    });
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(500);
    expect(body).toMatchObject({
      success: false,
      code: 'server_error',
      message: 'Could not create family access right now. Please try again.',
    });
    expect(body.supportCode).toBeTruthy();
    expect(JSON.stringify(body)).not.toContain('permission denied');
    expect(warning).toHaveBeenCalledWith(
      '[PILOT_SIGNUP_FAILED]',
      expect.objectContaining({ databaseCode: '42501' }),
    );
    warning.mockRestore();
  });

  test('returns the atomically created family and canonical participant', async () => {
    mockRpc.mockResolvedValue({
      data: {
        program: { ...validRecord, id: 'program-1' },
        participant_id: 'student-1',
        reused: false,
      },
      error: null,
    });

    const response = await handler({
      httpMethod: 'POST',
      headers: { 'x-idempotency-key': 'request-1234' },
      body: JSON.stringify({ record: validRecord, childFirstName: 'London' }),
    });
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.success).toBe(true);
    expect(body.participantId).toBe('student-1');
    expect(body.welcomeEmailStatus).toBe('sent');
    expect(mockRpc).toHaveBeenCalledTimes(1);
    const [, rpcInput] = mockRpc.mock.calls[0];
    expect(rpcInput).toMatchObject({
      signup_record: expect.objectContaining({
        admin_email: validRecord.admin_email,
        program_code: expect.stringMatching(/^CMP-[A-HJ-NP-Z2-9]{6}$/),
        family_access_code: expect.stringMatching(/^FAM-[A-HJ-NP-Z2-9]{6}$/),
        facilitator_access_code: null,
      }),
      child_first_name_input: 'London',
      idempotency_key_input: 'request-1234',
    });
    expect(rpcInput.signup_record.program_code).not.toBe(validRecord.program_code);
    expect(rpcInput.signup_record.family_access_code).not.toBe(validRecord.family_access_code);
    expect(mockSendWelcomeEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientEmail: validRecord.admin_email,
        learnerName: 'London',
        familyAccessCode: validRecord.family_access_code,
        programType: 'independent_family',
        templateType: 'family',
        recipientRole: 'parent_guardian',
        relatedStudentId: 'student-1',
        relatedProgramId: 'program-1',
      }),
    );
    expect(mockSendWelcomeEmail).toHaveBeenCalledTimes(1);
    const emailPayload = mockSendWelcomeEmail.mock.calls[0][0];
    expect(emailPayload).not.toHaveProperty('programCode');
    expect(emailPayload.portalLink).toContain('/portal');
    expect(emailPayload.deliveryEventKey).toBe('pilot-program:program-1:parent-welcome');
    expect(response.headers).toEqual({ 'X-Correlation-Id': 'test-correlation' });
    expect(body.correlationId).toBe('test-correlation');
  });

  test('repeated idempotent response reuses the same participant without resending email', async () => {
    mockRpc.mockResolvedValue({
      data: {
        program: { ...validRecord, id: 'program-1' },
        participant_id: 'student-1',
        reused: true,
      },
      error: null,
    });

    const response = await handler({
      httpMethod: 'POST',
      headers: { 'x-idempotency-key': 'request-1234' },
      body: JSON.stringify({ record: validRecord, childFirstName: 'London' }),
    });

    expect(JSON.parse(response.body)).toMatchObject({
      reused: true,
      welcomeEmailStatus: 'not_resent',
    });
    expect(mockSendWelcomeEmail).not.toHaveBeenCalled();
  });

  test('sends exactly one welcome email across an original request and a repeated retry', async () => {
    mockRpc
      .mockResolvedValueOnce({
        data: {
          program: { ...validRecord, id: 'program-1' },
          participant_id: 'student-1',
          reused: false,
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: {
          program: { ...validRecord, id: 'program-1' },
          participant_id: 'student-1',
          reused: true,
        },
        error: null,
      });

    const event = {
      httpMethod: 'POST',
      headers: { 'x-idempotency-key': 'request-1234' },
      body: JSON.stringify({ record: validRecord, childFirstName: 'London' }),
    };
    await handler(event);
    await handler(event);

    expect(mockSendWelcomeEmail).toHaveBeenCalledTimes(1);
  });

  test('keeps a successful signup when welcome email delivery fails', async () => {
    const warning = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    mockRpc.mockResolvedValue({
      data: {
        program: { ...validRecord, id: 'program-1' },
        participant_id: 'student-1',
        reused: false,
      },
      error: null,
    });
    mockSendWelcomeEmail.mockResolvedValue({
      success: false,
      error: 'Email provider unavailable.',
    });

    const response = await handler({
      httpMethod: 'POST',
      headers: { 'x-idempotency-key': 'request-1234' },
      body: JSON.stringify({ record: validRecord, childFirstName: 'London' }),
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({
      success: true,
      welcomeEmailStatus: 'failed',
      correlationId: 'test-correlation',
    });
    expect(response.headers).toEqual({ 'X-Correlation-Id': 'test-correlation' });
    expect(warning).toHaveBeenCalledWith(
      '[PILOT_SIGNUP_WELCOME_EMAIL]',
      expect.objectContaining({
        correlationId: 'test-correlation',
        status: 'failed',
        error_category: 'welcome_email_delivery_failed',
      }),
    );
    warning.mockRestore();
  });
});

export {};
