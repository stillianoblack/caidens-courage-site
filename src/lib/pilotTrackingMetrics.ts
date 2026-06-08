import type { B4BaselineCheckRecord } from './b4BaselineCheckStorage';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from './pilotTrackingLocalStorage';
import { computePilotDashboardMetrics, type PilotDashboardMetrics } from './pilotDashboardMetrics';

export type PilotTrackingMetrics = PilotDashboardMetrics & {
  moduleCompletions: number;
  uniqueModulesCompleted: number;
  averageModuleScorePct: number;
  adultPreAssessments: number;
  adultPostAssessments: number;
  adultGrowthDeltaAvg: number | null;
  studentBaselineV2: number;
  studentFinalV2: number;
};

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function computeAdultGrowthDelta(assessments: LocalAssessmentV2Record[]): number | null {
  const preByParticipant = new Map<string, LocalAssessmentV2Record>();
  const deltas: number[] = [];

  assessments
    .filter((row) => row.assessment_type === 'adult_pre')
    .forEach((row) => {
      preByParticipant.set(row.participant_id, row);
    });

  assessments
    .filter((row) => row.assessment_type === 'adult_post')
    .forEach((row) => {
      const pre = preByParticipant.get(row.participant_id);
      if (!pre || pre.total_score == null || row.total_score == null) return;
      deltas.push(row.total_score - pre.total_score);
    });

  if (deltas.length === 0) return null;
  return Math.round((deltas.reduce((sum, value) => sum + value, 0) / deltas.length) * 10) / 10;
}

export function computePilotTrackingMetrics(input: {
  legacyBaselines?: B4BaselineCheckRecord[];
  moduleResults?: LocalModuleResultRecord[];
  assessmentV2?: LocalAssessmentV2Record[];
}): PilotTrackingMetrics {
  const legacy = computePilotDashboardMetrics(input.legacyBaselines ?? []);
  const moduleResults = input.moduleResults ?? [];
  const assessmentV2 = input.assessmentV2 ?? [];

  const uniqueModules = new Set(moduleResults.map((row) => row.module_id));
  const moduleScores = moduleResults
    .map((row) => row.percent_score)
    .filter((value): value is number => typeof value === 'number');

  const studentBaselineV2 = assessmentV2.filter((row) => row.assessment_type === 'baseline').length;
  const studentFinalV2 = assessmentV2.filter((row) => row.assessment_type === 'final').length;
  const adultPreAssessments = assessmentV2.filter((row) => row.assessment_type === 'adult_pre').length;
  const adultPostAssessments = assessmentV2.filter((row) => row.assessment_type === 'adult_post').length;

  const baselineChecksCompleted = Math.max(legacy.baselineChecksCompleted, studentBaselineV2);
  const studentsEnrolled = Math.max(
    legacy.studentsEnrolled,
    new Set(
      assessmentV2
        .filter((row) => row.role === 'student')
        .map((row) => row.participant_id),
    ).size,
  );

  return {
    ...legacy,
    studentsEnrolled,
    baselineChecksCompleted,
    completionRate:
      studentsEnrolled > 0
        ? Math.round((baselineChecksCompleted / studentsEnrolled) * 100)
        : legacy.completionRate,
    moduleCompletions: moduleResults.length,
    uniqueModulesCompleted: uniqueModules.size,
    averageModuleScorePct: average(moduleScores),
    adultPreAssessments,
    adultPostAssessments,
    adultGrowthDeltaAvg: computeAdultGrowthDelta(assessmentV2),
    studentBaselineV2,
    studentFinalV2,
  };
}
