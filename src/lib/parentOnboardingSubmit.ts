import { readActivePilotProgram } from '../config/activePilotProgram';
import { readActiveAccessCode } from '../config/portalContext';
import { writeParentClaimContext } from '../config/parentClaimContext';
import { notifyChildProfileUpdated } from '../config/activeChildParticipant';
import { setActiveChild } from './activeChildContext';
import { saveFamilyChildGoals } from './familyChildGoalsService';
import { trackKitParentSignup } from './kitIntegration';
import { markParentOnboardingComplete } from './parentOnboardingState';
import { saveProgramGoals } from './programGoalsService';
import { revealStudentPinViaFunction } from './studentPinService';
import {
  fetchStudentFamilyLinksByCampProgram,
  fetchStudentFamilyLinksByFamilyProgram,
  markStudentFamilyLinksClaimed,
} from './studentFamilyLinkService';

export type ParentOnboardingSubmitInput = {
  programCode: string;
  parentEmail: string;
  childParticipantId: string;
  childDisplayName: string;
  selectedGoals: string[];
  parentFirstName?: string;
  parentLastName?: string;
  parentPhone?: string;
  accessCode?: string | null;
  campProgramCode?: string | null;
  skipWelcomeEmail?: boolean;
};

export type ParentOnboardingSubmitResult =
  | { success: true }
  | { success: false; message: string };

async function resolveFamilyLinkIds(input: {
  programCode: string;
  campProgramCode?: string | null;
  participantId: string;
}): Promise<{ linkIds: string[]; campProgramCode?: string | null }> {
  const participantId = input.participantId.trim();
  const familyPayload = await fetchStudentFamilyLinksByFamilyProgram(input.programCode.trim());
  let matches = familyPayload.links.filter((link) => link.student_id === participantId);

  if (matches.length) {
    return {
      linkIds: matches.map((link) => link.id),
      campProgramCode: matches[0]?.camp_program_code ?? input.campProgramCode ?? null,
    };
  }

  const campCode = input.campProgramCode?.trim();
  if (campCode) {
    const campPayload = await fetchStudentFamilyLinksByCampProgram(campCode);
    matches = campPayload.links.filter((link) => link.student_id === participantId);
    return {
      linkIds: matches.map((link) => link.id),
      campProgramCode: campCode,
    };
  }

  return { linkIds: [], campProgramCode: null };
}

export async function submitParentOnboarding(
  input: ParentOnboardingSubmitInput,
): Promise<ParentOnboardingSubmitResult> {
  const programCode = input.programCode.trim();
  const parentEmail = input.parentEmail.trim().toLowerCase();
  const participantId = input.childParticipantId.trim();
  const childDisplayName = input.childDisplayName.trim();
  const selectedGoals = input.selectedGoals.map((goal) => goal.trim()).filter(Boolean);

  if (!programCode) {
    return { success: false, message: 'Missing program information. Refresh and try again.' };
  }
  if (!parentEmail) {
    return { success: false, message: 'Enter a parent or guardian email to continue.' };
  }
  if (!participantId) {
    return { success: false, message: 'Select a child before finishing setup.' };
  }
  if (!childDisplayName) {
    return { success: false, message: 'Enter your child’s name to continue.' };
  }
  if (!selectedGoals.length) {
    return { success: false, message: 'Choose at least one family goal.' };
  }

  const activeProgram = readActivePilotProgram();
  const accessCode =
    input.accessCode?.trim() ||
    readActiveAccessCode()?.trim() ||
    activeProgram?.familyAccessCode?.trim() ||
    '';

  const { linkIds } = await resolveFamilyLinkIds({
    programCode,
    campProgramCode: input.campProgramCode,
    participantId,
  });

  if (!linkIds.length) {
    return {
      success: false,
      message:
        'Could not find your child link for this program. Ask your facilitator to confirm your family connection.',
    };
  }

  const claimResult = await markStudentFamilyLinksClaimed({
    linkIds,
    familyProgramCode: programCode,
    parentEmail,
    parentPhone: input.parentPhone?.trim() || undefined,
    parentLastName: input.parentLastName?.trim() || undefined,
  });

  if (!claimResult.success) {
    return {
      success: false,
      message: claimResult.error ?? 'Could not save parent email. Try again in a moment.',
    };
  }

  writeParentClaimContext({
    email: parentEmail,
    phone: input.parentPhone?.trim() || undefined,
    lastName: input.parentLastName?.trim() || undefined,
    confirmed: true,
    programCode,
    accessCode: accessCode || undefined,
  });

  await saveProgramGoals({
    program_code: programCode,
    portal_type: 'family',
    selected_goals: selectedGoals,
    completed_at: new Date().toISOString(),
  });

  await saveFamilyChildGoals({
    family_program_code: programCode,
    child_id: participantId,
    child_name: childDisplayName,
    parent_email: parentEmail,
    goals: selectedGoals,
    strengths: [selectedGoals[0] ?? 'Family focus'],
    completed_at: new Date().toISOString(),
  });

  setActiveChild({
    participantId,
    displayName: childDisplayName,
  });

  markParentOnboardingComplete({
    programCode,
    parentEmail,
    familyGoals: selectedGoals,
    childParticipantId: participantId,
    childDisplayName,
  });

  notifyChildProfileUpdated();

  if (!input.skipWelcomeEmail) {
    let studentPin: string | undefined;
    try {
      const pinResult = await revealStudentPinViaFunction({
        participantId,
        programCode,
        parentEmail,
        actorRole: 'parent',
      });
      if ('pin' in pinResult) {
        studentPin = pinResult.pin;
      }
    } catch {
      /* PIN optional in welcome email */
    }

    trackKitParentSignup({
      parentEmail,
      eventName: 'parent_onboarding_complete',
      metadata: {
        family_program_code: programCode,
        participant_id: participantId,
      },
      welcomeEmail: {
        parentEmail,
        familyOrProgramName: activeProgram?.programName ?? programCode,
        familyAccessCode: accessCode || null,
        childName: childDisplayName,
        studentPin,
        relatedStudentId: participantId,
      },
    });
  }

  console.info('[PARENT_ONBOARDING_SAVED]', {
    parent_email: parentEmail,
    program_code: programCode,
    participant_id: participantId,
    family_goals: selectedGoals,
    parent_claim_confirmed: true,
  });

  return { success: true };
}
