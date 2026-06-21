import { certificatesReadyFilterPath, rosterFilterPath } from '../askB4DeepLinks';
import { getCampReadiness } from '../campReadiness';
import { buildFacilitatorProgramCoachModel } from '../facilitatorProgramCoachModel';
import { BASELINE_CHECKIN_MISSION_ID, coerceBaselineLockedMission } from '../baselineCheckInMission';
import { resolveLaunchMissionForWeek } from '../launchWeeklyMission';
import { courageInTheDarkMissions } from '../../data/courageInTheDarkMap';

import type { PilotTrackingMetrics } from '../pilotTrackingMetrics';
import type { StudentParticipantRecord } from '../pilotTrackingService';

const mockStudent = (): StudentParticipantRecord =>
  ({
    id: 's1',
    role: 'student',
    first_name: 'Alex',
    nickname: 'Alex',
    program_code: 'CAMP-2026',
    created_at: new Date().toISOString(),
  }) as StudentParticipantRecord;

const mockMetrics = (): PilotTrackingMetrics =>
  ({
    studentsEnrolled: 1,
    baselineChecksCompleted: 0,
    moduleCompletions: 0,
    uniqueModulesCompleted: 0,
    averageModuleScorePct: 0,
    adultPreAssessments: 0,
    adultPostAssessments: 0,
    adultGrowthDeltaAvg: null,
    studentBaselineV2: 0,
    studentFinalV2: 0,
    baselineScores: { overall: 0, reading: 0, confidence: 0, focus: 0 },
    currentScores: { overall: 0, reading: 0, confidence: 0, focus: 0 },
    growthSinceBaseline: { overall: 0, reading: 0, confidence: 0, focus: 0 },
  }) as PilotTrackingMetrics;

describe('pilot coach deep links', () => {
  test('camp readiness missing baseline links to roster filter', () => {
    const summary = getCampReadiness({
      participants: [],
      assessments: [],
      modules: [],
      rosterPath: '/program-dashboard/roster',
      resultsPath: '/program-dashboard/results',
      weeklyModulesPath: '/program-dashboard/weekly-modules',
      certificatesPath: '/program-dashboard/certificates',
    });

    expect(summary.items.find((item) => item.id === 'missing-baseline')?.href).toBe(
      rosterFilterPath('missing-baseline'),
    );
    expect(summary.items.find((item) => item.id === 'requires-follow-up')?.href).toBe(
      rosterFilterPath('requires-follow-up'),
    );
    expect(summary.items.find((item) => item.id === 'certificates-ready')?.href).toBe(
      certificatesReadyFilterPath(),
    );
  });

  test('coach insight missing baseline links to roster filter', () => {
    const model = buildFacilitatorProgramCoachModel({
      participants: [mockStudent()],
      assessments: [],
      modules: [],
      metrics: mockMetrics(),
    });

    const missingBaseline = model.insights.find((row) => row.id === 'missing-baseline');
    expect(missingBaseline?.href).toBe(rosterFilterPath('missing-baseline'));
  });
});

describe('baseline check-in launch', () => {
  test('baseline locked launch resolves b4-self-check-in mission', () => {
    const mission = resolveLaunchMissionForWeek(courageInTheDarkMissions, {
      week: 1,
      baselineLocked: true,
      completedMissionIds: [],
    });
    expect(mission?.id).toBe('b4');
    expect(coerceBaselineLockedMission(mission!).targetGameSlug).toBe(BASELINE_CHECKIN_MISSION_ID);
  });
});
