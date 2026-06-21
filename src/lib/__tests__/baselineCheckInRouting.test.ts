import {
  appendBaselineCheckInSource,
  BASELINE_CHECKIN_SOURCE_WEEKLY,
  isB4MissionLockedUntilBaselineComplete,
  readBaselineCheckInSource,
  resolveBaselineCheckInBackTarget,
} from '../baselineCheckInMission';
import { buildFamilyMissionCoachSteps } from '../../data/familyMissionCoachContent';
import { computeFocusFlameJourneyStatus } from '../focusFlameJourneyStatus';
import {
  classifyPortalCredential,
  resolvePortalUnlockDestination,
} from '../portalUnlockRoute';

describe('baseline check-in routing', () => {
  test('appends weekly adventures source param to check-in route', () => {
    expect(
      appendBaselineCheckInSource('/play/session/abc/kids/b4/check-in', BASELINE_CHECKIN_SOURCE_WEEKLY),
    ).toBe('/play/session/abc/kids/b4/check-in?source=weekly-adventures-baseline');
  });

  test('reads weekly adventures source from search params', () => {
    expect(readBaselineCheckInSource('?source=weekly-adventures-baseline')).toBe(
      BASELINE_CHECKIN_SOURCE_WEEKLY,
    );
  });

  test('returns weekly adventures back target when launched from baseline gate', () => {
    const target = resolveBaselineCheckInBackTarget({
      pathname: '/play/session/session-123/kids/b4/check-in',
      search: '?source=weekly-adventures-baseline',
    });

    expect(target.label).toBe('Back to Weekly Adventures');
    expect(target.path).toBe('/play/session/session-123/weekly-adventures');
  });

  test('returns B-4 missions back target without weekly source', () => {
    const target = resolveBaselineCheckInBackTarget({
      pathname: '/family/hub/kids/b4/check-in',
      search: '',
    });

    expect(target.label).toBe('Back to B-4 Missions');
    expect(target.path).toContain('/b4');
  });

  test('locks Mood Scanner until baseline check-in is complete', () => {
    expect(isB4MissionLockedUntilBaselineComplete('b4-mood-scanner', false)).toBe(true);
    expect(isB4MissionLockedUntilBaselineComplete('b4-mood-scanner', true)).toBe(false);
    expect(isB4MissionLockedUntilBaselineComplete('b4-self-check-in', false)).toBe(false);
  });
});

describe('family onboarding checklist progression', () => {
  test('advances to Complete the B-4 Check-In after family goals are saved', () => {
    const journey = computeFocusFlameJourneyStatus({
      participantId: 'child-1',
      programCode: 'FAMILY-123',
      hasChild: true,
      hasChildGrade: true,
      familyGoalsComplete: true,
      b4CheckInComplete: false,
      hasModuleActivity: false,
    });

    expect(journey.step3Complete).toBe(true);
    expect(journey.activeStep).toBe(4);

    const steps = buildFamilyMissionCoachSteps({
      journey,
      childrenSettingsPath: '/family/settings/children',
      childrenGradeSettingsPath: '/family/settings/children/grade',
      familyGoalsSettingsPath: '/family/settings/goals',
      baselinePath: '/family/kids/b4/check-in',
      settingsOverviewPath: '/family/settings/overview',
      continueLearningPath: '/family/continue-learning',
      onAddChild: () => undefined,
    });

    const goalsStep = steps.find((step) => step.id === 'family-goals');
    const checkInStep = steps.find((step) => step.id === 'b4-check-in');

    expect(goalsStep?.status).toBe('complete');
    expect(checkInStep?.label).toBe('Complete the B-4 Check-In');
    expect(checkInStep?.status).toBe('current');
  });
});

describe('portal login routing', () => {
  test('parent email routes to family portal overview path', () => {
    expect(classifyPortalCredential('parent@example.com')).toBe('parent_email');
    expect(
      resolvePortalUnlockDestination({
        accessCode: 'FAMILY-CODE',
        parentEmail: 'parent@example.com',
        programRole: 'family',
      }),
    ).toBe('family_portal');
  });

  test('student PIN routes to kid shell', () => {
    expect(classifyPortalCredential('1234')).toBe('student_pin');
    expect(
      resolvePortalUnlockDestination({
        accessCode: 'FAMILY-CODE',
        parentEmail: '1234',
        programRole: 'family',
      }),
    ).toBe('kid_shell');
  });

  test('facilitator email routes to facilitator roster portal', () => {
    expect(
      resolvePortalUnlockDestination({
        accessCode: 'FACIL-CODE',
        parentEmail: 'facilitator@camp.org',
        programRole: 'facilitator',
      }),
    ).toBe('facilitator_portal');
  });
});
