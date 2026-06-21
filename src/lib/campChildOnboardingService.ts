import { DASHBOARD_FETCH_TIMEOUT_MS, withTimeout } from './fetchWithTimeout';
import { normalizeGradeLevelStorage, type GradeLevel } from '../data/gradeLevelOptions';
import { getGradeBand } from './getGradeBand';
import { isValidSupabaseParticipantId } from './pilotTrackingService';
import { saveParticipantGradeLevel } from './participantGradeService';
import {
  backfillStudentFamilyLinkParentContact,
  createCampStudentFamilyLink,
  ensureCampStudentFamilyLink,
} from './studentFamilyLinkService';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import {
  assignStudentPinToParticipant,
  ensureFamilyClaimCodeForParticipant,
  type ParentConnectionStatus,
} from './studentPinService';
import { buildFamilyClaimUrl } from './familyClaimCode';
import { resolveStudentDisplayNameOrFallback } from './studentDisplayName';
import { queueWelcomeEmail } from './welcomeEmailService';

export type CampChildOnboardingInput = {
  childFirstName: string;
  childLastName?: string;
  childNickname?: string;
  connectParentLater?: boolean;
  parentFirstName?: string;
  parentLastName?: string;
  parentEmail?: string;
  parentPhone?: string;
  gradeLevel?: GradeLevel;
  campProgramCode: string;
};

export type CampChildOnboardingResult = {
  success: boolean;
  participantId?: string;
  linkId?: string;
  displayName: string;
  message: string;
  studentPin?: string;
  familyClaimCode?: string;
  familyClaimUrl?: string;
  parentConnectionStatus?: ParentConnectionStatus;
};

function buildStudentLookupOrFilter(nickname: string, firstName: string, lastName?: string): string | null {
  const names = new Set<string>();
  if (nickname) names.add(nickname);
  if (firstName) names.add(firstName);
  if (lastName) names.add(lastName);
  if (!names.size) return null;
  return Array.from(names)
    .flatMap((name) => [`nickname.eq.${name}`, `first_name.eq.${name}`, `last_name.eq.${name}`])
    .join(',');
}

