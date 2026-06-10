import type { PilotRosterRow } from '../hooks/usePilotRosterData';
import type { PilotActivityItem } from './pilotDashboardMetrics';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from './pilotTrackingLocalStorage';
import {
  isInactiveBeyondDays,
  PILOT_CERTIFICATE_MIN_MODULES,
  PILOT_INACTIVE_DAYS,
} from './pilotStudentProgress';
import type { StudentGalleryItem } from './studentGalleryService';
import type { StudentParticipantRecord } from './pilotTrackingService';

export type RosterFilterId = 'missing-baseline' | 'inactive' | 'no-modules' | 'certificate-ready';

export const ROSTER_FILTER_IDS: RosterFilterId[] = [
  'missing-baseline',
  'inactive',
  'no-modules',
  'certificate-ready',
];

export const ROSTER_FILTER_LABELS: Record<RosterFilterId, string> = {
  'missing-baseline': 'Missing Baseline',
  inactive: 'Inactive 7+ Days',
  'no-modules': 'No Modules Completed',
  'certificate-ready': 'Certificate Ready',
};

export function isRosterFilterId(value: string | null): value is RosterFilterId {
  return value !== null && ROSTER_FILTER_IDS.includes(value as RosterFilterId);
}

export function filterRosterRows(rows: PilotRosterRow[], filter: RosterFilterId | null): PilotRosterRow[] {
  if (!filter) return rows;

  switch (filter) {
    case 'missing-baseline':
      return rows.filter((row) => row.baselineStatus !== 'Complete');
    case 'inactive':
      return rows.filter((row) => isInactiveBeyondDays(row.lastActivityAt, PILOT_INACTIVE_DAYS));
    case 'no-modules':
      return rows.filter((row) => row.moduleCompletions === 0);
    case 'certificate-ready':
      return rows.filter(
        (row) =>
          row.baselineStatus === 'Complete' && row.moduleCompletions >= PILOT_CERTIFICATE_MIN_MODULES,
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
