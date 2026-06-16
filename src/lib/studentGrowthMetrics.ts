import type { B4BaselineCheckRecord } from './b4BaselineCheckStorage';
import { GROWTH_START_WEEK } from '../config/pilotBaselineWeeks';
import {
  baselineSkillScoresFromAssessment,
  baselineSkillScoresFromLegacy,
  selectCanonicalModuleResultsForWeek,
  selectEarliestCanonicalBaselineAssessments,
  selectEarliestCanonicalLegacyBaselines,
  weeklySkillScoresFromModules,
} from './canonicalAttemptRules';
import type { PilotGrowthMetrics } from './pilotDashboardMetrics';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from './pilotTrackingLocalStorage';

export type SkillGrowthKey = 'executive' | 'selfRegulation' | 'focusRecovery' | 'overall';

export type SkillGrowthDimension = {
  key: SkillGrowthKey;
  label: string;
  baselinePct: number | null;
  currentPct: number | null;
  growthPct: number | null;
  baselineSource: string | null;
  currentSource: string | null;
};

export type StudentGrowthSnapshot = {
  participantId: string;
  hasBaseline: boolean;
  hasCurrent: boolean;
  skills: SkillGrowthDimension[];
  excludedAttemptCount: number;
  warnings: string[];
};

export type FamilyFocusSkillGrowth = {
  label: string;
  key: SkillGrowthKey;
  baselinePct: number | null;
  currentPct: number | null;
  growthPct: number | null;
};

const SKILL_LABELS: Record<SkillGrowthKey, string> = {
  executive: 'Executive Function',
  selfRegulation: 'Self-Regulation',
  focusRecovery: 'Focus Recovery',
  overall: 'Overall',
};

function growthDelta(current: number | null, baseline: number | null): number | null {
  if (current == null || baseline == null) return null;
  return current - baseline;
}

function resolveBaselineScores(input: {
  participantId: string;
  v2Assessments: LocalAssessmentV2Record[];
  legacyBaselines: B4BaselineCheckRecord[];
}): { scores: Record<SkillGrowthKey, number> | null; source: string | null } {
  const v2 = selectEarliestCanonicalBaselineAssessments(input.v2Assessments).find(
    (row) => row.participant_id === input.participantId,
  );
  if (v2) {
    const scores = baselineSkillScoresFromAssessment(v2);
    return { scores, source: `assessment_results_v2:${v2.id}` };
  }

  const legacy = selectEarliestCanonicalLegacyBaselines(input.legacyBaselines).find(
    (row) => row.participantId === input.participantId,
  );
  if (legacy) {
    return {
      scores: baselineSkillScoresFromLegacy(legacy),
      source: `legacy_b4_baseline:${legacy.participantId}`,
    };
  }

  return { scores: null, source: null };
}

function resolveCurrentWeeklyScores(input: {
  participantId: string;
  moduleResults: LocalModuleResultRecord[];
}): { scores: Record<SkillGrowthKey, number> | null; source: string | null; week: number | null } {
  const studentModules = input.moduleResults.filter(
    (row) => row.participant_id === input.participantId && row.role === 'student',
  );

  const week2 = selectCanonicalModuleResultsForWeek(studentModules, GROWTH_START_WEEK);
  if (week2.length > 0) {
    const scores = weeklySkillScoresFromModules(week2);
    if (scores) {
      return {
        scores,
        source: `canonical_week_${GROWTH_START_WEEK}_modules`,
        week: GROWTH_START_WEEK,
      };
    }
  }

  const week1 = selectCanonicalModuleResultsForWeek(studentModules, 1);
  if (week1.length > 0) {
    const scores = weeklySkillScoresFromModules(week1);
    if (scores) {
      return { scores, source: 'canonical_week_1_modules', week: 1 };
    }
  }

  return { scores: null, source: null, week: null };
}

function buildSkillDimensions(input: {
  baseline: Record<SkillGrowthKey, number> | null;
  current: Record<SkillGrowthKey, number> | null;
  baselineSource: string | null;
  currentSource: string | null;
}): SkillGrowthDimension[] {
  const keys: SkillGrowthKey[] = ['executive', 'selfRegulation', 'focusRecovery', 'overall'];

  return keys.map((key) => ({
    key,
    label: SKILL_LABELS[key],
    baselinePct: input.baseline?.[key] ?? null,
    currentPct: input.current?.[key] ?? null,
    growthPct: growthDelta(input.current?.[key] ?? null, input.baseline?.[key] ?? null),
    baselineSource: input.baseline ? input.baselineSource : null,
    currentSource: input.current ? input.currentSource : null,
  }));
}

export function computeStudentGrowthSnapshot(input: {
  participantId: string;
  v2Assessments: LocalAssessmentV2Record[];
  legacyBaselines: B4BaselineCheckRecord[];
  moduleResults: LocalModuleResultRecord[];
  excludedAttemptCount?: number;
}): StudentGrowthSnapshot {
  const warnings: string[] = [];
  const baseline = resolveBaselineScores(input);
  const current = resolveCurrentWeeklyScores(input);

  if (!baseline.scores) {
    warnings.push('No canonical B-4 baseline found for this student.');
  }
  if (baseline.scores && !current.scores) {
    warnings.push('Baseline exists but no canonical Week 1 or Week 2 module scores yet.');
  }
  if (current.week === 1 && baseline.scores) {
    warnings.push('Current progress is using canonical Week 1 modules (Week 2 not completed yet).');
  }

  const skills = buildSkillDimensions({
    baseline: baseline.scores,
    current: current.scores,
    baselineSource: baseline.source,
    currentSource: current.source,
  });

  for (const skill of skills) {
    if (
      skill.baselinePct != null &&
      skill.currentPct != null &&
      skill.currentPct - skill.baselinePct > 35
    ) {
      warnings.push(
        `${skill.label} current (${skill.currentPct}%) is much higher than baseline (${skill.baselinePct}%) — verify canonical attempts.`,
      );
    }
  }

  return {
    participantId: input.participantId,
    hasBaseline: baseline.scores != null,
    hasCurrent: current.scores != null,
    skills,
    excludedAttemptCount: input.excludedAttemptCount ?? 0,
    warnings,
  };
}

