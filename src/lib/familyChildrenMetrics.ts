import {
  CHILD_BEFORE_CHECK_IN_LABEL,
  isChildBaselineAssessmentType,
} from '../config/assessmentTypeConstants';
import { hasAllBaselineModules } from '../data/b4BaselineCheckContent';
import type { B4BaselineCheckRecord } from './b4BaselineCheckStorage';
import type { StudentParticipantRecord } from './pilotTrackingService';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from './pilotTrackingLocalStorage';
import { getChildActivityProgress } from './familyProgressHelpers';

export type FamilyChildBaselineStatus = 'Complete' | 'In Progress' | 'Not Started';

export type FamilyChildSummary = {
  key: string;
  participantId: string | null;
  displayName: string;
  baselineStatus: FamilyChildBaselineStatus;
  latestActivity: string | null;
  progressPct: number;
  completedCount: number;
  totalCount: number;
  progressLabel: string;
  createdAt: string | null;
};

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
  const rowParticipantId = row.participantId?.trim() || '';
  if (rowParticipantId) {
    return Boolean(participantId && rowParticipantId === participantId);
  }

  const nameKey = normalizeName(displayName);
  if (!nameKey) return false;
  return (
    normalizeName(row.nickname) === nameKey || normalizeName(row.firstName) === nameKey
  );
}

function resolveAssessmentParticipantId(row: LocalAssessmentV2Record): string {
  if (row.participant_id?.trim()) return row.participant_id.trim();

  const answers = row.answers_json as { participant_id?: string; student_id?: string } | undefined;
  return answers?.participant_id?.trim() || answers?.student_id?.trim() || '';
}

function matchesV2StudentRow(
  participantId: string | null,
  displayName: string,
  row: LocalAssessmentV2Record,
): boolean {
  if (row.role !== 'student') return false;

  const rowParticipantId = resolveAssessmentParticipantId(row);
  if (rowParticipantId) {
    return Boolean(participantId && rowParticipantId === participantId);
  }

  return normalizeName(resolveAssessmentStudentName(row)) === normalizeName(displayName);
}

function resolveAssessmentStudentName(row: LocalAssessmentV2Record): string {
  const answers = row.answers_json as
    | {
        nickname?: string;
        childNickname?: string;
        child_nickname?: string;
        studentName?: string;
        first_name?: string;
      }
    | undefined;

  return (
    answers?.nickname?.trim() ||
    answers?.childNickname?.trim() ||
    answers?.child_nickname?.trim() ||
    answers?.studentName?.trim() ||
    answers?.first_name?.trim() ||
    ''
  );
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

  const baselineV2 = v2Rows.filter((row) => isChildBaselineAssessmentType(row.assessment_type));
  const completeBaselineV2 = baselineV2.find((row) => Boolean(row.participant_id?.trim()));
  if (completeBaselineV2) {
    console.info('[CHILD_BASELINE_MATCH]', {
      display_name: input.displayName,
      participant_id: input.participantId,
      match_source: 'assessment_results_v2',
      assessment_type: completeBaselineV2.assessment_type,
      matched_rows: baselineV2.length,
    });
    return 'Complete';
  }

  if (baselineV2.length > 0) return 'In Progress';

  const legacyMatch = input.legacyBaselines.filter((row) =>
    matchesLegacyBaseline(input.participantId, input.displayName, row),
  );

  if (
    legacyMatch.some(
      (row) => Boolean(row.completedAt) && hasAllBaselineModules(row.completedModules),
    )
  ) {
    console.info('[CHILD_BASELINE_MATCH]', {
      display_name: input.displayName,
      participant_id: input.participantId,
      match_source: 'legacy_local_baseline',
      matched_rows: legacyMatch.length,
    });
    return 'Complete';
  }

  if (legacyMatch.length > 0) return 'In Progress';

  console.info('[CHILD_BASELINE_MATCH]', {
    display_name: input.displayName,
    participant_id: input.participantId,
    match_source: 'none',
    status: 'Not Started',
  });

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
        label: isChildBaselineAssessmentType(row.assessment_type)
          ? `${input.displayName} completed ${CHILD_BEFORE_CHECK_IN_LABEL}`
          : `${input.displayName} completed ${row.assessment_type.replace(/_/g, ' ')}`,
      });
    });

  const hasV2Baseline = input.assessments.some(
    (row) =>
      matchesV2StudentRow(input.participantId, input.displayName, row) &&
      isChildBaselineAssessmentType(row.assessment_type),
  );

  if (!hasV2Baseline) {
    input.legacyBaselines
      .filter((row) => matchesLegacyBaseline(input.participantId, input.displayName, row))
      .forEach((row) => {
        events.push({
          at: new Date(row.completedAt).getTime(),
          label: `${input.displayName} completed ${CHILD_BEFORE_CHECK_IN_LABEL}`,
        });
      });
  }

  if (!events.length) return null;
  events.sort((a, b) => b.at - a.at);
  return events[0]?.label ?? null;
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

  const progress = getChildActivityProgress({
    participantId: input.participantId,
    baselineComplete: baselineStatus === 'Complete',
    modules: input.modules,
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
    progressPct: progress.percent,
    completedCount: progress.completed,
    totalCount: progress.total,
    progressLabel: progress.label,
  };
}

