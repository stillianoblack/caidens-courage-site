import { averageBaselinePctFromV2 } from './baselineV2Display';
import type { B4BaselineCheckRecord } from './b4BaselineCheckStorage';
import type { PilotActivityItem, PilotGrowthMetrics } from './pilotDashboardMetrics';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from './pilotTrackingLocalStorage';
import { computePilotDashboardMetrics, type PilotDashboardMetrics } from './pilotDashboardMetrics';
import type { StudentParticipantRecord } from './pilotTrackingService';

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

function computeGrowthFromBaselineV2(assessmentV2: LocalAssessmentV2Record[]): PilotGrowthMetrics {
  const averages = averageBaselinePctFromV2(assessmentV2);
  return {
    confidence: averages.confidence,
    reading: averages.reading,
    focus: averages.focus,
    overall: averages.overall,
  };
}

function buildTrackingActivity(input: {
  assessmentV2: LocalAssessmentV2Record[];
  moduleResults: LocalModuleResultRecord[];
  participantLookup: Map<string, { nickname: string | null; first_name: string | null }>;
}): PilotActivityItem[] {
  const items: PilotActivityItem[] = [];

  for (const row of input.assessmentV2) {
    if (!row.completed_at) continue;
    const name =
      input.participantLookup.get(row.participant_id)?.nickname?.trim() ||
      input.participantLookup.get(row.participant_id)?.first_name?.trim() ||
      'Student';
    items.push({
      id: `assessment-${row.id}`,
      type: 'assessment',
      label: `${name} completed ${row.assessment_type}`,
      detail: row.program_code || 'Assessment',
      at: row.completed_at,
    });
  }

  for (const row of input.moduleResults) {
    if (!row.completed_at) continue;
    const name =
      input.participantLookup.get(row.participant_id)?.nickname?.trim() ||
      input.participantLookup.get(row.participant_id)?.first_name?.trim() ||
      'Student';
    items.push({
      id: `module-${row.id}`,
      type: 'submission',
      label: `${name} completed ${row.module_title || row.module_id}`,
      detail: row.program_code || row.character || 'Module',
      at: row.completed_at,
    });
  }

  return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 8);
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
  participants?: StudentParticipantRecord[];
}): PilotTrackingMetrics {
  const legacy = computePilotDashboardMetrics(input.legacyBaselines ?? []);
  const moduleResults = input.moduleResults ?? [];
  const assessmentV2 = input.assessmentV2 ?? [];
  const participants = input.participants ?? [];
  const participantLookup = new Map(
    participants.map((row) => [row.id, { nickname: row.nickname, first_name: row.first_name }]),
  );

  const uniqueModules = new Set(moduleResults.map((row) => row.module_id));
  const moduleScores = moduleResults
    .map((row) => row.percent_score)
    .filter((value): value is number => typeof value === 'number');

  const studentBaselineV2 = assessmentV2.filter(
    (row) => row.assessment_type === 'baseline' && row.participant_id?.trim(),
  ).length;
  const studentFinalV2 = assessmentV2.filter((row) => row.assessment_type === 'final').length;
  const adultPreAssessments = assessmentV2.filter((row) => row.assessment_type === 'adult_pre').length;
  const adultPostAssessments = assessmentV2.filter((row) => row.assessment_type === 'adult_post').length;

  const baselineChecksCompleted = Math.max(legacy.baselineChecksCompleted, studentBaselineV2);
  const studentsEnrolled = Math.max(
    legacy.studentsEnrolled,
    participants.length,
    new Set(
      assessmentV2
        .filter((row) => row.role === 'student' && row.participant_id?.trim())
        .map((row) => row.participant_id),
    ).size,
    new Set(moduleResults.filter((row) => row.participant_id?.trim()).map((row) => row.participant_id))
      .size,
  );

  const v2Growth = computeGrowthFromBaselineV2(assessmentV2);
  const growth = studentBaselineV2 > 0 ? v2Growth : legacy.growth;
  const trackingActivity = buildTrackingActivity({
    assessmentV2,
    moduleResults,
    participantLookup,
  });
  const recentActivity =
    trackingActivity.length > 0 ? trackingActivity : legacy.recentActivity;

  return {
    ...legacy,
    studentsEnrolled,
    baselineChecksCompleted,
    growth,
    recentActivity,
    completionRate:
      studentsEnrolled > 0
        ? Math.round((baselineChecksCompleted / studentsEnrolled) * 100)
        : 0,
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