export function computeFamilyFocusSkillsGrowth(input: {
  allowedStudentIds: string[];
  v2Assessments: LocalAssessmentV2Record[];
  legacyBaselines: B4BaselineCheckRecord[];
  moduleResults: LocalModuleResultRecord[];
}): FamilyFocusSkillGrowth[] {
  const studentIds = input.allowedStudentIds.filter(Boolean);
  if (!studentIds.length) {
    return (['executive', 'selfRegulation', 'focusRecovery', 'overall'] as SkillGrowthKey[]).map(
      (key) => ({
        key,
        label: SKILL_LABELS[key],
        baselinePct: null,
        currentPct: null,
        growthPct: null,
      }),
    );
  }

  const snapshots = studentIds.map((participantId) =>
    computeStudentGrowthSnapshot({
      participantId,
      v2Assessments: input.v2Assessments,
      legacyBaselines: input.legacyBaselines,
      moduleResults: input.moduleResults,
    }),
  );

  const keys: SkillGrowthKey[] = ['executive', 'selfRegulation', 'focusRecovery', 'overall'];

  return keys.map((key) => {
    const baselines = snapshots
      .map((snapshot) => snapshot.skills.find((skill) => skill.key === key)?.baselinePct ?? null)
      .filter((value): value is number => value != null);
    const currents = snapshots
      .map((snapshot) => snapshot.skills.find((skill) => skill.key === key)?.currentPct ?? null)
      .filter((value): value is number => value != null);

    const baselinePct = baselines.length
      ? Math.round(baselines.reduce((sum, value) => sum + value, 0) / baselines.length)
      : null;
    const currentPct = currents.length
      ? Math.round(currents.reduce((sum, value) => sum + value, 0) / currents.length)
      : null;

    return {
      key,
      label: SKILL_LABELS[key],
      baselinePct,
      currentPct,
      growthPct: growthDelta(currentPct, baselinePct),
    };
  });
}

function averageGrowthMetrics(values: PilotGrowthMetrics[]): PilotGrowthMetrics {
  if (!values.length) {
    return { confidence: 0, reading: 0, focus: 0, overall: 0 };
  }
  const avg = (pick: (row: PilotGrowthMetrics) => number) =>
    Math.round(values.reduce((sum, row) => sum + pick(row), 0) / values.length);

  return {
    confidence: avg((row) => row.confidence),
    reading: avg((row) => row.reading),
    focus: avg((row) => row.focus),
    overall: avg((row) => row.overall),
  };
}

function snapshotToPilotGrowth(snapshot: StudentGrowthSnapshot): {
  baseline: PilotGrowthMetrics;
  current: PilotGrowthMetrics;
  growthSinceBaseline: PilotGrowthMetrics;
} {
  const read = (key: SkillGrowthKey) =>
    snapshot.skills.find((skill) => skill.key === key) ?? null;

  const baseline: PilotGrowthMetrics = {
    focus: read('executive')?.baselinePct ?? 0,
    confidence: read('selfRegulation')?.baselinePct ?? 0,
    reading: read('focusRecovery')?.baselinePct ?? 0,
    overall: read('overall')?.baselinePct ?? 0,
  };
  const current: PilotGrowthMetrics = {
    focus: read('executive')?.currentPct ?? 0,
    confidence: read('selfRegulation')?.currentPct ?? 0,
    reading: read('focusRecovery')?.currentPct ?? 0,
    overall: read('overall')?.currentPct ?? 0,
  };
  const growthSinceBaseline: PilotGrowthMetrics = {
    focus: read('executive')?.growthPct ?? 0,
    confidence: read('selfRegulation')?.growthPct ?? 0,
    reading: read('focusRecovery')?.growthPct ?? 0,
    overall: read('overall')?.growthPct ?? 0,
  };

  return { baseline, current, growthSinceBaseline };
}

export function computePilotGrowthRollups(input: {
  participantIds: string[];
  v2Assessments: LocalAssessmentV2Record[];
  legacyBaselines: B4BaselineCheckRecord[];
  moduleResults: LocalModuleResultRecord[];
}): {
  baselineScores: PilotGrowthMetrics;
  currentScores: PilotGrowthMetrics;
  growthSinceBaseline: PilotGrowthMetrics;
  studentSnapshots: StudentGrowthSnapshot[];
} {
  const snapshots = input.participantIds.map((participantId) =>
    computeStudentGrowthSnapshot({
      participantId,
      v2Assessments: input.v2Assessments,
      legacyBaselines: input.legacyBaselines,
      moduleResults: input.moduleResults,
    }),
  );

  const mapped = snapshots.map((snapshot) => snapshotToPilotGrowth(snapshot));

  return {
    baselineScores: averageGrowthMetrics(mapped.map((row) => row.baseline)),
    currentScores: averageGrowthMetrics(
      mapped.filter((_, index) => snapshots[index].hasCurrent).map((row) => row.current),
    ),
    growthSinceBaseline: averageGrowthMetrics(
      mapped
        .filter((_, index) => snapshots[index].hasBaseline && snapshots[index].hasCurrent)
        .map((row) => row.growthSinceBaseline),
    ),
    studentSnapshots: snapshots,
  };
}
