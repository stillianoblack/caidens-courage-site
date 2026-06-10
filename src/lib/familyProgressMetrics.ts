import {
  ADULT_POST_ASSESSMENT_TYPE,
  ADULT_PRE_ASSESSMENT_TYPE,
  CHILD_BEFORE_CHECK_IN_LABEL,
  isChildBaselineAssessmentType,
} from '../config/assessmentTypeConstants';
import type { B4BaselineCheckRecord } from './b4BaselineCheckStorage';
import type { FamilyChildSummary } from './familyChildrenMetrics';
import type { FamilyChildBaselineStatus } from './familyChildrenMetrics';
import {
  getAssessmentProgress,
  getCategoryProgressRows,
  getFamilyOverallProgress,
  groupProgressBySkillArea,
  partitionAdultAssessments,
  partitionChildAssessments,
  type ProgressCounts,
} from './familyProgressHelpers';
import type { StudentFamilyLink } from './studentFamilyLinkService';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from './pilotTrackingLocalStorage';

export type FamilyProgressTone = 'story' | 'reading' | 'focus' | 'creative' | 'overall';

export type FamilyProgressRow = {
  key: string;
  label: string;
  pct: number;
  tone: FamilyProgressTone;
  completed: number;
  total: number;
  labelDetail: string;
};

export type FamilyFocusSkill = {
  label: string;
  value: number;
};

export type FamilyRecentActivityItem = {
  id: string;
  label: string;
  kind: 'baseline' | 'module' | 'certificate' | 'gallery' | 'goals' | 'activity' | 'linked';
  timestamp?: string;
};

export type FamilyProgressSnapshot = {
  rows: FamilyProgressRow[];
  focusSkills: FamilyFocusSkill[];
  recentActivity: string[];
  hasActivity: boolean;
  hasChildActivity: boolean;
  overallLabel: string;
  overall: ProgressCounts;
  assessments: ProgressCounts;
  emptyStateMessage: string | null;
};

function buildRecentActivity(
  modules: LocalModuleResultRecord[],
  baselines: B4BaselineCheckRecord[],
  assessments: LocalAssessmentV2Record[] = [],
  adultEvents: string[] = [],
): string[] {
  const moduleItems = modules
    .slice()
    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
    .slice(0, 5)
    .map((row) => `${row.module_title} completed`);

  const v2Items = assessments
    .slice()
    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
    .slice(0, 4)
    .map((row) => {
      const answers = row.answers_json as { nickname?: string; firstName?: string } | undefined;
      const name = answers?.nickname?.trim() || answers?.firstName?.trim();
      const assessmentType = String(row.assessment_type);
      const label = isChildBaselineAssessmentType(assessmentType)
        ? CHILD_BEFORE_CHECK_IN_LABEL
        : assessmentType === 'final'
          ? 'Growth Check'
          : assessmentType === ADULT_PRE_ASSESSMENT_TYPE
            ? 'Adult Baseline'
            : assessmentType === ADULT_POST_ASSESSMENT_TYPE
              ? 'Adult Growth Check'
              : assessmentType.replace(/_/g, ' ');
      return name ? `${name} completed ${label}` : `${label} completed`;
    });

  const coveredNames = new Set(
    assessments
      .filter((row) => row.role === 'student' && isChildBaselineAssessmentType(row.assessment_type))
      .map((row) => {
        const answers = row.answers_json as { nickname?: string } | undefined;
        return answers?.nickname?.trim().toLowerCase() ?? '';
      })
      .filter(Boolean),
  );

  const baselineItems = baselines
    .slice()
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .filter((row) => !coveredNames.has(row.nickname.trim().toLowerCase()))
    .slice(0, 3)
    .map((row) =>
      row.nickname
        ? `${row.nickname} completed ${CHILD_BEFORE_CHECK_IN_LABEL}`
        : `${CHILD_BEFORE_CHECK_IN_LABEL} completed`,
    );

  return [...adultEvents, ...moduleItems, ...v2Items, ...baselineItems].slice(0, 6);
}

