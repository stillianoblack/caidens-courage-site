import type { PilotProgramRecord, PilotProgramSignupInput } from '../../types/pilotProgram';
import {
  submitPilotProgramSignup,
  UNCERTAIN_FAMILY_SIGNUP_MESSAGE,
} from '../pilotProgramService';

const mockFrom = jest.fn();

jest.mock('../supabaseClient', () => ({
  isSupabaseConfigured: () => true,
  supabase: { from: (...args: unknown[]) => mockFrom(...args) },
}));

const input: PilotProgramSignupInput = {
  programType: 'Independent Family',
  programName: 'Test Family',
  adminFirstName: 'Guardian',
  adminEmail: 'guardian@example.com',
  childFirstName: 'Avery',
  estimatedStudents: 1,
  estimatedStudentCountRange: '1 child',
  ageGradeBand: '3rd–5th',
  ageGradeNotes: '',
  ageRange: 'Ages 8–10',
  groupName: 'Test Family',
  agreedToTerms: true,
};

const program: PilotProgramRecord = {
  id: 'program-1',
  program_name: 'Test Family',
  program_code: 'CMP-SERVER',
  program_type: 'independent_family',
  admin_first_name: 'Guardian',
  admin_email: 'guardian@example.com',
  estimated_students: 1,
  estimated_student_count_range: '1 child',
  age_grade_band: '3rd–5th',
  age_range: 'Ages 8–10',
  group_name: 'Test Family',
  family_access_code: 'FAM-SERVER',
  facilitator_access_code: null,
  pricing_tier: 'independent_family',
  payment_status: 'pending',
  pilot_status: 'active',
  agreed_to_terms: true,
  agreed_at: '2026-07-15T00:00:00.000Z',
};

function response(status: number, body: Record<string, unknown>) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe('independent family signup client contract', () => {
  beforeEach(() => {
    mockFrom.mockReset();
    global.fetch = jest.fn();
  });

  test('uses exactly one server-function request and no direct Supabase table lookup', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      response(200, {
        success: true,
        program,
        participantId: 'participant-1',
        reused: false,
      }),
    );

    const result = await submitPilotProgramSignup(input, { requestId: 'request-1234' });

    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      '/.netlify/functions/pilot-family-signup',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(mockFrom).not.toHaveBeenCalled();

    const request = (global.fetch as jest.Mock).mock.calls[0][1];
    const body = JSON.parse(request.body);
    expect(body.record).not.toHaveProperty('program_code');
    expect(body.record).not.toHaveProperty('family_access_code');
    expect(body.record).not.toHaveProperty('facilitator_access_code');
  });

  test.each([
    [400, 'validation_error'],
    [500, 'server_error'],
  ])('returns a recoverable structured error for HTTP %i', async (status, code) => {
    (global.fetch as jest.Mock).mockResolvedValue(
      response(status, { success: false, code, message: 'Safe failure.', supportCode: 'ABC123' }),
    );

    const result = await submitPilotProgramSignup(input, { requestId: 'request-1234' });

    expect(result).toMatchObject({ success: false, code, message: 'Safe failure.' });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  test('treats a gateway timeout as an uncertain outcome that must not be retried', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      response(504, { success: false, code: 'timeout', message: 'Timed out.', supportCode: 'WAIT01' }),
    );

    const result = await submitPilotProgramSignup(input, { requestId: 'request-1234' });

    expect(result).toMatchObject({
      success: false,
      code: 'timeout',
      message: UNCERTAIN_FAMILY_SIGNUP_MESSAGE,
    });
  });
});
