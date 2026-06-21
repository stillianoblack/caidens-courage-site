import { isChildBaselineAssessmentType } from '../config/assessmentTypeConstants';
import { BASELINE_WEEK, GROWTH_START_WEEK } from '../config/pilotBaselineWeeks';
import {
  inferModuleWeekNumber,
  selectCanonicalModuleResultsForWeek,
} from './canonicalAttemptRules';
import {
  computeNeedsAttention,
  isInactiveBeyondDays,
  PILOT_CERTIFICATE_MIN_MODULES,
  PILOT_INACTIVE_DAYS,
  resolveParticipantLastActivity,
} from './pilotStudentProgress';
import { certificatesReadyFilterPath, rosterFilterPath } from './askB4DeepLinks';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from './pilotTrackingLocalStorage';
import type { StudentParticipantRecord } from './pilotTrackingService';

export type CampReadinessStatus = 'complete' | 'warning' | 'critical' | 'info';

export type CampReadinessItem = {
  id: string;
  label: string;
  count: number;
  status: CampReadinessStatus;
  href?: string;
  onClick?: () => void;
};

export type CampReadinessSummary = {
  studentCount: number;
  requiresFollowUp: number;
  items: CampReadinessItem[];
};

function isStudentParticipant(participant: StudentParticipantRecord): boolean {
  const role = participant.role?.trim().toLowerCase() ?? 'student';
  return role === 'student';
}

function hasBaselineComplete(
  participantId: string,
  assessments: LocalAssessmentV2Record[],
): boolean {
  return assessments.some(
    (row) =>
      row.participant_id === participantId &&
      isChildBaselineAssessmentType(row.assessment_type) &&
      Boolean(row.completed_at),
  );
}

function hasCanonicalWeekComplete(
  participantId: string,
  modules: LocalModuleResultRecord[],
  weekNumber: number,
): boolean {
  const studentModules = modules.filter(
    (row) => row.participant_id === participantId && row.role === 'student',
  );
  return selectCanonicalModuleResultsForWeek(studentModules, weekNumber).length > 0;
}

export function getCampReadiness(input: {
  participants: StudentParticipantRecord[];
  assessments: LocalAssessmentV2Record[];
  modules: LocalModuleResultRecord[];
  rosterPath: string;
  resultsPath: string;
  weeklyModulesPath: string;
  certificatesPath: string;
  onCopyFamilyCode?: () => void;
}): CampReadinessSummary {
  const students = input.participants.filter(isStudentParticipant);
  const needsAttention = computeNeedsAttention({
    participants: students,
    assessments: input.assessments,
    modules: input.modules,
  });

  let missingWeek1 = 0;
  let missingWeek2 = 0;
  const followUpIds = new Set<string>();

  for (const student of students) {
    const baselineComplete = hasBaselineComplete(student.id, input.assessments);
    const week1Complete = hasCanonicalWeekComplete(student.id, input.modules, BASELINE_WEEK);
    const week2Complete = hasCanonicalWeekComplete(student.id, input.modules, GROWTH_START_WEEK);
    const lastActivity = resolveParticipantLastActivity(student.id, {
      assessments: input.assessments,
      modules: input.modules,
      participantCreatedAt: student.created_at,
    });
    const inactive = isInactiveBeyondDays(lastActivity, PILOT_INACTIVE_DAYS);
    const moduleCount = input.modules.filter((row) => row.participant_id === student.id).length;
    const certificateReady =
      baselineComplete && moduleCount >= PILOT_CERTIFICATE_MIN_MODULES;

    if (!baselineComplete) followUpIds.add(student.id);
    if (!week1Complete) {
      missingWeek1 += 1;
      followUpIds.add(student.id);
    }
    if (baselineComplete && !week2Complete) {
      missingWeek2 += 1;
      followUpIds.add(student.id);
    }
    if (inactive) followUpIds.add(student.id);
    if (!certificateReady && baselineComplete && week1Complete && !week2Complete) {
      followUpIds.add(student.id);
    }
  }

  const items: CampReadinessItem[] = [
    {
      id: 'missing-baseline',
      label: 'Missing Baseline',
      count: needsAttention.missingBaseline,
      status: needsAttention.missingBaseline > 0 ? 'critical' : 'complete',
      href: rosterFilterPath('missing-baseline'),
    },
    {
      id: 'missing-week-1',
      label: 'Missing Week 1',
      count: missingWeek1,
      status: missingWeek1 > 0 ? 'warning' : 'complete',
      href: rosterFilterPath('missing-week-1'),
    },
    {
      id: 'missing-week-2',
      label: 'Missing Week 2',
      count: missingWeek2,
      status: missingWeek2 > 0 ? 'warning' : 'complete',
      href: rosterFilterPath('missing-week-2'),
    },
    {
      id: 'certificates-ready',
      label: 'Certificates Ready',
      count: needsAttention.certificateReady,
      status: needsAttention.certificateReady > 0 ? 'info' : 'complete',
      href: certificatesReadyFilterPath(),
    },
    {
      id: 'inactive-7-plus',
      label: 'Inactive 7+ Days',
      count: needsAttention.inactive7PlusDays,
      status: needsAttention.inactive7PlusDays > 0 ? 'warning' : 'complete',
      href: rosterFilterPath('inactive'),
    },
    {
      id: 'requires-follow-up',
      label: 'Requires Follow-up',
      count: followUpIds.size,
      status: followUpIds.size > 0 ? 'critical' : 'complete',
      href: rosterFilterPath('requires-follow-up'),
    },
  ];

  return {
    studentCount: students.length,
    requiresFollowUp: followUpIds.size,
    items,
  };
}

/** Exported for tests and audits — infer week from a module row. */
export { inferModuleWeekNumber };
