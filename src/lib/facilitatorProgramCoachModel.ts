import { isChildBaselineAssessmentType } from '../config/assessmentTypeConstants';
import { PROGRAM_DASHBOARD_PATH } from '../config/courageRoutes';
import { getCampReadiness, type CampReadinessSummary } from './campReadiness';
import type { PilotTrackingMetrics } from './pilotTrackingMetrics';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from './pilotTrackingLocalStorage';
import { computeNeedsAttention, type PilotNeedsAttentionCounts } from './pilotStudentProgress';
import type { StudentParticipantRecord } from './pilotTrackingService';
import type { ProgramGoalsRecord } from './programGoalsService';
import type { ActivePilotProgram } from '../types/pilotProgram';

export type FacilitatorCoachCheckStatus = 'complete' | 'incomplete' | 'warning';

export type FacilitatorCoachChecklistItemModel = {
  id: string;
  label: string;
  description: string;
  status: FacilitatorCoachCheckStatus;
  warningText?: string;
  href?: string;
  onClick?: () => void;
};

export type FacilitatorCoachInsightModel = {
  id: string;
  title: string;
  message: string;
  tone: 'warning' | 'success' | 'info';
  href?: string;
};

export type FacilitatorCoachQuickAction = {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
};

export type FacilitatorProgramCoachModel = {
  progressPercent: number;
  progressChecksComplete: number;
  progressChecksTotal: number;
  checklist: FacilitatorCoachChecklistItemModel[];
  campReadiness: CampReadinessSummary;
  insights: FacilitatorCoachInsightModel[];
  showSuccessState: boolean;
  quickActions: FacilitatorCoachQuickAction[];
  counts: {
    studentCount: number;
    missingGradeCount: number;
    missingBaselineCount: number;
    missingWeek1Count: number;
    missingWeek2Count: number;
    inactive7PlusDays: number;
    certificateReady: number;
    requiresFollowUp: number;
  };
};

function isStudentParticipant(participant: StudentParticipantRecord): boolean {
  const role = participant.role?.trim().toLowerCase() ?? 'student';
  return role === 'student';
}

function hasGradeAssigned(participant: StudentParticipantRecord): boolean {
  return Boolean(participant.grade_level?.trim() || participant.grade_band?.trim());
}

function hasProgramBaseline(assessments: LocalAssessmentV2Record[]): boolean {
  return assessments.some(
    (row) =>
      isChildBaselineAssessmentType(row.assessment_type) && Boolean(row.completed_at?.trim()),
  );
}

function hasFamilyGoalsStarted(
  programGoals: ProgramGoalsRecord | null | undefined,
  familyLinksCount: number,
): boolean {
  if (familyLinksCount > 0) return true;
  if (!programGoals) return false;
  if (programGoals.completed_at?.trim()) return true;
  return (programGoals.selected_goals?.length ?? 0) > 0;
}