function resolveEmptyStateMessage(input: {
  adultBaselineComplete: boolean;
  adultGrowthComplete: boolean;
  hasChildActivity: boolean;
}): string | null {
  if (input.hasChildActivity) return null;
  if (input.adultBaselineComplete && !input.adultGrowthComplete) {
    return 'Adult baseline complete. Child activities will appear after your child completes a mission.';
  }
  if (input.adultBaselineComplete && input.adultGrowthComplete) {
    return 'Adult learning complete. Child activities will appear after your child completes a mission.';
  }
  return null;
}

export function computeFamilyProgressSnapshot(input: {
  programCode?: string;
  moduleResults?: LocalModuleResultRecord[];
  assessmentResults?: LocalAssessmentV2Record[];
  legacyBaselines?: B4BaselineCheckRecord[];
  adultBaselineComplete?: boolean;
  adultGrowthComplete?: boolean;
  children?: FamilyChildSummary[];
}): FamilyProgressSnapshot {
  const programCode = input.programCode?.trim() ?? '';
  const modules = input.moduleResults ?? [];
  const assessments = input.assessmentResults ?? [];
  const baselines = (input.legacyBaselines ?? []).filter((row) => Boolean(row.completedAt));
  const children = input.children ?? [];
  const childCount = children.length;
  const childBaselinesComplete = children.filter((child) => child.baselineStatus === 'Complete').length;

  const studentModules = modules.filter((row) => row.role === 'student');
  const adultModules = modules.filter(
    (row) => row.role === 'adult' || row.role === 'parent' || row.role === 'facilitator',
  );

  const adultBaselineComplete = Boolean(input.adultBaselineComplete);
  const adultGrowthComplete = Boolean(input.adultGrowthComplete);

  const hasChildActivity =
    studentModules.length > 0 ||
    childBaselinesComplete > 0 ||
    baselines.length > 0 ||
    partitionChildAssessments(assessments).length > 0;

  const hasActivity =
    hasChildActivity ||
    adultBaselineComplete ||
    adultGrowthComplete ||
    adultModules.length > 0 ||
    partitionAdultAssessments(assessments).length > 0;

  const assessmentsProgress = getAssessmentProgress({
    adultBaselineComplete,
    adultGrowthComplete,
    children,
  });

  const overall = getFamilyOverallProgress({
    childCount,
    adultBaselineComplete,
    adultGrowthComplete,
    childBaselinesComplete,
    studentModules,
    adultModules,
  });

  const categoryRows = getCategoryProgressRows({
    programCode,
    studentModules,
    adultModules,
    childCount,
    childBaselinesComplete,
    adultBaselineComplete,
    adultGrowthComplete,
    overall,
  });

  const skillAreas = groupProgressBySkillArea({
    programCode,
    studentAssessments: partitionChildAssessments(assessments),
    adultAssessments: partitionAdultAssessments(assessments),
    studentModules,
    adultModules,
    legacyBaselines: baselines,
  });

  const adultEvents: string[] = [];
  if (adultBaselineComplete) adultEvents.push('Parent completed Adult Baseline');
  if (adultGrowthComplete) adultEvents.push('Parent completed Growth Check');

  const focusSkills: FamilyFocusSkill[] = skillAreas.map((row) => ({
    label: row.label,
    value: row.sampleCount > 0 ? row.value : 0,
  }));

  const overallPct = overall.percent;
  const emptyStateMessage = resolveEmptyStateMessage({
    adultBaselineComplete,
    adultGrowthComplete,
    hasChildActivity,
  });

  if (!hasActivity) {
    return {
      rows: categoryRows,
      focusSkills,
      recentActivity: [],
      hasActivity: false,
      hasChildActivity: false,
      overallLabel: 'Getting Started',
      overall,
      assessments: assessmentsProgress,
      emptyStateMessage: null,
    };
  }

  return {
    rows: categoryRows,
    focusSkills,
    recentActivity: buildRecentActivity(studentModules, baselines, assessments, adultEvents),
    hasActivity: true,
    hasChildActivity,
    overallLabel:
      overallPct >= 75 ? 'Strong Progress' : overallPct >= 25 ? 'Building Momentum' : 'Getting Started',
    overall,
    assessments: assessmentsProgress,
    emptyStateMessage,
  };
}

