import type { PilotRosterRow } from '../hooks/usePilotRosterData';
import type { PilotActivityItem } from './pilotDashboardMetrics';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from './pilotTrackingLocalStorage';
import {
  isInactiveBeyondDays,
  PILOT_CERTIFICATE_MIN_MODULES,
  PILOT_INACTIVE_DAYS,
  resolveParticipantLastActivity,
} from './pilotStudentProgress';
import type { StudentGalleryItem } from './studentGalleryService';
import type { StudentParticipantRecord } from './pilotTrackingService';
import { BASELINE_WEEK, GROWTH_START_WEEK } from '../config/pilotBaselineWeeks';
import { isChildBaselineAssessmentType } from '../config/assessmentTypeConstants';
import { selectCanonicalModuleResultsForWeek } from './canonicalAttemptRules';

export type RosterFilterId =
  | 'missing-baseline'
  | 'inactive'
  | 'no-modules'
  | 'certificate-ready'
  | 'parent-not-connected'
  | 'missing-pin'
  | 'missing-week-1'
  | 'missing-week-2'
  | 'requires-follow-up';

export const ROSTER_FILTER_IDS: RosterFilterId[] = [
  'missing-baseline',
  'missing-pin',
  'parent-not-connected',
  'missing-week-1',
  'missing-week-2',
  'inactive',
  'no-modules',
  'certificate-ready',
  'requires-follow-up',
];

export const ROSTER_FILTER_LABELS: Record<RosterFilterId, string> = {
  'missing-baseline': 'Missing Baseline',
  'missing-pin': 'Missing PIN',
  'parent-not-connected': 'Parent Not Connected',
  'missing-week-1': 'Missing Week 1',
  'missing-week-2': 'Missing Week 2',
  inactive: 'Inactive 7+ Days',
  'no-modules': 'No Modules Completed',
  'certificate-ready': 'Certificate Ready',
  'requires-follow-up': 'Requires Follow-up',
};

export function isRosterFilterId(value: string | null): value is RosterFilterId {
  return value !== null && ROSTER_FILTER_IDS.includes(value as RosterFilterId);
}

function hasBaselineComplete(participantId: string, assessments: LocalAssessmentV2Record[]): boolean {
  return assessments.some(
    (row) =>
      row.participant_id === participantId &&
      isChildBaselineAssessmentType(row.assessment_type) &&
      Boolean(row.completed_at),
  );
}

function hasWeekComplete(
  participantId: string,
  modules: LocalModuleResultRecord[],
  weekNumber: number,
): boolean {
  const studentModules = modules.filter(
    (row) => row.participant_id === participantId && row.role === 'student',
  );
  return selectCanonicalModuleResultsForWeek(studentModules, weekNumber).length > 0;
}

export function participantRequiresFollowUp(
  participantId: string,
  context: {
    assessments: LocalAssessmentV2Record[];
    modules: LocalModuleResultRecord[];
    lastActivityAt?: string | null;
    participantCreatedAt?: string | null;
  },
): boolean {
  const baselineComplete = hasBaselineComplete(participantId, context.assessments);
  const week1Complete = hasWeekComplete(participantId, context.modules, BASELINE_WEEK);
  const week2Complete = hasWeekComplete(participantId, context.modules, GROWTH_START_WEEK);
  const lastActivity =
    context.lastActivityAt ??
    resolveParticipantLastActivity(participantId, {
      assessments: context.assessments,
      modules: context.modules,
      participantCreatedAt: context.participantCreatedAt,
    });
  const inactive = isInactiveBeyondDays(lastActivity, PILOT_INACTIVE_DAYS);
  const moduleCount = context.modules.filter((row) => row.participant_id === participantId).length;
  const certificateReady =
    baselineComplete && moduleCount >= PILOT_CERTIFICATE_MIN_MODULES;

  if (!baselineComplete) return true;
  if (!week1Complete) return true;
  if (baselineComplete && !week2Complete) return true;
  if (inactive) return true;
  if (!certificateReady && baselineComplete && week1Complete && !week2Complete) return true;
  return false;
}

export function filterRosterRows(
  rows: PilotRosterRow[],
  filter: RosterFilterId | null,
  context?: {
    assessments?: LocalAssessmentV2Record[];
    modules?: LocalModuleResultRecord[];
  },
): PilotRosterRow[] {
  if (!filter) return rows;

  switch (filter) {
    case 'missing-baseline':
      return rows.filter((row) => row.baselineStatus !== 'Complete');
    case 'missing-pin':
      return rows.filter((row) => !row.hasPin);
    case 'parent-not-connected':
      return rows.filter((row) => row.parentConnectionStatus === 'unclaimed');
    case 'missing-week-1':
      return rows.filter((row) => {
        if (!context?.modules) return false;
        return !hasWeekComplete(row.participantId, context.modules, BASELINE_WEEK);
      });
    case 'missing-week-2':
      return rows.filter((row) => {
        if (!context?.modules || !context.assessments) return false;
        if (!hasBaselineComplete(row.participantId, context.assessments)) return false;
        return !hasWeekComplete(row.participantId, context.modules, GROWTH_START_WEEK);
      });
    case 'inactive':
      return rows.filter((row) => isInactiveBeyondDays(row.lastActivityAt, PILOT_INACTIVE_DAYS));
    case 'no-modules':
      return rows.filter((row) => row.moduleCompletions === 0);
    case 'certificate-ready':
      return rows.filter(
        (row) =>
          row.baselineStatus === 'Complete' && row.moduleCompletions >= PILOT_CERTIFICATE_MIN_MODULES,
      );
    case 'requires-follow-up':
      return rows.filter((row) =>
        participantRequiresFollowUp(row.participantId, {
          assessments: context?.assessments ?? [],
          modules: context?.modules ?? [],
          lastActivityAt: row.lastActivityAt,
        }),
      );
    default:
      return rows;
  }
}

