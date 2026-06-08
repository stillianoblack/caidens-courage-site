import type { B4BaselineCheckRecord } from './b4BaselineCheckStorage';
import { listTrackedStudentModules } from '../data/moduleTrackingRegistry';
import type { StudentParticipantRecord } from './pilotTrackingService';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from './pilotTrackingLocalStorage';

export type FamilyChildBaselineStatus = 'Complete' | 'In Progress' | 'Not Started';

export type FamilyChildSummary = {
  key: string;
  participantId: string | null;
  displayName: string;
  baselineStatus: FamilyChildBaselineStatus;
  latestActivity: string | null;
  progressPct: number;
  createdAt: string | null;
};

const TRACKED_MODULE_COUNT = Math.max(listTrackedStudentModules().length, 1);

function normalizeCode(programCode?: string): string {
  return programCode?.trim().toUpperCase() ?? '';
}

function childDisplayName(participant: Pick<StudentParticipantRecord, 'nickname' | 'first_name'>): string {
  return participant.nickname?.trim() || participant.first_name?.trim() || 'Child';
}

function resolveBaselineStatus(input: {
  participantId: string | null;
  displayName: string;
  legacyBaselines: B4BaselineCheckRecord[];
  assessments: LocalAssessmentV2Record[];
}): FamilyChildBaselineStatus {
  const nameKey = input.displayName.trim().toLowerCase();

  const v2Rows = input.assessments.filter((row) => {
    if (row.role !== 'student') return false;
    if (input.participantId && row.participant_id === input.participantId) return true;
    const answers = row.answers_json as { nickname?: string } | undefined;
    return answers?.nickname?.trim().toLowerCase() === nameKey;
  });

  if (v2Rows.some((row) => row.assessment_type === 'baseline')) {
    return 'Complete';
  }

  if (v2Rows.length > 0) return 'In Progress';

  const legacyComplete = input.legacyBaselines.some(
    (row) =>
      row.nickname.trim().toLowerCase() === nameKey &&
      row.completedModules.length >= 3 &&
      Boolean(row.completedAt),
  );
  if (legacyComplete) return 'Complete';

  const legacyPartial = input.legacyBaselines.some(
    (row) => row.nickname.trim().toLowerCase() === nameKey && row.completedModules.length > 0,
  );
  if (legacyPartial) return 'In Progress';

  return 'Not Started';
}

function resolveLatestActivity(input: {
  participantId: string | null;
  displayName: string;
  modules: LocalModuleResultRecord[];
  legacyBaselines: B4BaselineCheckRecord[];
  assessments: LocalAssessmentV2Record[];
}): string | null {
  const nameKey = input.displayName.trim().toLowerCase();
  const events: Array<{ at: number; label: string }> = [];

  input.modules
    .filter((row) => row.participant_id === input.participantId)
    .forEach((row) => {
      events.push({
        at: new Date(row.completed_at).getTime(),
        label: `${row.module_title} completed`,
      });
    });

  input.assessments
    .filter((row) => row.participant_id === input.participantId)
    .forEach((row) => {
      events.push({
        at: new Date(row.completed_at).getTime(),
        label:
          row.assessment_type === 'baseline'
            ? `${input.displayName} completed B-4 Check-In`
            : `${input.displayName} completed ${row.assessment_type} assessment`,
      });
    });

  const hasV2Baseline = input.assessments.some(
    (row) =>
      row.participant_id === input.participantId &&
      row.role === 'student' &&
      row.assessment_type === 'baseline',
  );

  if (!hasV2Baseline) {
    input.legacyBaselines
      .filter((row) => row.nickname.trim().toLowerCase() === nameKey)
      .forEach((row) => {
        events.push({
          at: new Date(row.completedAt).getTime(),
          label: `${row.nickname} completed B-4 Check-In`,
        });
      });
  }

  if (!events.length) return null;
  events.sort((a, b) => b.at - a.at);
  return events[0]?.label ?? null;
}

function resolveProgressPct(participantId: string | null, modules: LocalModuleResultRecord[]): number {
  if (!participantId) return 0;
  const completed = new Set(
    modules.filter((row) => row.participant_id === participantId).map((row) => row.module_id),
  );
  return Math.min(100, Math.round((completed.size / TRACKED_MODULE_COUNT) * 100));
}

function buildChildSummary(input: {
  key: string;
  participantId: string | null;
  displayName: string;
  createdAt: string | null;
  modules: LocalModuleResultRecord[];
  assessments: LocalAssessmentV2Record[];
  legacyBaselines: B4BaselineCheckRecord[];
}): FamilyChildSummary {
  return {
    key: input.key,
    participantId: input.participantId,
    displayName: input.displayName,
    createdAt: input.createdAt,
    baselineStatus: resolveBaselineStatus({
      participantId: input.participantId,
      displayName: input.displayName,
      legacyBaselines: input.legacyBaselines,
      assessments: input.assessments,
    }),
    latestActivity: resolveLatestActivity({
      participantId: input.participantId,
      displayName: input.displayName,
      modules: input.modules,
      legacyBaselines: input.legacyBaselines,
      assessments: input.assessments,
    }),
    progressPct: resolveProgressPct(input.participantId, input.modules),
  };
}

export function computeFamilyChildrenSummaries(input: {
  programCode?: string;
  participants?: StudentParticipantRecord[];
  moduleResults?: LocalModuleResultRecord[];
  assessmentResults?: LocalAssessmentV2Record[];
  legacyBaselines?: B4BaselineCheckRecord[];
}): FamilyChildSummary[] {
  const code = normalizeCode(input.programCode);
  const modules = (input.moduleResults ?? []).filter(
    (row) => normalizeCode(row.program_code) === code,
  );
  const assessments = (input.assessmentResults ?? []).filter(
    (row) => normalizeCode(row.program_code) === code,
  );
  const legacyBaselines = (input.legacyBaselines ?? []).filter(
    (row) => normalizeCode(row.programCode) === code && Boolean(row.completedAt),
  );

  const summaries: FamilyChildSummary[] = [];
  const seenNames = new Set<string>();

  for (const participant of input.participants ?? []) {
    const displayName = childDisplayName(participant);
    const nameKey = displayName.toLowerCase();
    seenNames.add(nameKey);
    summaries.push(
      buildChildSummary({
        key: participant.id,
        participantId: participant.id,
        displayName,
        createdAt: participant.created_at ?? null,
        modules,
        assessments,
        legacyBaselines,
      }),
    );
  }

  for (const baseline of legacyBaselines) {
    const displayName = baseline.nickname.trim();
    if (!displayName) continue;
    const nameKey = displayName.toLowerCase();
    if (seenNames.has(nameKey)) continue;

    const hasV2Baseline = assessments.some((row) => {
      if (row.role !== 'student' || row.assessment_type !== 'baseline') return false;
      const answers = row.answers_json as { nickname?: string } | undefined;
      return answers?.nickname?.trim().toLowerCase() === nameKey;
    });
    if (hasV2Baseline) continue;

    seenNames.add(nameKey);
    summaries.push(
      buildChildSummary({
        key: `legacy-${nameKey}`,
        participantId: baseline.anonymousStudentId || null,
        displayName,
        createdAt: baseline.completedAt || null,
        modules,
        assessments,
        legacyBaselines,
      }),
    );
  }

  return summaries.sort((a, b) => a.displayName.localeCompare(b.displayName));
}