export function computeFamilyBaselineAverage(input: {
  v2Assessments: LocalAssessmentV2Record[];
  legacyBaselines: B4BaselineCheckRecord[];
  allowedStudentIds: string[];
}): number | null {
  const allowed = new Set(input.allowedStudentIds.filter(Boolean));
  const scores: number[] = [];

  for (const row of input.v2Assessments) {
    if (row.role !== 'student') continue;
    if (!isChildBaselineAssessmentType(row.assessment_type)) continue;
    const participantId = row.participant_id?.trim() ?? '';
    if (allowed.size && participantId && !allowed.has(participantId)) continue;
    if (row.percent_score != null && Number.isFinite(row.percent_score)) {
      scores.push(Number(row.percent_score));
    } else if (row.max_score != null && row.max_score > 0 && row.total_score != null) {
      scores.push((row.total_score / row.max_score) * 100);
    }
  }

  for (const row of input.legacyBaselines) {
    const participantId = row.participantId?.trim() ?? '';
    if (allowed.size && participantId && !allowed.has(participantId)) continue;
    if (!row.completedAt) continue;
    const moduleScores = [row.feelingsScore, row.readingScore, row.focusMovesScore].filter(
      (value) => Number.isFinite(value),
    );
    if (moduleScores.length) {
      scores.push(
        moduleScores.reduce((sum, value) => sum + value, 0) / moduleScores.length,
      );
    }
  }

  if (!scores.length) return null;
  return Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
}

export function countFamilyCertificatesEarned(input: {
  moduleResults: LocalModuleResultRecord[];
  allowedStudentIds: string[];
}): number {
  const allowed = new Set(input.allowedStudentIds.filter(Boolean));
  const earned = new Set<string>();

  for (const row of input.moduleResults) {
    if (row.role !== 'student') continue;
    const participantId = row.participant_id?.trim() ?? '';
    if (allowed.size && participantId && !allowed.has(participantId)) continue;
    const pct =
      row.percent_score ??
      (row.max_score != null && row.max_score > 0
        ? Math.round((row.score / row.max_score) * 100)
        : 0);
    if (pct >= 70 && row.module_id) {
      earned.add(`${participantId}:${row.module_id}`);
    }
  }

  return earned.size;
}

function modulePercent(row: LocalModuleResultRecord): number {
  if (row.percent_score != null && Number.isFinite(row.percent_score)) {
    return Number(row.percent_score);
  }
  if (row.max_score != null && row.max_score > 0) {
    return Math.round((row.score / row.max_score) * 100);
  }
  return 0;
}

export function computeChildBaselinePct(input: {
  participantId: string | null;
  v2Assessments: LocalAssessmentV2Record[];
  legacyBaselines: B4BaselineCheckRecord[];
}): number | null {
  if (!input.participantId?.trim()) return null;
  return computeFamilyBaselineAverage({
    v2Assessments: input.v2Assessments,
    legacyBaselines: input.legacyBaselines,
    allowedStudentIds: [input.participantId.trim()],
  });
}

function matchesAllowedStudent(
  participantId: string | null | undefined,
  allowedStudentIds?: string[],
): boolean {
  if (!allowedStudentIds?.length) return true;
  const id = participantId?.trim();
  return Boolean(id && allowedStudentIds.includes(id));
}

export function computeChildProgressRows(input: {
  participantId: string | null;
  baselineStatus: FamilyChildBaselineStatus;
  programCode?: string;
  moduleResults: LocalModuleResultRecord[];
}): FamilyProgressRow[] {
  const studentModules = input.moduleResults.filter(
    (row) =>
      row.role === 'student' &&
      input.participantId &&
      row.participant_id === input.participantId,
  );
  const baselineComplete = input.baselineStatus === 'Complete';

  const rows = getCategoryProgressRows({
    programCode: input.programCode,
    studentModules,
    adultModules: [],
    childCount: 1,
    childBaselinesComplete: baselineComplete ? 1 : 0,
    adultBaselineComplete: false,
    adultGrowthComplete: false,
    overall: getFamilyOverallProgress({
      childCount: 1,
      adultBaselineComplete: false,
      adultGrowthComplete: false,
      childBaselinesComplete: baselineComplete ? 1 : 0,
      studentModules,
      adultModules: [],
    }),
  });

  return rows.map((row) => ({
    key: row.key,
    label: row.label,
    pct: row.pct,
    tone: row.tone,
    completed: row.completed,
    total: row.total,
    labelDetail: row.labelDetail,
  }));
}