function resolveParticipantName(
  participantId: string,
  lookup: Map<string, { nickname: string | null; first_name: string | null }>,
): string {
  const row = lookup.get(participantId);
  return row?.nickname?.trim() || row?.first_name?.trim() || 'Student';
}

function formatAssessmentLabel(assessmentType: string): string {
  switch (assessmentType) {
    case 'baseline':
      return 'B-4 Baseline Check';
    case 'final':
      return 'B-4 Final Check';
    case 'adult_pre':
      return 'Adult Pre-Assessment';
    case 'adult_post':
      return 'Adult Post-Assessment';
    default:
      return assessmentType.replace(/_/g, ' ');
  }
}

export function buildRecentStudentActivityFeed(input: {
  assessments: LocalAssessmentV2Record[];
  modules: LocalModuleResultRecord[];
  participants: StudentParticipantRecord[];
  galleryItems?: StudentGalleryItem[];
  participantLookup: Map<string, { nickname: string | null; first_name: string | null }>;
  limit?: number;
}): PilotActivityItem[] {
  const items: PilotActivityItem[] = [];
  const limit = input.limit ?? 5;

  for (const row of input.assessments) {
    if (!row.completed_at || !row.participant_id) continue;
    const name = resolveParticipantName(row.participant_id, input.participantLookup);
    items.push({
      id: `assessment-${row.id}`,
      type: 'assessment',
      label: `${name} completed ${formatAssessmentLabel(row.assessment_type)}`,
      detail: row.program_code || 'Assessment',
      at: row.completed_at,
    });
  }

  for (const row of input.modules) {
    if (!row.completed_at || !row.participant_id) continue;
    const name = resolveParticipantName(row.participant_id, input.participantLookup);
    const moduleName = row.module_title?.trim() || row.module_id?.trim() || 'a module';
    items.push({
      id: `module-${row.id}`,
      type: 'submission',
      label: `${name} completed ${moduleName}`,
      detail: row.character || row.program_code || 'Module',
      at: row.completed_at,
    });
  }

  for (const participant of input.participants) {
    if (!participant.created_at) continue;
    const name = participant.first_name?.trim() || participant.nickname?.trim() || 'Student';
    items.push({
      id: `roster-${participant.id}`,
      type: 'submission',
      label: `${name} was added to the roster`,
      detail: 'Roster',
      at: participant.created_at,
    });
  }

  for (const item of input.galleryItems ?? []) {
    if (item.status !== 'approved' || !item.reviewed_at) continue;
    const name = item.student_nickname?.trim() || 'Student';
    items.push({
      id: `gallery-${item.id}`,
      type: 'download',
      label: `${name}'s artwork was approved`,
      detail: item.title?.trim() || 'Student Gallery',
      at: item.reviewed_at,
    });
  }

  return items
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, limit);
}

export function computeProgramHealthPct(input: {
  studentsEnrolled: number;
  baselineChecksCompleted: number;
  moduleCompletions: number;
}): number {
  const { studentsEnrolled, baselineChecksCompleted, moduleCompletions } = input;
  if (studentsEnrolled <= 0) return 0;

  const baselinePct = (baselineChecksCompleted / studentsEnrolled) * 100;
  const modulePct = Math.min(100, (moduleCompletions / studentsEnrolled) * 50);
  return Math.round(baselinePct * 0.65 + modulePct * 0.35);
}

export type B4Recommendation = {
  message: string;
  cta: string;
};

export function buildB4Recommendation(input: {
  missingBaseline: number;
  noModules: number;
}): B4Recommendation {
  if (input.missingBaseline > 0) {
    return {
      message: 'Start by helping students complete the B-4 Baseline Check.',
      cta: 'Ask B-4',
    };
  }
  if (input.noModules > 0) {
    return {
      message: 'Try a short Week 1 activity to build momentum.',
      cta: 'Ask B-4',
    };
  }
  return {
    message: 'Review student progress and celebrate completed modules.',
    cta: 'Ask B-4',
  };
}

export function countRosterRowsByFilter(
  rows: PilotRosterRow[],
  context?: {
    assessments?: LocalAssessmentV2Record[];
    modules?: LocalModuleResultRecord[];
  },
): Record<RosterFilterId, number> {
  return ROSTER_FILTER_IDS.reduce(
    (acc, filterId) => {
      acc[filterId] = filterRosterRows(rows, filterId, context).length;
      return acc;
    },
    {} as Record<RosterFilterId, number>,
  );
}
