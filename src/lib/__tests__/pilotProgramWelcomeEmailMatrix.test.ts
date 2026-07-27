import type { PilotProgramSignupInput, PilotProgramType } from '../../types/pilotProgram';
import { submitPilotProgramSignup } from '../pilotProgramService';

function input(programType: PilotProgramType): PilotProgramSignupInput {
  return {
    programType,
    programName: `${programType} Test`,
    adminFirstName: 'Taylor',
    adminEmail: 'taylor@example.com',
    estimatedStudents: 10,
    estimatedStudentCountRange: '5–10 students',
    ageGradeBand: '3rd–5th',
    ageGradeNotes: '',
    ageRange: 'Ages 8–10',
    groupName: 'North Star',
    agreedToTerms: true,
  };
}

function successfulResponse(programType: PilotProgramType): Response {
  return {
    ok: true,
    status: 200,
    headers: new Headers(),
    json: async () => ({
      success: true,
      reused: false,
      welcomeEmailStatus: 'sent',
      redirectDestination:
        programType === 'Independent Family' ? '/family-hub' : '/program-dashboard?welcome=1',
      program: {
        id: 'program-1',
        program_name: `${programType} Test`,
        program_code: 'CMP-SERVER',
        program_type: programType === 'Independent Family' ? 'independent_family' : programType,
        admin_first_name: 'Taylor',
        admin_email: 'taylor@example.com',
        estimated_students: 10,
        age_range: 'Ages 8–10',
        group_name: 'North Star',
        family_access_code: 'FAM-SERVER',
        facilitator_access_code:
          programType === 'Independent Family' ? null : 'FAC-SERVER',
        pricing_tier: programType === 'Independent Family' ? 'independent_family' : 'camp_pilot',
        payment_status: 'pending',
        pilot_status: 'active',
        agreed_to_terms: true,
        agreed_at: '2026-07-26T00:00:00.000Z',
      },
    }),
  } as Response;
}

describe('program signup protected API matrix', () => {
  beforeEach(() => {
    global.fetch = jest.fn(async (_url, request) => {
      const body = JSON.parse(String(request?.body));
      const type =
        body.record.program_type === 'independent_family'
          ? 'Independent Family'
          : body.record.program_type;
      return successfulResponse(type);
    });
  });

  test.each([
    'Camp / Youth Program',
    'After-School Program',
    'Homeschool Group',
    'Teacher / Classroom',
    'School',
    'District',
  ] as const)('%s uses one protected server request with no browser-generated credentials', async (programType) => {
    const result = await submitPilotProgramSignup(input(programType), {
      requestId: `request-${programType}`,
    });

    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, request] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('/.netlify/functions/pilot-family-signup');
    expect(request.headers['X-Idempotency-Key']).toBe(`request-${programType}`);
    const body = JSON.parse(request.body);
    expect(body.record).not.toHaveProperty('program_code');
    expect(body.record).not.toHaveProperty('family_access_code');
    expect(body.record).not.toHaveProperty('facilitator_access_code');
  });
});
