import type { PilotRosterRow } from '../hooks/usePilotRosterData';
import type { StudentParticipantRecord } from './pilotTrackingService';
import { resolveStudentDisplayNameOrFallback } from './studentDisplayName';
import { isValidSupabaseParticipantId } from './pilotTrackingService';

/** Scoped access context for a single roster student — never infer from dropdown or storage. */
export type StudentRosterAccessContext = {
  participantId: string;
  /** participants.program_code — required for PIN netlify functions */
  programCode: string;
  campProgramCode: string;
  childName: string;
  familyClaimCode: string | null;
  familyClaimUrl: string | null;
  hasPin: boolean;
  pinLastRotatedAt: string | null;
  parentConnectionLabel: string;
};

export function resolveStudentRosterAccessContext(input: {
  participantId: string;
  participants: StudentParticipantRecord[];
  row?: PilotRosterRow | null;
  fallbackProgramCode?: string;
}): StudentRosterAccessContext | null {
  const participantId = input.participantId.trim();
  if (!participantId) return null;

  const participant = input.participants.find((row) => row.id === participantId);
  const row = input.row ?? null;
  const fallbackProgramCode = input.fallbackProgramCode?.trim() || '';
  const programCode =
    participant?.program_code?.trim() ||
    row?.programCode?.trim() ||
    row?.campProgramCode?.trim() ||
    fallbackProgramCode;

  if (!programCode) {
    console.warn('[ROSTER_ACCESS_CONTEXT]', {
      participantId,
      missing: ['programCode'],
      hasParticipant: Boolean(participant),
      hasRow: Boolean(row),
    });
    return null;
  }

  if (!isValidSupabaseParticipantId(participantId)) {
    console.warn('[ROSTER_ACCESS_CONTEXT]', {
      participantId,
      missing: ['validParticipantId'],
    });
  }

  const childName =
    row?.childName ||
    (participant
      ? resolveStudentDisplayNameOrFallback(
          { nickname: participant.nickname, first_name: participant.first_name },
          'Student',
        )
      : 'Student');

  return {
    participantId,
    programCode,
    campProgramCode: row?.campProgramCode?.trim() || programCode,
    childName,
    familyClaimCode: row?.familyClaimCode ?? null,
    familyClaimUrl: row?.familyClaimUrl ?? null,
    hasPin: Boolean(row?.hasPin),
    pinLastRotatedAt: row?.pinLastRotatedAt ?? null,
    parentConnectionLabel: row?.parentConnectionLabel ?? '—',
  };
}

export function logMissingRosterAccessContext(
  action: string,
  ctx: StudentRosterAccessContext | null,
): void {
  if (ctx?.participantId && ctx.programCode) return;
  console.warn(`[ROSTER_${action.toUpperCase()}]`, {
    missingParticipantId: !ctx?.participantId,
    missingProgramCode: !ctx?.programCode,
    participantId: ctx?.participantId ?? null,
    programCode: ctx?.programCode ?? null,
  });
}
