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

function normalizeName(value?: string | null): string {
  return value?.trim().toLowerCase() ?? '';
}

function childDisplayName(participant: Pick<StudentParticipantRecord, 'nickname' | 'first_name'>): string {
  return participant.nickname?.trim() || participant.first_name?.trim() || 'Child';
}

function matchesLegacyBaseline(
  participantId: string | null,
  displayName: string,
  row: B4BaselineCheckRecord,
): boolean {
  const nameKey = normalizeName(displayName);
  if (participantId && row.anonymousStudentId === participantId) {
    return true;
  }
  return normalizeName(row.nickname) === nameKey;
}

function matchesV2StudentRow(
  participantId: string | null,
  displayName: string,
  row: LocalAssessmentV2Record,
): boolean {
  if (row.role !== 'student') return false;
  if (participantId && row.participant_id === participantId) return true;
  const answers = row.answers_json as { nickname?: string } | undefined;
  return normalizeName(answers?.nickname) === normalizeName(displayName);
}

function resolveBaselineStatus(input: {
  participantId: string | null;
  displayName: string;
  legacyBaselines: B4BaselineCheckRecord[];
  assessments: LocalAssessmentV2Record[];
}): FamilyChildBaselineStatus {
  const v2Rows = input.assessments.filter((row) =>
    matchesV2StudentRow(input.participantId, input.displayName, row),
  );

  if (v2Rows.some((row) => row.assessment_type === 'baseline')) {
    return 'Complete';
  }

  if (v2Rows.length > 0) return 'In Progress';

  const legacyMatch = input.legacyBaselines.filter((row) =>
    matchesLegacyBaseline(input.participantId, input.displayName, row),
  );

  if (legacyMatch.some((row) => Boolean(row.completedAt))) {
    return 'Complete';
  }

  if (legacyMatch.length > 0) return 'In Progress';

  return 'Not Started';
}

function resolveLatestActivity(input: {
  participantId: string | null;
  displayName: string;
  modules: LocalModuleResultRecord[];
  legacyBaselines: B4BaselineCheckRecord[];
  assessments: LocalAssessmentV2Record[];
}): string | null {
  const events: Array<{ at: number; label: string }> = [];

  input.modules
    .filter((row) => input.participantId && row.participant_id === input.participantId)
    .forEach((row) => {
      events.push({
        at: new Date(row.completed_at).getTime(),
        label: `${row.module_title} completed`,
      });
    });

  input.assessments
    .filter((row) => matchesV2StudentRow(input.participantId, input.displayName, row))
    .forEach((row) => {
      events.push({
        at: new Date(row.completed_at).getTime(),
        label:
          row.assessment_type === 'baseline'
            ? `${input.displayName} completed B-4 Check-In`
            : `${input.displayName} completed ${row.assessment_type.replace(/_/g, ' ')}`,
      });
    });

  const hasV2Baseline = input.assessments.some(
    (row) =>
      matchesV2StudentRow(input.participantId, input.displayName, row) &&
      row.assessment_type === 'baseline',
  );

  if (!hasV2Baseline) {
    input.legacyBaselines
      .filter((row) => matchesLegacyBaseline(input.participantId, input.displayName, row))
      .forEach((row) => {
        events.push({
          at: new Date(row.completedAt).getTime(),
          label: `${input.displayName} completed B-4 Check-In`,
        });
      });
  }

  if (!events.length) return null;
  events.sort((a, b) => b.at - a.at);
  return events[0]?.label ?? null;
}

function resolveProgressPct(input: {
  participantId: string | null;
  displayName: string;
  baselineStatus: FamilyChildBaselineStatus;
  modules: LocalModuleResultRecord[];
  assessments: LocalAssessmentV2Record[];
  legacyBaselines: B4BaselineCheckRecord[];
}): number {
  if (input.participantId) {
    const completed = new Set(
      input.modules
        .filter((row) => row.participant_id === input.participantId)
        .map((row) => row.module_id),
    );
    if (completed.size > 0) {
      return Math.min(100, Math.round((completed.size / TRACKED_MODULE_COUNT) * 100));
    }
  }

  if (input.baselineStatus === 'Complete') {
    const v2Baseline = input.assessments.find(
      (row) =>
        matchesV2StudentRow(input.participantId, input.displayName, row) &&
        row.assessment_type === 'baseline',
    );
    if (v2Baseline?.percent_score != null) {
      return Math.min(100, Math.round(Number(v2Baseline.percent_score)));
    }

    const legacy = input.legacyBaselines.find((row) =>
      matchesLegacyBaseline(input.participantId, input.displayName, row),
    );
    if (legacy) {
      const total = legacy.feelingsScore + legacy.readingScore + legacy.focusMovesScore;
      return Math.min(100, Math.round((total / 60) * 100));
    }

    return 15;
  }

  if (input.baselineStatus === 'In Progress') {
    return 5;
  }

  return 0;
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
  const baselineStatus = resolveBaselineStatus({
    participantId: input.participantId,
    displayName: input.displayName,
    legacyBaselines: input.legacyBaselines,
    assessments: input.assessments,
  });

  return {
    key: input.key,
    participantId: input.participantId,
    displayName: input.displayName,
    createdAt: input.createdAt,
    baselineStatus,
    latestActivity: resolveLatestActivity({
      participantId: input.participantId,
      displayName: input.displayName,
      modules: input.modules,
      legacyBaselines: input.legacyBaselines,
      assessments: input.assessments,
    }),
    progressPct: resolveProgressPct({
      participantId: input.participantId,
      displayName: input.displayName,
      baselineStatus,
      modules: input.modules,
      assessments: input.assessments,
      legacyBaselines: input.legacyBaselines,
    }),
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
    (row) => normalizeCode(row.programCode) === code,
  );

  const summaries: FamilyChildSummary[] = [];
  const seenNames = new Set<string>();

  for (const participant of input.participants ?? []) {
    const displayName = childDisplayName(participant);
    const nameKey = normalizeName(displayName);
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
    const nameKey = normalizeName(displayName);
    if (seenNames.has(nameKey)) continue;

    const hasParticipantMatch = (input.participants ?? []).some(
      (participant) =>
        participant.id === baseline.anonymousStudentId ||
        normalizeName(childDisplayName(participant)) === nameKey,
    );
    if (hasParticipantMatch) continue;

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
