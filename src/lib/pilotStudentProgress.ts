import { isChildBaselineAssessmentType } from '../config/assessmentTypeConstants';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from './pilotTrackingLocalStorage';
import { formatAssessmentScore } from './pilotResultsDisplay';
import type { StudentParticipantRecord } from './pilotTrackingService';
import type { StudentFamilyLink } from './studentFamilyLinkService';

export const PILOT_CERTIFICATE_MIN_MODULES = 1;
export const PILOT_ACTIVE_DAYS = 7;
export const PILOT_INACTIVE_DAYS = 7;

export type PilotStudentStatus =
  | 'not-started'
  | 'in-progress'
  | 'baseline-complete'
  | 'active'
  | 'certificate-ready';

export type PilotStudentDetailSnapshot = {
  participantId: string;
  childName: string;
  nickname: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  baselineScore: string;
  modulesCompleted: number;
  lastAssessmentAt: string | null;
  lastModuleAt: string | null;
  lastActivityAt: string | null;
  certificateReady: boolean;
  status: PilotStudentStatus;
  campProgramCode: string;
  familyProgramCode: string;
};

export type PilotNeedsAttentionCounts = {
  missingBaseline: number;
  inactive7PlusDays: number;
  noModules: number;
  certificateReady: number;
};

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

export function resolveParticipantLastActivity(
  participantId: string,
  input: {
    assessments: LocalAssessmentV2Record[];
    modules: LocalModuleResultRecord[];
    participantCreatedAt?: string | null;
  },
): string | null {
  const timestamps = [
    ...input.assessments
      .filter((row) => row.participant_id === participantId)
      .map((row) => row.completed_at),
    ...input.modules
      .filter((row) => row.participant_id === participantId)
      .map((row) => row.completed_at),
    input.participantCreatedAt ?? null,
  ].filter(Boolean) as string[];

  if (!timestamps.length) return null;
  return timestamps.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
}

export function isActiveWithinDays(iso: string | null | undefined, days: number): boolean {
  if (!iso) return false;
  const ms = Date.now() - new Date(iso).getTime();
  return ms >= 0 && ms <= days * 24 * 60 * 60 * 1000;
}

export function isInactiveBeyondDays(iso: string | null | undefined, days: number): boolean {
  if (!iso) return true;
  const ms = Date.now() - new Date(iso).getTime();
  return ms > days * 24 * 60 * 60 * 1000;
}

export function resolveStudentStatus(input: {
  participantId: string;
  assessments: LocalAssessmentV2Record[];
  modules: LocalModuleResultRecord[];
  participantCreatedAt?: string | null;
  minModulesForCertificate?: number;
}): PilotStudentStatus {
  const minModules = input.minModulesForCertificate ?? PILOT_CERTIFICATE_MIN_MODULES;
  const baselineComplete = hasBaselineComplete(input.participantId, input.assessments);
  const moduleCount = input.modules.filter(
    (row) => row.participant_id === input.participantId,
  ).length;
  const lastActivity = resolveParticipantLastActivity(input.participantId, {
    assessments: input.assessments,
    modules: input.modules,
    participantCreatedAt: input.participantCreatedAt,
  });

  if (baselineComplete && moduleCount >= minModules) {
    return 'certificate-ready';
  }
  if (isActiveWithinDays(lastActivity, PILOT_ACTIVE_DAYS)) {
    return 'active';
  }
  if (baselineComplete) {
    return 'baseline-complete';
  }
  if (moduleCount > 0) {
    return 'in-progress';
  }
  return 'not-started';
}

export function pilotStudentStatusLabel(status: PilotStudentStatus): string {
  switch (status) {
    case 'certificate-ready':
      return 'Certificate Ready';
    case 'active':
      return 'Active';
    case 'baseline-complete':
      return 'Baseline Complete';
    case 'in-progress':
      return 'In Progress';
    default:
      return 'Not Started';
  }
}