function isAllowedStudentRow(
  participantId: string | null | undefined,
  allowedStudentIds?: string[],
): boolean {
  if (!allowedStudentIds?.length) return true;
  const id = participantId?.trim();
  return Boolean(id && allowedStudentIds.includes(id));
}

export function computeFamilyChildrenSummaries(input: {
  programCode?: string;
  participants?: StudentParticipantRecord[];
  allowedStudentIds?: string[];
  moduleResults?: LocalModuleResultRecord[];
  assessmentResults?: LocalAssessmentV2Record[];
  legacyBaselines?: B4BaselineCheckRecord[];
}): FamilyChildSummary[] {
  const code = normalizeCode(input.programCode);
  const scopedToAllowed = Boolean(input.allowedStudentIds?.length);
  const modules = (input.moduleResults ?? []).filter((row) => {
    if (row.role === 'student' && scopedToAllowed) {
      return isAllowedStudentRow(row.participant_id, input.allowedStudentIds);
    }
    return normalizeCode(row.program_code) === code;
  });
  const assessments = (input.assessmentResults ?? []).filter((row) => {
    if (row.role === 'student' && scopedToAllowed) {
      return isAllowedStudentRow(row.participant_id, input.allowedStudentIds);
    }
    return normalizeCode(row.program_code) === code;
  });
  const legacyBaselines = (input.legacyBaselines ?? []).filter((row) => {
    if (scopedToAllowed) {
      const participantId = row.participantId?.trim() || row.anonymousStudentId?.trim() || '';
      return isAllowedStudentRow(participantId, input.allowedStudentIds);
    }
    return normalizeCode(row.programCode) === code;
  });

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

  if (scopedToAllowed) {
    return summaries.sort((a, b) => a.displayName.localeCompare(b.displayName));
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

  for (const assessment of assessments) {
    if (assessment.role !== 'student') continue;
    const displayName = resolveAssessmentStudentName(assessment);
    if (!displayName) continue;
    const nameKey = normalizeName(displayName);
    if (seenNames.has(nameKey)) continue;

    const hasParticipantMatch = (input.participants ?? []).some(
      (participant) =>
        participant.id === assessment.participant_id ||
        normalizeName(childDisplayName(participant)) === nameKey,
    );
    if (hasParticipantMatch) continue;

    seenNames.add(nameKey);
    summaries.push(
      buildChildSummary({
        key: `assessment-${assessment.participant_id || nameKey}`,
        participantId: assessment.participant_id || null,
        displayName,
        createdAt: assessment.completed_at || null,
        modules,
        assessments,
        legacyBaselines,
      }),
    );
  }

  return summaries.sort((a, b) => a.displayName.localeCompare(b.displayName));
}
