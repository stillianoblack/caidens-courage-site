import { readParentClaimContext } from '../../config/parentClaimContext';
import { writeActivePilotProgram } from '../../config/activePilotProgram';
import { writeActiveAccessCode } from '../../config/portalContext';
import { hasFamilyChildGoals, saveFamilyChildGoals } from '../familyChildGoalsService';
import { trackKitParentSignup } from '../kitIntegration';
import { submitParentOnboarding } from '../parentOnboardingSubmit';
import { readFamilyOnboardingRecord } from '../parentOnboardingState';
import { saveProgramGoals } from '../programGoalsService';
import {
  fetchStudentFamilyLinksByCampProgram,
  fetchStudentFamilyLinksByFamilyProgram,
  markStudentFamilyLinksClaimed,
} from '../studentFamilyLinkService';
import { revealStudentPinViaFunction } from '../studentPinService';

jest.mock('../studentFamilyLinkService', () => ({
  fetchStudentFamilyLinksByFamilyProgram: jest.fn(),
  fetchStudentFamilyLinksByCampProgram: jest.fn(),
  markStudentFamilyLinksClaimed: jest.fn(),
}));

jest.mock('../familyChildGoalsService', () => {
  const actual = jest.requireActual('../familyChildGoalsService');
  return {
    ...actual,
    saveFamilyChildGoals: jest.fn(),
  };
});

jest.mock('../programGoalsService', () => ({
  saveProgramGoals: jest.fn(),
}));

jest.mock('../studentPinService', () => ({
  revealStudentPinViaFunction: jest.fn(),
}));

jest.mock('../kitIntegration', () => ({
  trackKitParentSignup: jest.fn(),
}));

const mockedFetchFamilyLinks = fetchStudentFamilyLinksByFamilyProgram as jest.MockedFunction<
  typeof fetchStudentFamilyLinksByFamilyProgram
>;
const mockedFetchCampLinks = fetchStudentFamilyLinksByCampProgram as jest.MockedFunction<
  typeof fetchStudentFamilyLinksByCampProgram
>;
const mockedMarkClaimed = markStudentFamilyLinksClaimed as jest.MockedFunction<
  typeof markStudentFamilyLinksClaimed
>;
const mockedSaveGoals = saveFamilyChildGoals as jest.MockedFunction<typeof saveFamilyChildGoals>;
const mockedSaveProgramGoals = saveProgramGoals as jest.MockedFunction<typeof saveProgramGoals>;
const mockedRevealPin = revealStudentPinViaFunction as jest.MockedFunction<
  typeof revealStudentPinViaFunction
>;
const mockedTrackKit = trackKitParentSignup as jest.MockedFunction<typeof trackKitParentSignup>;

