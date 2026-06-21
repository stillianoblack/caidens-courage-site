import { buildFamilyClaimUrl } from './familyClaimCode';
import { resolveStudentDisplayNameOrFallback } from './studentDisplayName';
import { isValidSupabaseParticipantId } from './pilotTrackingService';
import { ensureCampStudentFamilyLink, fetchParticipantsByIds } from './studentFamilyLinkService';
import {
  assignStudentPinToParticipant,
  ensureFamilyClaimCodeForParticipant,
  fetchStudentAccessFieldsByIds,
} from './studentPinService';

export type StudentAccessReadyPayload = {
  participantId: string;
  programCode: string;
  displayName: string;
  hasPin: boolean;
  familyClaimCode: string | null;
  familyClaimUrl: string | null;
  pinAssigned: boolean;
  claimCodeAssigned: boolean;
  generatedPin?: string;
};

export type EnsureStudentAccessReadyResult =
  | { success: true; access: StudentAccessReadyPayload }
  | { success: false; error: string; missing: string[] };

export async function ensureStudentAccessReady(input: {
  participantId: string;
  programCodeHint?: string;
  displayNameHint?: string;
}): Promise<EnsureStudentAccessReadyResult> {
  const participantId = input.participantId.trim();
  const missing: string[] = [];

  if (!participantId) {
    missing.push('participantId');
  }
  if (!isValidSupabaseParticipantId(participantId)) {
    console.warn('[ENSURE_STUDENT_ACCESS]', {
      participantId,
      missing: ['validParticipantId'],
    });
    return {
      success: false,
      error: 'Student must be saved to Supabase before access can be generated.',
      missing: ['validParticipantId'],
    };
  }

  const { participants } = await fetchParticipantsByIds([participantId]);
  const participant = participants[0];
  const programCode =
    participant?.program_code?.trim() || input.programCodeHint?.trim() || '';

  if (!programCode) {
    missing.push('programCode');
  }

  if (missing.length) {
    console.warn('[ENSURE_STUDENT_ACCESS]', { participantId, programCode, missing });
    return {
      success: false,
      error: `Missing student access context: ${missing.join(', ')}.`,
      missing,
    };
  }

  const displayName =
    input.displayNameHint?.trim() ||
    (participant
      ? resolveStudentDisplayNameOrFallback(
          { nickname: participant.nickname, first_name: participant.first_name },
          'Student',
        )
      : 'Student');

  const accessMap = await fetchStudentAccessFieldsByIds([participantId]);
  const existing = accessMap.get(participantId);
  let pinAssigned = false;
  let claimCodeAssigned = false;
  let generatedPin: string | undefined;

  if (!existing?.hasPin) {
    const pinResult = await assignStudentPinToParticipant({ participantId, programCode });
    if ('error' in pinResult) {
      return { success: false, error: pinResult.error, missing: [] };
    }
    pinAssigned = true;
    generatedPin = pinResult.pin;
  }

  let familyClaimCode = existing?.family_claim_code?.trim() || null;
  if (!familyClaimCode) {
    const claimResult = await ensureFamilyClaimCodeForParticipant({ participantId });
    if ('error' in claimResult) {
      return { success: false, error: claimResult.error, missing: [] };
    }
    familyClaimCode = claimResult.code;
    claimCodeAssigned = true;
  }

  await ensureCampStudentFamilyLink({
    studentId: participantId,
    campProgramCode: programCode,
  });

  const refreshed = await fetchStudentAccessFieldsByIds([participantId]);
  const updated = refreshed.get(participantId);

  return {
    success: true,
    access: {
      participantId,
      programCode,
      displayName,
      hasPin: Boolean(updated?.hasPin ?? pinAssigned ?? existing?.hasPin),
      familyClaimCode,
      familyClaimUrl: familyClaimCode ? buildFamilyClaimUrl(familyClaimCode) : null,
      pinAssigned,
      claimCodeAssigned,
      generatedPin,
    },
  };
}

export async function copyFamilyClaimLinkForStudent(input: {
  participantId: string;
  programCodeHint?: string;
  displayNameHint?: string;
}): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const ready = await ensureStudentAccessReady(input);
  if (!ready.success) {
    return { success: false, error: ready.error };
  }
  if (!ready.access.familyClaimUrl) {
    return { success: false, error: 'Could not generate a family claim link.' };
  }
  try {
    await navigator.clipboard.writeText(ready.access.familyClaimUrl);
    return { success: true, url: ready.access.familyClaimUrl };
  } catch {
    return { success: false, error: 'Copy failed.' };
  }
}
