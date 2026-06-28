import type { ActivePilotProgram } from '../types/pilotProgram';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { fetchStudentFamilyLinksByCampProgram } from './studentFamilyLinkService';
import { fetchStudentParticipantsFromSupabase } from './pilotTrackingService';

export type PortalProgramDiagnostic = {
  programId: string | null;
  programCode: string;
  displayName: string;
  familyAccessCode: string;
  participantCount: number;
  linkedFamilyCount: number;
  duplicateNameCandidates: Array<{
    normalizedName: string;
    participantIds: string[];
    displayNames: string[];
  }>;
};

function normalizeParticipantName(value?: string | null): string {
  return value
    ?.trim()
    .toLowerCase()
    .replace(/\b(player|grade|grader|student|child)\b/g, '')
    .replace(/\b(pre[-\s]?k|kindergarten|k|[1-8](st|nd|rd|th)?)\b/g, '')
    .replace(/[^a-z0-9]+/g, '') ?? '';
}

function participantDisplayName(row: {
  nickname?: string | null;
  first_name?: string | null;
  display_name?: string | null;
}): string {
  return row.display_name?.trim() || row.nickname?.trim() || row.first_name?.trim() || 'Player';
}

export async function buildPortalProgramDiagnostic(
  program: Pick<
    ActivePilotProgram,
    'id' | 'programCode' | 'programName' | 'familyAccessCode'
  > | null = readActivePilotProgram(),
): Promise<PortalProgramDiagnostic | null> {
  const programCode = program?.programCode?.trim() ?? '';
  if (!programCode) return null;

  const [participantsPayload, linksPayload] = await Promise.all([
    fetchStudentParticipantsFromSupabase(programCode),
    fetchStudentFamilyLinksByCampProgram(programCode),
  ]);

  const names = new Map<string, Array<{ id: string; displayName: string }>>();
  for (const participant of participantsPayload.participants) {
    const displayName = participantDisplayName(participant);
    const normalizedName = normalizeParticipantName(displayName);
    if (!normalizedName) continue;
    const list = names.get(normalizedName) ?? [];
    list.push({ id: participant.id, displayName });
    names.set(normalizedName, list);
  }

  return {
    programId: program?.id ?? null,
    programCode,
    displayName: program?.programName?.trim() || programCode,
    familyAccessCode: program?.familyAccessCode?.trim() || '',
    participantCount: participantsPayload.participants.length,
    linkedFamilyCount: new Set(
      linksPayload.links
        .map((link) => link.family_program_code?.trim())
        .filter((code): code is string => Boolean(code)),
    ).size,
    duplicateNameCandidates: Array.from(names.entries())
      .filter(([, rows]) => rows.length > 1)
      .map(([normalizedName, rows]) => ({
        normalizedName,
        participantIds: rows.map((row) => row.id),
        displayNames: rows.map((row) => row.displayName),
      })),
  };
}
