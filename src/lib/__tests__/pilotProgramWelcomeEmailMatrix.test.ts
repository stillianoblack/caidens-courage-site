import type { PilotProgramSignupInput, PilotProgramType } from '../../types/pilotProgram';
import { submitPilotProgramSignup } from '../pilotProgramService';
import { queueWelcomeEmail } from '../welcomeEmailService';

const mockFrom = jest.fn();

jest.mock('../supabaseClient', () => ({
  isSupabaseConfigured: () => true,
  supabase: { from: (...args: unknown[]) => mockFrom(...args) },
}));

jest.mock('../welcomeEmailService', () => ({
  queueWelcomeEmail: jest.fn(),
}));

const mockedQueueWelcome = queueWelcomeEmail as jest.MockedFunction<typeof queueWelcomeEmail>;

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

function configureSupabase() {
  mockFrom.mockImplementation((table: string) => {
    if (table === 'program_code_aliases') {
      return {
        select: () => ({
          eq: () => ({
            limit: async () => ({ data: [], error: null }),
          }),
        }),
      };
    }
    if (table === 'pilot_programs') {
      return {
        select: () => ({
          or: () => ({
            limit: async () => ({ data: [], error: null }),
          }),
        }),
        insert: (record: Record<string, unknown>) => ({
          select: () => ({
            single: async () => ({
              data: { ...record, id: 'program-1' },
              error: null,
            }),
          }),
        }),
      };
    }
    throw new Error(`Unexpected table ${table}`);
  });
}

describe('program signup welcome email matrix', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    configureSupabase();
    mockedQueueWelcome.mockResolvedValue({
      success: true,
      skipped: false,
      provider: 'Resend',
    });
  });

  test.each([
    ['Camp / Youth Program', 'facilitator', 'Open Facilitator Portal'],
    ['After-School Program', 'facilitator', 'Open Facilitator Portal'],
    ['Homeschool Group', 'facilitator', 'Open Facilitator Portal'],
    ['Teacher / Classroom', 'educator', 'Open Educator Portal'],
    ['School', 'educator', 'Open Educator Portal'],
    ['District', 'educator', 'Open Educator Portal'],
  ] as const)('%s sends exactly one staff welcome email', async (programType, recipientRole) => {
    const result = await submitPilotProgramSignup(input(programType));

    expect(result.success).toBe(true);
    expect(mockedQueueWelcome).toHaveBeenCalledTimes(1);
    expect(mockedQueueWelcome).toHaveBeenCalledWith(expect.objectContaining({
      parentEmail: 'taylor@example.com',
      templateType: 'staff',
      programType,
      recipientRole,
      facilitatorAccessCode: expect.stringMatching(/^FAC-/),
      deliveryEventKey: 'pilot-program:program-1:admin-welcome',
      loginUrl: expect.stringMatching(/\/portal$/),
    }));
  });

  test('email-provider failure does not fail account creation', async () => {
    mockedQueueWelcome.mockResolvedValue({
      success: false,
      skipped: false,
      provider: 'Resend',
      reason: 'provider unavailable',
    });

    const result = await submitPilotProgramSignup(input('School'));

    expect(result.success).toBe(true);
    expect(mockedQueueWelcome).toHaveBeenCalledTimes(1);
  });
});