export function buildFamilyRecentActivityTimeline(input: {
  moduleResults?: LocalModuleResultRecord[];
  v2Assessments?: LocalAssessmentV2Record[];
  legacyBaselines?: B4BaselineCheckRecord[];
  allowedStudentIds?: string[];
  familyLinks?: StudentFamilyLink[];
  childNames?: Record<string, string>;
  adultBaselineComplete?: boolean;
  adultGrowthComplete?: boolean;
  goalsCompletedAt?: string | null;
  goalsCount?: number;
  gallerySubmissions?: { id: string; created_at?: string; title?: string }[];
  limit?: number;
}): FamilyRecentActivityItem[] {
  const limit = input.limit ?? 5;
  const items: FamilyRecentActivityItem[] = [];
  const allowed = input.allowedStudentIds?.filter(Boolean);
  const childNames = input.childNames ?? {};

  for (const row of input.moduleResults ?? []) {
    if (row.role !== 'student') continue;
    if (!matchesAllowedStudent(row.participant_id, allowed)) continue;
    const pct = modulePercent(row);
    const timestamp = row.completed_at;
    if (pct >= 70) {
      items.push({
        id: `cert-${row.id ?? `${row.participant_id}-${row.module_id}`}`,
        label: `Certificate earned — ${row.module_title}`,
        kind: 'certificate',
        timestamp,
      });
    } else {
      items.push({
        id: `mod-${row.id ?? `${row.participant_id}-${row.module_id}-${row.completed_at}`}`,
        label: `${row.module_title} completed`,
        kind: 'module',
        timestamp,
      });
    }
  }

  for (const row of input.v2Assessments ?? []) {
    if (row.role !== 'student' || !isChildBaselineAssessmentType(row.assessment_type)) continue;
    if (!matchesAllowedStudent(row.participant_id, allowed)) continue;
    const answers = row.answers_json as { nickname?: string; firstName?: string } | undefined;
    const name = answers?.nickname?.trim() || answers?.firstName?.trim();
    items.push({
      id: `v2-baseline-${row.id ?? row.completed_at}`,
      label: name
        ? `${name} completed ${CHILD_BEFORE_CHECK_IN_LABEL}`
        : `${CHILD_BEFORE_CHECK_IN_LABEL} completed`,
      kind: 'baseline',
      timestamp: row.completed_at,
    });
  }

  for (const row of input.legacyBaselines ?? []) {
    if (!row.completedAt) continue;
    if (!matchesAllowedStudent(row.participantId, allowed)) continue;
    items.push({
      id: `legacy-baseline-${row.participantId ?? row.nickname}-${row.completedAt}`,
      label: row.nickname
        ? `${row.nickname} completed ${CHILD_BEFORE_CHECK_IN_LABEL}`
        : `${CHILD_BEFORE_CHECK_IN_LABEL} completed`,
      kind: 'baseline',
      timestamp: row.completedAt,
    });
  }

  for (const link of input.familyLinks ?? []) {
    if (!link.parent_claimed) continue;
    if (allowed?.length && !allowed.includes(link.student_id)) continue;
    const childName = childNames[link.student_id] ?? 'Child';
    const timestamp = link.claimed_at ?? link.created_at;
    items.push({
      id: `linked-${link.id}`,
      label: `${childName} linked to your family`,
      kind: 'linked',
      timestamp,
    });
  }

  for (const submission of input.gallerySubmissions ?? []) {
    items.push({
      id: `gallery-${submission.id}`,
      label: submission.title?.trim()
        ? `Gallery submission uploaded — ${submission.title.trim()}`
        : 'Gallery submission uploaded',
      kind: 'gallery',
      timestamp: submission.created_at,
    });
  }

  if (input.goalsCompletedAt && (input.goalsCount ?? 0) > 0) {
    items.push({
      id: 'goals-saved',
      label: `Family goals saved (${input.goalsCount} selected)`,
      kind: 'goals',
      timestamp: input.goalsCompletedAt,
    });
  }

  return items
    .sort((a, b) => {
      const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, limit);
}