describe('submitParentOnboarding', () => {
  beforeEach(() => {
    window.localStorage.clear();
    writeActivePilotProgram({
      id: 'family-1',
      programCode: 'FAMILY-TEST',
      programName: 'Test Family Program',
      familyAccessCode: 'ACCESS-123',
      groupName: 'Test Group',
    } as never);
    writeActiveAccessCode('ACCESS-123');

    mockedFetchFamilyLinks.mockResolvedValue({
      links: [
        {
          id: 'link-1',
          student_id: 'child-1',
          family_program_code: 'FAMILY-TEST',
          camp_program_code: 'CAMP-TEST',
          parent_email: null,
          parent_claimed: false,
        } as never,
      ],
      error: undefined,
    });
    mockedFetchCampLinks.mockResolvedValue({ links: [], error: undefined });
    mockedMarkClaimed.mockResolvedValue({ success: true });
    mockedSaveGoals.mockResolvedValue({
      record: {
        family_program_code: 'FAMILY-TEST',
        child_id: 'child-1',
        child_name: 'Alex',
        parent_email: 'parent@example.com',
        goals: ['Focus'],
        strengths: ['Focus'],
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });
    mockedSaveProgramGoals.mockResolvedValue({
      program_code: 'FAMILY-TEST',
      portal_type: 'family',
      selected_goals: ['Focus'],
    });
    mockedRevealPin.mockResolvedValue({ pin: '4321' });
    mockedTrackKit.mockImplementation(() => undefined);
  });

  test('saves parent email and family goals to scoped family link', async () => {
    const result = await submitParentOnboarding({
      programCode: 'FAMILY-TEST',
      parentEmail: 'parent@example.com',
      childParticipantId: 'child-1',
      childDisplayName: 'Alex',
      selectedGoals: ['Focus', 'Confidence'],
    });

    expect(result.success).toBe(true);
    expect(mockedMarkClaimed).toHaveBeenCalledWith(
      expect.objectContaining({
        linkIds: ['link-1'],
        familyProgramCode: 'FAMILY-TEST',
        parentEmail: 'parent@example.com',
      }),
    );
    expect(mockedSaveGoals).toHaveBeenCalledWith(
      expect.objectContaining({
        family_program_code: 'FAMILY-TEST',
        child_id: 'child-1',
        parent_email: 'parent@example.com',
        goals: ['Focus', 'Confidence'],
      }),
    );

    const claim = readParentClaimContext();
    expect(claim?.email).toBe('parent@example.com');
    expect(claim?.confirmed).toBe(true);
    expect(claim?.programCode).toBe('FAMILY-TEST');

    const onboardingRecord = readFamilyOnboardingRecord(
      'FAMILY-TEST',
      'child-1',
      'parent@example.com',
    );
    expect(onboardingRecord?.complete).toBe(true);
    expect(onboardingRecord?.familyGoals).toEqual(['Focus', 'Confidence']);
  });

  test('parent/guardian goals satisfy checklist completion requirements', async () => {
    await submitParentOnboarding({
      programCode: 'FAMILY-TEST',
      parentEmail: 'parent@example.com',
      childParticipantId: 'child-1',
      childDisplayName: 'Alex',
      selectedGoals: ['Reading'],
    });

    expect(hasFamilyChildGoals(mockedSaveGoals.mock.calls[0]?.[0] as never)).toBe(true);
  });

  test('returns error when parent email link save fails', async () => {
    mockedMarkClaimed.mockResolvedValueOnce({ success: false, error: 'Database unavailable' });

    const result = await submitParentOnboarding({
      programCode: 'FAMILY-TEST',
      parentEmail: 'parent@example.com',
      childParticipantId: 'child-1',
      childDisplayName: 'Alex',
      selectedGoals: ['Focus'],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toContain('Database unavailable');
    }
    expect(
      readFamilyOnboardingRecord('FAMILY-TEST', 'child-1', 'parent@example.com'),
    ).toBeNull();
  });

  test('attempts welcome email and Kit Parent tag after successful onboarding', async () => {
    await submitParentOnboarding({
      programCode: 'FAMILY-TEST',
      parentEmail: 'parent@example.com',
      childParticipantId: 'child-1',
      childDisplayName: 'Alex',
      selectedGoals: ['Focus'],
    });

    expect(mockedTrackKit).toHaveBeenCalledWith(
      expect.objectContaining({
        parentEmail: 'parent@example.com',
        eventName: 'parent_onboarding_complete',
        welcomeEmail: expect.objectContaining({
          parentEmail: 'parent@example.com',
          familyAccessCode: 'ACCESS-123',
          childName: 'Alex',
          studentPin: '4321',
        }),
      }),
    );
  });

  test('persists scoped parent claim for program-scoped parent email login', async () => {
    await submitParentOnboarding({
      programCode: 'FAMILY-TEST',
      parentEmail: 'parent@example.com',
      childParticipantId: 'child-1',
      childDisplayName: 'Alex',
      selectedGoals: ['Focus'],
    });

    const claim = readParentClaimContext();
    expect(claim?.email).toBe('parent@example.com');
    expect(claim?.programCode).toBe('FAMILY-TEST');
    expect(claim?.confirmed).toBe(true);
    expect(claim?.accessCode).toBe('ACCESS-123');
  });
});
