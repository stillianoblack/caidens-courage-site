import { writeLastPilotProgram } from '../../config/lastPilotProgram';
import type { ActivePilotProgram } from '../../types/pilotProgram';
import { trackKitParentSignup } from '../kitIntegration';
import {
  clearStaleFamilyOnboardingForLinkedParent,
  familyOnboardingStorageKey,
  isParentEmailLinkedToChild,
  markFamilyOnboardingComplete,
  markFamilyOnboardingSkipped,
  readFamilyOnboardingRecord,
  resolveFamilyOnboardingVisibility,
  resolveLoggedInParentEmail,
  shouldShowFamilyOnboarding,
  syncLinkedParentKitSilently,
} from '../parentOnboardingState';

jest.mock('../kitIntegration', () => ({
  trackKitParentSignup: jest.fn(),
}));

const mockProgram = (overrides: Partial<ActivePilotProgram> = {}): ActivePilotProgram =>
  ({
    id: 'prog-1',
    programCode: 'FAMILY-RIVER',
    programName: 'River Family',
    familyAccessCode: 'FAMILY-RIVER-2026',
    facilitatorAccessCode: 'FACIL-RIVER',
    groupName: 'River Camp',
    adminEmail: 'facilitator@camp.org',
    ...overrides,
  }) as ActivePilotProgram;

const baseLink = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'link-1',
    student_id: 'child-caiden',
    camp_program_code: 'RIVER-2026',
    family_program_code: 'FAMILY-RIVER',
    parent_email: null,
    parent_first_name: null,
    parent_last_name: null,
    parent_phone: null,
    parent_claimed: false,
    ...overrides,
  }) as never;

