import { readActivePilotProgram } from '../config/activePilotProgram';
import { DASHBOARD_FETCH_TIMEOUT_MS, withTimeout } from './fetchWithTimeout';
import { isValidSupabaseParticipantId } from './pilotTrackingService';
import { createCampStudentFamilyLink } from './studentFamilyLinkService';
import { isSupabaseConfigured, supabase } from './supabaseClient';

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

function buildStudentLookupOrFilter(nickname: string, firstName: string): string | null {
  const names = new Set<string>();
  if (nickname) names.add(nickname);
  if (firstName) names.add(firstName);
  if (!names.size) return null;
  return Array.from(names)
    .flatMap((name) => [`nickname.eq.${name}`, `first_name.eq.${name}`])
    .join(',');
}

async function insertCampChildParticipant(input: {
  firstName: string;
  nickname: string;
  campProgramCode: string;
}): Promise<{ participantId: string } | { error: string }> {
  const firstName = input.firstName.trim();
  const nickname = input.nickname.trim();
  const campProgramCode = input.campProgramCode.trim();
  const programName = readActivePilotProgram()?.programName?.trim() || null;

  console.info('[CAMP_CHILD_INSERT_START]', {
    first_name: firstName,
    nickname,
    camp_program_code: campProgramCode,
  });

  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Supabase is not configured. Cannot add camp child.' };
  }

  try {
    let query = supabase
      .from('participants')
      .select('id')
      .eq('program_code', campProgramCode)
      .eq('role', 'student')
      .is('group_name', null);

    const orFilter = buildStudentLookupOrFilter(nickname, firstName);
    if (orFilter) {
      query = query.or(orFilter);
    }

    const { data: existingRows, error: selectError } = await withTimeout(
      query.limit(1),
      DASHBOARD_FETCH_TIMEOUT_MS,
      'camp_child_participant_lookup',
    );

    if (selectError) {
      return { error: selectError.message };
    }

    if (existingRows && existingRows.length > 0) {
      const participantId = existingRows[0].id as string;
      if (!isValidSupabaseParticipantId(participantId)) {
        return { error: 'Existing participant id is not a valid UUID.' };
      }

      const updatePayload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
        nickname,
        first_name: firstName,
      };
      if (programName) updatePayload.program_name = programName;

      const { error: updateError } = await withTimeout(
        supabase.from('participants').update(updatePayload).eq('id', participantId),
        DASHBOARD_FETCH_TIMEOUT_MS,
        'camp_child_participant_update',
      );

      if (updateError) {
        return { error: updateError.message };
      }

      console.info('[CAMP_CHILD_INSERT_SUCCESS]', {
        participant_id: participantId,
        camp_program_code: campProgramCode,
        action: 'existing',
      });
      return { participantId };
    }

    const insertPayload = {
      nickname,
      first_name: firstName,
      role: 'student',
      program_code: campProgramCode,
      program_name: programName,
      group_name: null,
      updated_at: new Date().toISOString(),
    };

    const { data, error: insertError } = await withTimeout(
      supabase.from('participants').insert(insertPayload).select('id').single(),
      DASHBOARD_FETCH_TIMEOUT_MS,
      'camp_child_participant_insert',
    );

    if (insertError) {
      return { error: insertError.message };
    }

    const insertedId = data?.id as string | undefined;
    if (!isValidSupabaseParticipantId(insertedId)) {
      return { error: 'Participant insert did not return a valid UUID.' };
    }
    const participantId = insertedId as string;

    console.info('[CAMP_CHILD_INSERT_SUCCESS]', {
      participant_id: participantId,
      camp_program_code: campProgramCode,
      action: 'inserted',
    });
    return { participantId };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not save camp child participant.';
    return { error: message };
  }
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
    const participantResult = await insertCampChildParticipant({
      firstName: childFirstName,
      nickname: displayName,
      campProgramCode,
    });

    if ('error' in participantResult) {
      return {
        success: false,
        displayName,
        message: participantResult.error,
      };
    }

    const { participantId } = participantResult;

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