export function buildFacilitatorProgramCoachModel(input: {
  participants: StudentParticipantRecord[];
  assessments: LocalAssessmentV2Record[];
  modules: LocalModuleResultRecord[];
  metrics: PilotTrackingMetrics;
  activeProgram?: ActivePilotProgram | null;
  programGoals?: ProgramGoalsRecord | null;
  familyLinksCount?: number;
  onOpenAccessCodes?: () => void;
  onCopyFamilyCode?: () => void;
}): FacilitatorProgramCoachModel {
  const students = input.participants.filter(isStudentParticipant);
  const studentCount = students.length;
  const missingGradeCount = students.filter((row) => !hasGradeAssigned(row)).length;
  const needsAttention: PilotNeedsAttentionCounts = computeNeedsAttention({
    participants: students,
    assessments: input.assessments,
    modules: input.modules,
  });

  const studentsAdded = studentCount > 0;
  const gradesAssigned = studentCount > 0 && missingGradeCount === 0;
  const familyGoalsStarted = hasFamilyGoalsStarted(
    input.programGoals,
    input.familyLinksCount ?? 0,
  );
  const baselineStarted = hasProgramBaseline(input.assessments);
  const weeklyPathStarted = input.modules.length > 0;
  const familyCodeReady = Boolean(input.activeProgram?.familyAccessCode?.trim());

  const progressChecks = [
    studentsAdded,
    gradesAssigned,
    familyGoalsStarted,
    baselineStarted,
    weeklyPathStarted,
  ];
  const progressChecksComplete = progressChecks.filter(Boolean).length;
  const progressPercent = Math.round(
    (progressChecksComplete / progressChecks.length) * 100,
  );

  const rosterPath = `${PROGRAM_DASHBOARD_PATH}/roster`;
  const resultsPath = `${PROGRAM_DASHBOARD_PATH}/results`;
  const weeklyModulesPath = `${PROGRAM_DASHBOARD_PATH}/weekly-modules`;
  const certificatesPath = `${PROGRAM_DASHBOARD_PATH}/certificates`;

  const campReadiness = getCampReadiness({
    participants: input.participants,
    assessments: input.assessments,
    modules: input.modules,
    rosterPath,
    resultsPath,
    weeklyModulesPath,
    certificatesPath,
    onCopyFamilyCode: input.onCopyFamilyCode,
  });

  const checklist: FacilitatorCoachChecklistItemModel[] = [
    {
      id: 'add-students',
      label: 'Add Students',
      description: 'Create or confirm student profiles.',
      status: studentsAdded ? 'complete' : 'incomplete',
      href: rosterPath,
    },
    {
      id: 'configure-grades',
      label: 'Configure Grade Levels',
      description: 'Select grades so activities adapt correctly.',
      status:
        studentCount === 0
          ? 'incomplete'
          : missingGradeCount > 0
            ? 'warning'
            : 'complete',
      warningText:
        missingGradeCount > 0 ? `${missingGradeCount} students need grades` : undefined,
      href: rosterPath,
    },
    {
      id: 'share-family-codes',
      label: 'Share Family Codes',
      description: 'Invite parents to connect at home.',
      status: familyCodeReady ? 'complete' : 'incomplete',
      onClick: input.onOpenAccessCodes,
      href: input.onOpenAccessCodes ? undefined : rosterPath,
    },
    {
      id: 'complete-baseline',
      label: 'Complete B-4 Baseline',
      description: 'Establish student starting points.',
      status:
        baselineStarted && needsAttention.missingBaseline === 0
          ? 'complete'
          : baselineStarted
            ? 'warning'
            : 'incomplete',
      warningText:
        needsAttention.missingBaseline > 0
          ? `${needsAttention.missingBaseline} students missing baseline`
          : undefined,
      href: resultsPath,
    },
    {
      id: 'start-weekly-path',
      label: 'Start Weekly Path',
      description: 'Open Week 1 adventures and activities.',
      status: weeklyPathStarted ? 'complete' : 'incomplete',
      href: weeklyModulesPath,
    },
  ];

  const insights: FacilitatorCoachInsightModel[] = [];

  if (missingGradeCount > 0) {
    insights.push({
      id: 'missing-grades',
      title: 'Missing grade levels',
      message: `${missingGradeCount} students need grade levels before adaptive missions personalize.`,
      tone: 'warning',
      href: rosterPath,
    });
  }

  if (needsAttention.missingBaseline > 0) {
    insights.push({
      id: 'missing-baseline',
      title: 'Missing baseline',
      message: `${needsAttention.missingBaseline} students still need the B-4 Baseline Check.`,
      tone: 'warning',
      href: resultsPath,
    });
  }

  if (needsAttention.inactive7PlusDays > 0) {
    insights.push({
      id: 'inactive-students',
      title: 'Inactive 7+ days',
      message: `${needsAttention.inactive7PlusDays} students have no activity in 7+ days.`,
      tone: 'warning',
      href: rosterPath,
    });
  }

  if (needsAttention.certificateReady > 0) {
    insights.push({
      id: 'certificates-ready',
      title: 'Certificates ready',
      message: `${needsAttention.certificateReady} certificates are ready to review.`,
      tone: 'info',
      href: certificatesPath,
    });
  }

  const showSuccessState = insights.length === 0;

  const quickActions: FacilitatorCoachQuickAction[] = [
    { id: 'roster', label: 'Open Roster', href: rosterPath },
    ...(input.activeProgram?.familyAccessCode?.trim() && input.onCopyFamilyCode
      ? [{ id: 'copy-family-code', label: 'Copy Family Code', onClick: input.onCopyFamilyCode }]
      : []),
    { id: 'week-1-modules', label: 'Open Week 1 Modules', href: weeklyModulesPath },
    { id: 'week-2-modules', label: 'Open Week 2 Modules', href: weeklyModulesPath },
    { id: 'results', label: 'View Student Results', href: resultsPath },
  ];

  return {
    progressPercent,
    progressChecksComplete,
    progressChecksTotal: progressChecks.length,
    checklist,
    campReadiness,
    insights: insights.slice(0, 4),
    showSuccessState,
    quickActions,
    counts: {
      studentCount,
      missingGradeCount,
      missingBaselineCount: needsAttention.missingBaseline,
      missingWeek1Count:
        campReadiness.items.find((item) => item.id === 'missing-week-1')?.count ?? 0,
      missingWeek2Count:
        campReadiness.items.find((item) => item.id === 'missing-week-2')?.count ?? 0,
      inactive7PlusDays: needsAttention.inactive7PlusDays,
      certificateReady: needsAttention.certificateReady,
      requiresFollowUp: campReadiness.requiresFollowUp,
    },
  };
}
