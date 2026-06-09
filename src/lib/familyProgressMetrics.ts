import type { B4BaselineCheckRecord } from './b4BaselineCheckStorage';
import type { FamilyChildSummary } from './familyChildrenMetrics';
import {
  getAssessmentProgress,
  getCategoryProgressRows,
  getFamilyOverallProgress,
  groupProgressBySkillArea,
  partitionAdultAssessments,
  partitionChildAssessments,
  type ProgressCounts,
} from './familyProgressHelpers';
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
      const label =
        assessmentType === 'baseline'
          ? 'B-4 Check-In'
          : assessmentType === 'final'
            ? 'Growth Check'
            : assessmentType === 'adult_pre'
              ? 'Adult Baseline'
              : assessmentType === 'adult_post'
                ? 'Adult Growth Check'
                : assessmentType.replace(/_/g, ' ');
      return name ? `${name} completed ${label}` : `${label} completed`;
    });

  const coveredNames = new Set(
    assessments
      .filter((row) => row.role === 'student' && row.assessment_type === 'baseline')
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
      row.nickname ? `${row.nickname} completed B-4 Check-In` : 'B-4 Check-In completed',
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
