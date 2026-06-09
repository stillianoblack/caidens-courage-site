import { findOrCreateParticipant } from './pilotTrackingService';
import { createCampStudentFamilyLink } from './studentFamilyLinkService';

export type CampChildOnboardingInput = {
  childFirstName: string;
  childNickname?: string;
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone?: string;
  campProgramCode: string;
};

export type CampChildOnboardingResult = {
  success: boolean;
  participantId?: string;
  linkId?: string;
  displayName: string;
  message: string;
};

function childDisplayName(firstName: string, nickname?: string): string {
  return nickname?.trim() || firstName.trim();
}

export async function createCampChildWithParentLink(
  input: CampChildOnboardingInput,
): Promise<CampChildOnboardingResult> {
  const childFirstName = input.childFirstName.trim();
  const parentEmail = input.parentEmail.trim();
  const parentLastName = input.parentLastName.trim();
  const campProgramCode = input.campProgramCode.trim();
  const displayName = childDisplayName(childFirstName, input.childNickname);

  if (!childFirstName || !parentEmail || !parentLastName || !campProgramCode) {
    return {
      success: false,
      displayName,
      message: 'Child first name, parent last name, and parent email are required.',
    };
  }

  try {
    const { participantId, source } = await findOrCreateParticipant({
      role: 'student',
      first_name: childFirstName,
      nickname: displayName,
      program_code: campProgramCode,
      group_name: undefined,
    });

    const linkResult = await createCampStudentFamilyLink({
      studentId: participantId,
      campProgramCode,
      parentFirstName: input.parentFirstName.trim(),
      parentLastName,
      parentEmail,
      parentPhone: input.parentPhone?.trim(),
      relationship: 'parent',
    });

    if (!linkResult.success) {
      return {
        success: false,
        participantId,
        displayName,
        message: linkResult.error ?? 'Child saved but parent link failed.',
      };
    }

    console.info('[CAMP_CHILD_ONBOARDED]', {
      participant_id: participantId,
      camp_program_code: campProgramCode,
      parent_email: parentEmail,
      parent_last_name: parentLastName,
      participant_source: source,
      link_id: linkResult.link?.id ?? null,
    });

    return {
      success: true,
      participantId,
      linkId: linkResult.link?.id,
      displayName,
      message: `${displayName} was added to camp. Parent can claim access later with the family code and ${parentEmail}.`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not onboard child.';
    return { success: false, displayName, message };
  }
}