export function formatAssessmentTypeLabel(type: string): string {
  switch (type) {
    case 'baseline':
      return 'Before Check-In';
    case 'final':
      return 'After Check-In';
    default:
      return type;
  }
}

export function buildStudentDetailSnapshot(input: {
  participant: StudentParticipantRecord;
  link?: StudentFamilyLink | null;
  assessments: LocalAssessmentV2Record[];
  modules: LocalModuleResultRecord[];
  programCode?: string;
}): PilotStudentDetailSnapshot {
  const { participant, link, assessments, modules, programCode } = input;
  const participantAssessments = assessments.filter(
    (row) => row.participant_id === participant.id,
  );
  const participantModules = modules.filter((row) => row.participant_id === participant.id);
  const baseline = participantAssessments.find((row) =>
    isChildBaselineAssessmentType(row.assessment_type),
  );
  const lastAssessmentAt =
    participantAssessments
      .map((row) => row.completed_at)
      .filter(Boolean)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;
  const lastModuleAt =
    participantModules
      .map((row) => row.completed_at)
      .filter(Boolean)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;
  const lastActivityAt = resolveParticipantLastActivity(participant.id, {
    assessments,
    modules,
    participantCreatedAt: participant.created_at,
  });
  const modulesCompleted = participantModules.length;
  const certificateReady =
    Boolean(baseline?.completed_at) && modulesCompleted >= PILOT_CERTIFICATE_MIN_MODULES;
  const parentFirst = link?.parent_first_name?.trim() ?? '';
  const parentLast = link?.parent_last_name?.trim() ?? '';
  const parentName = [parentFirst, parentLast].filter(Boolean).join(' ') || '—';

  return {
    participantId: participant.id,
    childName: participant.first_name?.trim() || participant.nickname?.trim() || 'Unknown Student',
    nickname: participant.nickname?.trim() || '—',
    parentName,
    parentEmail: link?.parent_email?.trim() || '—',
    parentPhone: link?.parent_phone?.trim() || '—',
    baselineScore: baseline ? formatAssessmentScore(baseline) : '—',
    modulesCompleted,
    lastAssessmentAt,
    lastModuleAt,
    lastActivityAt,
    certificateReady,
    status: resolveStudentStatus({
      participantId: participant.id,
      assessments,
      modules,
      participantCreatedAt: participant.created_at,
    }),
    campProgramCode: link?.camp_program_code?.trim() || programCode?.trim() || '—',
    familyProgramCode: link?.family_program_code?.trim() || '—',
  };
}

export function computeNeedsAttention(input: {
  participants: StudentParticipantRecord[];
  assessments: LocalAssessmentV2Record[];
  modules: LocalModuleResultRecord[];
}): PilotNeedsAttentionCounts {
  let missingBaseline = 0;
  let inactive7PlusDays = 0;
  let noModules = 0;
  let certificateReady = 0;

  for (const participant of input.participants) {
    const baselineComplete = hasBaselineComplete(participant.id, input.assessments);
    const moduleCount = input.modules.filter(
      (row) => row.participant_id === participant.id,
    ).length;
    const lastActivity = resolveParticipantLastActivity(participant.id, {
      assessments: input.assessments,
      modules: input.modules,
      participantCreatedAt: participant.created_at,
    });

    if (!baselineComplete) missingBaseline += 1;
    if (moduleCount === 0) noModules += 1;
    if (isInactiveBeyondDays(lastActivity, PILOT_INACTIVE_DAYS)) inactive7PlusDays += 1;
    if (baselineComplete && moduleCount >= PILOT_CERTIFICATE_MIN_MODULES) certificateReady += 1;
  }

  return { missingBaseline, inactive7PlusDays, noModules, certificateReady };
}

export function findParticipantById(
  participants: StudentParticipantRecord[],
  participantId: string,
): StudentParticipantRecord | undefined {
  return participants.find((row) => row.id === participantId);
}

export function findFamilyLinkForStudent(
  links: StudentFamilyLink[],
  participantId: string,
): StudentFamilyLink | undefined {
  return links.find((link) => link.student_id === participantId);
}