describe('parentOnboardingState', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  test('uses scoped storage key with program, participant, and email', () => {
    expect(
      familyOnboardingStorageKey('Camp-2026', 'child-abc', 'Parent@Example.com'),
    ).toBe('cc-family-onboarding-complete:camp-2026:child-abc:parent@example.com');
  });

  test('existing linked parent logs in → no claim modal (Victoria/Maddox scenario)', () => {
    writeLastPilotProgram(
      mockProgram(),
      'family',
      'v.maddox2015@gmail.com',
      'FAMILY-RIVER-2026',
    );

    const familyLinks = [
      baseLink({
        parent_email: 'v.maddox2015@gmail.com',
        parent_claimed: false,
        parent_first_name: 'Victoria',
      }),
    ];

    expect(
      resolveLoggedInParentEmail({ programCode: 'FAMILY-RIVER' }),
    ).toBe('v.maddox2015@gmail.com');

    expect(
      isParentEmailLinkedToChild({
        parentEmail: 'v.maddox2015@gmail.com',
        participantId: 'child-caiden',
        familyLinks,
      }),
    ).toBe(true);

    const decision = shouldShowFamilyOnboarding({
      programCode: 'FAMILY-RIVER',
      parentSession: { parentEmail: resolveLoggedInParentEmail({ programCode: 'FAMILY-RIVER' }) },
      familyLinks,
      activeChild: { participantId: 'child-caiden', displayName: 'Caiden' },
    });

    expect(decision.show).toBe(false);
    expect(decision.goalsOnly).toBe(false);
    expect(
      readFamilyOnboardingRecord('FAMILY-RIVER', 'child-caiden', 'v.maddox2015@gmail.com')?.complete,
    ).toBe(true);
  });

  test('connected parent with parent_claimed does not show onboarding modal', () => {
    const decision = resolveFamilyOnboardingVisibility({
      programCode: 'FAMILY-TEST',
      participantId: 'child-1',
      parentEmail: 'parent@example.com',
      parentClaim: {
        email: 'parent@example.com',
        confirmed: true,
        programCode: 'FAMILY-TEST',
      },
      familyLinks: [
        baseLink({
          student_id: 'child-1',
          parent_email: 'parent@example.com',
          parent_claimed: true,
        }),
      ],
    });

    expect(decision.show).toBe(false);
  });

  test('new parent using claim code with no link email sees claim flow', () => {
    const decision = shouldShowFamilyOnboarding({
      programCode: 'FAMILY-TEST',
      parentSession: { parentEmail: null, parentClaim: null },
      familyLinks: [
        baseLink({
          student_id: 'child-1',
          parent_email: null,
          parent_claimed: false,
        }),
      ],
      activeChild: { participantId: 'child-1' },
    });

    expect(decision.show).toBe(true);
    expect(decision.goalsOnly).toBe(false);
  });

  test('linked parent missing Kit tag → no modal, silent Kit sync only', () => {
    syncLinkedParentKitSilently({
      parentEmail: 'parent@example.com',
      programCode: 'FAMILY-TEST',
      participantId: 'child-1',
    });

    expect(trackKitParentSignup).toHaveBeenCalledWith({
      parentEmail: 'parent@example.com',
      eventName: 'parent_login',
      metadata: {
        family_program_code: 'FAMILY-TEST',
        participant_id: 'child-1',
        source: 'linked_parent_login',
      },
    });
    expect(trackKitParentSignup).not.toHaveBeenCalledWith(
      expect.objectContaining({ welcomeEmail: expect.anything() }),
    );

    const decision = shouldShowFamilyOnboarding({
      programCode: 'FAMILY-TEST',
      parentSession: { parentEmail: 'parent@example.com' },
      familyLinks: [
        baseLink({
          student_id: 'child-1',
          parent_email: 'parent@example.com',
          parent_claimed: true,
        }),
      ],
      activeChild: { participantId: 'child-1' },
    });

    expect(decision.show).toBe(false);
  });

  test('stale localStorage onboarding flag does not override DB-linked state', () => {
    window.localStorage.setItem(
      familyOnboardingStorageKey('FAMILY-TEST', 'child-1', 'parent@example.com'),
      JSON.stringify({
        parentEmail: 'parent@example.com',
        programCode: 'FAMILY-TEST',
        participantId: 'child-1',
        complete: false,
        skipped: false,
        familyGoals: [],
      }),
    );

    clearStaleFamilyOnboardingForLinkedParent({
      programCode: 'FAMILY-TEST',
      participantId: 'child-1',
      parentEmail: 'parent@example.com',
    });

    const decision = shouldShowFamilyOnboarding({
      programCode: 'FAMILY-TEST',
      parentSession: { parentEmail: 'parent@example.com' },
      familyLinks: [
        baseLink({
          student_id: 'child-1',
          parent_email: 'parent@example.com',
          parent_claimed: false,
        }),
      ],
      activeChild: { participantId: 'child-1' },
    });

    expect(decision.show).toBe(false);
    expect(readFamilyOnboardingRecord('FAMILY-TEST', 'child-1', 'parent@example.com')?.complete).toBe(
      true,
    );
  });

  test('skipped onboarding does not reappear', () => {
    markFamilyOnboardingSkipped({
      programCode: 'FAMILY-TEST',
      participantId: 'child-1',
      parentEmail: 'parent@example.com',
    });

    const decision = resolveFamilyOnboardingVisibility({
      programCode: 'FAMILY-TEST',
      participantId: 'child-1',
      parentEmail: 'parent@example.com',
      parentClaim: null,
      familyLinks: [],
    });

    expect(decision.show).toBe(false);
    expect(readFamilyOnboardingRecord('FAMILY-TEST', 'child-1', 'parent@example.com')?.skipped).toBe(
      true,
    );
  });

  test('completed onboarding does not reappear', () => {
    markFamilyOnboardingComplete({
      programCode: 'FAMILY-TEST',
      participantId: 'child-1',
      parentEmail: 'parent@example.com',
      familyGoals: ['Focus'],
    });

    const decision = resolveFamilyOnboardingVisibility({
      programCode: 'FAMILY-TEST',
      participantId: 'child-1',
      parentEmail: 'parent@example.com',
      parentClaim: null,
      familyLinks: [],
    });

    expect(decision.show).toBe(false);
  });
});
