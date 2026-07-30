import { loadLocalParticipants } from './pilotTrackingLocalStorage';
import { mergeParticipantRecords } from './pilotResultsDisplay';
import { fetchParticipantsByIds } from './studentFamilyLinkService';
import {
  fetchStudentParticipantsFromSupabase,
  type StudentParticipantRecord,
} from './pilotTrackingService';
import {
  getCampCompatibilityParticipantDirectory,
  hasCampCompatibilitySession,
} from './campChildSessionApi';

function localParticipantsForProgram(programCode: string): StudentParticipantRecord[] {
  const code = programCode.trim().toUpperCase();
  return loadLocalParticipants()
    .filter((row) => row.program_code.trim().toUpperCase() === code)
    .map((row) => ({
      id: row.id,
      nickname: row.nickname ?? null,
      first_name: row.first_name ?? null,
      role: row.role,
      program_code: row.program_code,
      created_at: row.created_at,
      grade_level: row.grade_level ?? null,
      grade_band: row.grade_band ?? null,
      allow_stretch_level: row.allow_stretch_level ?? null,
    }));
}

/** Loads roster names from Supabase + local cache for dashboard display. */
export async function loadProgramParticipantDirectory(
  programCode: string,
  resultParticipantIds: string[] = [],
): Promise<{ participants: StudentParticipantRecord[]; errors: string[] }> {
  const errors: string[] = [];
  if (hasCampCompatibilitySession()) {
    try {
      const participants = await getCampCompatibilityParticipantDirectory();
      return {
        participants: mergeParticipantRecords(
          participants as StudentParticipantRecord[],
          [],
          localParticipantsForProgram(programCode),
        ),
        errors,
      };
    } catch (error) {
      errors.push(
        error instanceof Error && error.message
          ? error.message
          : 'camp_participant_directory_failed',
      );
      return {
        participants: localParticipantsForProgram(programCode),
        errors,
      };
    }
  }
  const [programPayload, byIdPayload] = await Promise.all([
    fetchStudentParticipantsFromSupabase(programCode),
    resultParticipantIds.length
      ? fetchParticipantsByIds(resultParticipantIds)
      : Promise.resolve({ participants: [] as StudentParticipantRecord[], error: undefined }),
  ]);

  if (programPayload.error) errors.push(programPayload.error);
  if (byIdPayload.error) errors.push(byIdPayload.error);

  return {
    participants: mergeParticipantRecords(
      programPayload.participants,
      byIdPayload.participants,
      localParticipantsForProgram(programCode),
    ),
    errors,
  };
}