async function insertCampChildParticipant(input: {
  firstName: string;
  lastName?: string;
  nickname: string;
  campProgramCode: string;
  gradeLevel?: GradeLevel;
}): Promise<{ participantId: string } | { error: string }> {
  const firstName = input.firstName.trim();
  const lastName = input.lastName?.trim() || null;
  const nickname = input.nickname.trim() || firstName;
  const campProgramCode = input.campProgramCode.trim();
  const gradeLevel = normalizeGradeLevelStorage(input.gradeLevel) ?? undefined;
  const gradeBand = gradeLevel ? getGradeBand(gradeLevel) : undefined;

  console.info('[CAMP_CHILD_INSERT_START]', {
    first_name: firstName,
    last_name: lastName,
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

    const orFilter = buildStudentLookupOrFilter(nickname, firstName, lastName ?? undefined);
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
        nickname,
        first_name: firstName,
        ...(lastName ? { last_name: lastName } : {}),
      };
      if (gradeLevel) {
        updatePayload.grade_level = gradeLevel;
        updatePayload.grade_band = gradeBand!;
      }

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

    const insertPayload: Record<string, unknown> = {
      role: 'student',
      nickname,
      first_name: firstName,
      program_code: campProgramCode,
      group_name: null,
      ...(lastName ? { last_name: lastName } : {}),
    };
    if (gradeLevel) {
      insertPayload.grade_level = gradeLevel;
      insertPayload.grade_band = gradeBand!;
    }

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

async function finalizeCampStudentAccess(input: {
  participantId: string;
  campProgramCode: string;
  parentConnectionStatus: ParentConnectionStatus;
  guardianEmail?: string | null;
  guardianPhone?: string | null;
}): Promise<{ studentPin?: string; familyClaimCode?: string; linkId?: string; error?: string }> {
  const { participantId, campProgramCode } = input;

  const pinResult = await assignStudentPinToParticipant({ participantId, programCode: campProgramCode });
  if ('error' in pinResult) {
    return { error: pinResult.error };
  }

  const claimResult = await ensureFamilyClaimCodeForParticipant({ participantId });
  if ('error' in claimResult) {
    return { error: claimResult.error };
  }

  const linkResult = await ensureCampStudentFamilyLink({ studentId: participantId, campProgramCode });
  if (!linkResult.success) {
    return { error: linkResult.error ?? 'Could not create family link stub.' };
  }

  if (isSupabaseConfigured() && supabase) {
    await supabase
      .from('participants')
      .update({
        parent_connection_status: input.parentConnectionStatus,
        guardian_email: input.guardianEmail ?? null,
        guardian_phone: input.guardianPhone ?? null,
      })
      .eq('id', participantId);
  }

  return {
    studentPin: pinResult.pin,
    familyClaimCode: claimResult.code,
    linkId: linkResult.link?.id,
  };
}

/** Backward-compatible entry — parent email optional; omit email to create an unclaimed student with PIN. */
export async function createCampChildWithParentLink(
  input: CampChildOnboardingInput,
): Promise<CampChildOnboardingResult> {
  return createCampChildWithOptionalParent(input);
}

export async function createCampChildWithOptionalParent(
  input: CampChildOnboardingInput,
): Promise<CampChildOnboardingResult> {
  const childFirstName = input.childFirstName.trim();
  const childLastName = input.childLastName?.trim();
  const childNickname = input.childNickname?.trim() || childFirstName;
  const parentEmail = input.parentEmail?.trim() || '';
  const parentLastName = input.parentLastName?.trim() || '';
  const parentFirstName = input.parentFirstName?.trim() || '';
  const campProgramCode = input.campProgramCode.trim();
  const hasParentEmail = Boolean(parentEmail);
  const displayName = resolveStudentDisplayNameOrFallback(
    {
      nickname: childNickname,
      first_name: childFirstName,
      last_name: childLastName,
    },
    'Student',
  );

  if (!childFirstName || !campProgramCode) {
    return {
      success: false,
      displayName,
      message: 'Child first name and program are required.',
    };
  }

  if (!childLastName && !input.childNickname?.trim()) {
    return {
      success: false,
      displayName,
      message: 'Add a last name or nickname for the student.',
    };
  }

  if (hasParentEmail && (!parentFirstName || !parentLastName)) {
    return {
      success: false,
      displayName,
      message: 'Parent/guardian first and last name are required when adding a parent email.',
    };
  }

  if (!normalizeGradeLevelStorage(input.gradeLevel)) {
    return {
      success: false,
      displayName,
      message: 'Grade level is required so missions match the student profile.',
    };
  }

  const parentConnectionStatus: ParentConnectionStatus = hasParentEmail ? 'invited' : 'unclaimed';

  try {
    const participantResult = await insertCampChildParticipant({
      firstName: childFirstName,
      lastName: childLastName,
      nickname: childNickname,
      campProgramCode,
      gradeLevel: normalizeGradeLevelStorage(input.gradeLevel) ?? undefined,
    });

    if ('error' in participantResult) {
      return {
        success: false,
        displayName,
        message: participantResult.error,
      };
    }

    const { participantId } = participantResult;

    const access = await finalizeCampStudentAccess({
      participantId,
      campProgramCode,
      parentConnectionStatus,
      guardianEmail: hasParentEmail ? parentEmail : null,
      guardianPhone: input.parentPhone?.trim() || null,
    });

    if (access.error) {
      return {
        success: false,
        participantId,
        displayName,
        message: access.error,
      };
    }

    let linkId = access.linkId;

    if (hasParentEmail && parentFirstName && parentLastName) {
      if (linkId) {
        const backfill = await backfillStudentFamilyLinkParentContact({
          linkId,
          parentEmail,
          parentFirstName,
          parentLastName,
          parentPhone: input.parentPhone?.trim(),
        });
        if (!backfill.success) {
          return {
            success: false,
            participantId,
            displayName,
            message: backfill.error ?? 'Child saved but parent link failed.',
          };
        }
      } else {
        const linkResult = await createCampStudentFamilyLink({
          studentId: participantId,
          campProgramCode,
          parentFirstName,
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
        linkId = linkResult.link?.id;
      }

      console.info('[CAMP_CHILD_ONBOARDED]', {
        participant_id: participantId,
        camp_program_code: campProgramCode,
        parent_email: parentEmail,
        parent_last_name: parentLastName,
        link_id: linkId ?? null,
        grade_level: input.gradeLevel ?? null,
      });

      if (input.gradeLevel && normalizeGradeLevelStorage(input.gradeLevel)) {
        await saveParticipantGradeLevel(participantId, normalizeGradeLevelStorage(input.gradeLevel)!);
      }

      const familyClaimUrl = access.familyClaimCode
        ? buildFamilyClaimUrl(access.familyClaimCode)
        : undefined;
      void queueWelcomeEmail({
        parentEmail,
        parentFirstName,
        familyOrProgramName: campProgramCode,
        familyAccessCode: access.familyClaimCode,
        childName: displayName,
        studentPin: access.studentPin,
        loginUrl: undefined,
        relatedStudentId: participantId,
        relatedProgramId: campProgramCode,
      });

      return {
        success: true,
        participantId,
        linkId,
        displayName,
        studentPin: access.studentPin,
        familyClaimCode: access.familyClaimCode,
        familyClaimUrl,
        parentConnectionStatus: 'invited',
        message: `${displayName} was added to camp. Parent can claim access later with the family code and ${parentEmail}.`,
      };
    }

    if (input.gradeLevel && normalizeGradeLevelStorage(input.gradeLevel)) {
      await saveParticipantGradeLevel(participantId, normalizeGradeLevelStorage(input.gradeLevel)!);
    }

    const familyClaimUrl = access.familyClaimCode ? buildFamilyClaimUrl(access.familyClaimCode) : undefined;

    console.info('[CAMP_CHILD_ONBOARDED_STUDENT_ONLY]', {
      participant_id: participantId,
      camp_program_code: campProgramCode,
      parent_connection_status: parentConnectionStatus,
      has_pin: Boolean(access.studentPin),
      has_claim_code: Boolean(access.familyClaimCode),
    });

    return {
      success: true,
      participantId,
      displayName,
      studentPin: access.studentPin,
      familyClaimCode: access.familyClaimCode,
      familyClaimUrl,
      parentConnectionStatus,
      message: `${displayName} was added. Share the student PIN for game login. Parent can connect later with the family claim link.`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not onboard child.';
    return { success: false, displayName, message };
  }
}
