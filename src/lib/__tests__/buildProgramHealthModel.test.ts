import { buildProgramHealthModel, isGrowthPending } from '../buildProgramHealthModel';
import type { PilotOutcomeProgram } from '../../types/pilotOutcomes';

function baseProgram(overrides: Partial<PilotOutcomeProgram> = {}): PilotOutcomeProgram {
  return {
    id: 'p1',
    programName: 'Blue Ribbon Results Academy',
    programType: 'Camp / Youth Program',
    facilitator: 'Alex',
    status: 'active',
    startDate: '2026-01-15',
    activeStudentCount: 17,
    baseline: { count: 13, total: 17 },
    post: { count: 0, total: 17 },
    matchedCount: 0,
    baselineAverage: 72,
    postAverage: null,
    absoluteDelta: null,
    percentageDelta: null,
    percentageDeltaAvailable: false,
    weeklyCompletion: { count: 40, total: 85, rate: 47.1 },
    impactSnapshot: {
      domains: [],
      weeklyCompletion: {
        numerator: 40,
        denominator: 85,
        percentage: 47.1,
        dataQualityStatus: 'Available',
        displayStatus: 'On track',
        missingReason: null,
      },
      participation: {
        numerator: 13,
        denominator: 17,
        percentage: 76.5,
        dataQualityStatus: 'Available',
        displayStatus: 'On track',
        missingReason: null,
        baselineCompleted: 13,
        postCompleted: 0,
      },
      overallMatchedGrowth: {
        deltaPercentagePoints: null,
        includedDomainCount: 0,
        totalDomainCount: 3,
        matchedStudentCount: 0,
        requiredMatchedCount: 5,
        weighting: 'Unweighted average',
        dataQualityStatus: 'Not enough data',
        displayStatus: 'Not enough data',
        missingReason: 'Awaiting matched post scores.',
      },
    },
    certificateCount: 2,
    focusCoins: 120,
    assessmentCount: 13,
    missionCount: 4,
    lastActivity: '2026-07-20T12:00:00.000Z',
    reportStatus: 'Blocked',
    reportBlockers: ['No matched baseline and post-assessment records'],
    categories: [],
    gradeDistribution: [],
    quality: {
      missingBaseline: 4,
      missingPost: 17,
      unmatchedRecords: 17,
      duplicateAssessmentWarnings: 0,
      invalidScoreRanges: 0,
      studentsWithoutGrade: 0,
      programWithoutStartDate: false,
      staleProgram: false,
    },
    students: [
      {
        studentLabel: 'Student 001',
        grade: '3rd–5th',
        baselineScore: 70,
        postScore: null,
        delta: null,
        weeklyAdventuresCompleted: 2,
        assessmentsCompleted: 1,
        missionsCompleted: 1,
        focusCoins: 10,
        certificates: 0,
        lastActivity: new Date().toISOString(),
        dataCompleteness: 'Baseline only',
      },
    ],
    ...overrides,
  };
}

describe('buildProgramHealthModel', () => {
  it('builds fixture-aligned health metrics and timeline labels', () => {
    const model = buildProgramHealthModel(baseProgram());
    expect(model.metrics.map((row) => row.label)).toEqual([
      'Students enrolled',
      'Baseline completed',
      'At least one adventure',
      'At least one assessment',
      'Weekly completion',
      'Participation',
      'Certificates earned',
      'Coins earned',
      'Active students this week',
    ]);
    expect(model.metrics[0].value).toBe('17');
    expect(model.metrics[1].value).toBe('13 of 17');
    expect(model.metrics[5].value).toBe('76.5%');
    expect(model.timeline.map((step) => step.label)).toEqual([
      'Program Created',
      'Students Added',
      'Baseline Complete',
      'Adventures Active',
      'Weekly Activities',
      'Post Assessment',
      'Final Growth Report',
    ]);
    expect(model.statusBanner).toMatch(/Growth pending|post-assessment/i);
  });

  it('detects growth pending when baseline exists without post scores', () => {
    expect(isGrowthPending(baseProgram())).toBe(true);
    expect(isGrowthPending(baseProgram({ post: { count: 2, total: 17 } }))).toBe(false);
  });
});
