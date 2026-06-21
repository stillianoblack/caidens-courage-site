import {
  familyOnboardingStorageKey,
  markFamilyOnboardingComplete,
  markFamilyOnboardingSkipped,
  readFamilyOnboardingRecord,
  resolveFamilyOnboardingVisibility,
} from '../parentOnboardingState';

describe('parentOnboardingState', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('uses scoped storage key with program, participant, and email', () => {
    expect(
      familyOnboardingStorageKey('Camp-2026', 'child-abc', 'Parent@Example.com'),
    ).toBe('cc-family-onboarding-complete:camp-2026:child-abc:parent@example.com');
  });

  test('connected parent does not show onboarding modal', () => {
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
        {
          id: 'link-1',
          student_id: 'child-1',
          camp_program_code: 'CAMP-1',
          family_program_code: 'FAMILY-TEST',
          parent_email: 'parent@example.com',
          parent_claimed: true,
        } as never,
      ],
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
