import { recordToActivePilotProgram } from '../config/activePilotProgram';
import { DASHBOARD_FETCH_TIMEOUT_MS, withTimeout } from './fetchWithTimeout';
import {
  activatePrivateFamilyPortalFromClaim,
  createOrResolveFamilyProgramForParent,
} from './parentClaimFamilyPortalService';
import {
  backfillStudentFamilyLinkParentContact,
  createCampStudentFamilyLink,
  fetchParticipantsByIds,
  fetchStudentFamilyLinksByCampProgram,
  markStudentFamilyLinksClaimed,
} from './studentFamilyLinkService';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import type { PilotProgramRecord } from '../types/pilotProgram';
import { setActiveChild } from './activeChildContext';
import { trackKitParentSignup } from './kitIntegration';
import { resolveStudentDisplayNameOrFallback, isPlaceholderParentName } from './studentDisplayName';
import { buildFamilyClaimUrl } from './familyClaimCode';
import { queueWelcomeEmail } from './welcomeEmailService';

export type FamilyClaimByCodeLookup = {
  participantId: string;
  childDisplayName: string;
  programCode: string;
  programName?: string;
  parentConnectionStatus: string;
  alreadyClaimed: boolean;
  invitedParentEmail?: string;
  parentFirstName?: string;
  parentLastName?: string;
  parentPhone?: string;
};

export type FamilyClaimByCodeResult = {
  success: boolean;
  message: string;
  familyProgramCode?: string;
  participantId?: string;
  welcomeEmailSkipped?: boolean;
};

export async function lookupStudentByFamilyClaimCode(
  claimCode: string,
): Promise<{ student?: FamilyClaimByCodeLookup; error?: string }> {
  const code = claimCode.trim().toUpperCase();
  if (!code) {
    return { error: 'Enter a family claim code.' };
  }

  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Service unavailable.' };
  }

  try {
    const selectColumns =
      'id, first_name, nickname, program_code, parent_connection_status, family_claim_code_used_at, family_account_id, guardian_email, guardian_phone';

    const { data, error } = await withTimeout(
      supabase
        .from('participants')
        .select(selectColumns)
        .eq('family_claim_code', code)
        .eq('role', 'student')
        .maybeSingle(),
      DASHBOARD_FETCH_TIMEOUT_MS,
      'family_claim_code_lookup',
    );

    if (error) {
      return { error: error.message };
    }
    if (!data) {
      return { error: 'Claim code not found. Check the code and try again.' };
    }

    let programName: string | undefined;
    const programCode = String(data.program_code || '').trim();
    if (programCode) {
      const { data: programRow } = await supabase
        .from('pilot_programs')
        .select('program_name')
        .eq('program_code', programCode)
        .maybeSingle();
      programName = programRow?.program_name ? String(programRow.program_name) : undefined;
    }

    let parentFirstName: string | undefined;
    let parentLastName: string | undefined;
    let parentPhone: string | undefined;
    let invitedParentEmail: string | undefined;

    const guardianEmail = String(data.guardian_email || '').trim();
    if (guardianEmail) {
      invitedParentEmail = guardianEmail;
    }
    const guardianPhone = String(data.guardian_phone || '').trim();
    if (guardianPhone) {
      parentPhone = guardianPhone;
    }

    const { data: linkRow } = await supabase
      .from('student_family_links')
      .select('parent_email, parent_first_name, parent_last_name, parent_phone')
      .eq('student_id', data.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (linkRow) {
      if (!invitedParentEmail && linkRow.parent_email?.trim()) {
        invitedParentEmail = linkRow.parent_email.trim();
      }
      if (linkRow.parent_first_name?.trim()) parentFirstName = linkRow.parent_first_name.trim();
      if (linkRow.parent_last_name?.trim() && !isPlaceholderParentName(linkRow.parent_last_name)) {
        parentLastName = linkRow.parent_last_name.trim();
      }
      if (!parentPhone && linkRow.parent_phone?.trim()) parentPhone = linkRow.parent_phone.trim();
    }

    return {
      student: {
        participantId: String(data.id),
        childDisplayName: resolveStudentDisplayNameOrFallback({
          nickname: data.nickname,
          first_name: data.first_name,
        }),
        programCode,
        programName,
        parentConnectionStatus: String(data.parent_connection_status || 'unclaimed'),
        alreadyClaimed: Boolean(data.family_claim_code_used_at || data.family_account_id),
        invitedParentEmail,
        parentFirstName,
        parentLastName,
        parentPhone,
      },
    };
  } catch {
    return { error: 'Could not look up claim code.' };
  }
}

export async function claimStudentWithFamilyClaimCode(input: {
  claimCode: string;
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone?: string;
  accessCode?: string;
}): Promise<FamilyClaimByCodeResult> {
  const claimCode = input.claimCode.trim().toUpperCase();
  const parentEmail = input.parentEmail.trim();
  const parentLastName = input.parentLastName.trim();
  const parentFirstName = input.parentFirstName.trim();

  if (!claimCode || !parentEmail) {
    return { success: false, message: 'Claim code and parent email are required.' };
  }

  const lookup = await lookupStudentByFamilyClaimCode(claimCode);
  if (lookup.error || !lookup.student) {
    return { success: false, message: lookup.error || 'Claim code not found.' };
  }

  const resolvedLastName =
    parentLastName ||
    (lookup.student.parentLastName?.trim() && !isPlaceholderParentName(lookup.student.parentLastName)
      ? lookup.student.parentLastName.trim()
      : '');
  const resolvedFirstName =
    parentFirstName || lookup.student.parentFirstName?.trim() || '';

  if (!resolvedFirstName) {
    return { success: false, message: 'Enter your first name to continue.' };
  }

  if (!resolvedLastName) {
    return { success: false, message: 'Enter your last name to continue.' };
  }

  if (lookup.student.alreadyClaimed) {
    return {
      success: false,
      message: 'This student has already been connected to a family account.',
    };
  }

  const campProgramCode = lookup.student.programCode;
  let campProgram = null;
  if (isSupabaseConfigured() && supabase && campProgramCode) {
    const { data } = await supabase
      .from('pilot_programs')
      .select('*')
      .eq('program_code', campProgramCode)
      .maybeSingle();
    if (data) {
      campProgram = recordToActivePilotProgram(data as PilotProgramRecord);
    }
  }

  const familyProgram = await createOrResolveFamilyProgramForParent({
    parentEmail,
    parentLastName: resolvedLastName,
    parentFirstName: resolvedFirstName || undefined,
    campProgram: campProgram ?? undefined,
  });

  if (!familyProgram) {
    return { success: false, message: 'Could not set up your family portal.' };
  }

  const participantId = lookup.student.participantId;
  const now = new Date().toISOString();
  const { links } = await fetchStudentFamilyLinksByCampProgram(campProgramCode);
  let link = links.find((row) => row.student_id === participantId);

  if (!link) {
    const linkResult = await createCampStudentFamilyLink({
      studentId: participantId,
      campProgramCode,
      parentFirstName: resolvedFirstName,
      parentLastName: resolvedLastName,
      parentEmail,
      parentPhone: input.parentPhone,
      relationship: 'parent',
    });

    if (!linkResult.success || !linkResult.link) {
      return {
        success: false,
        message: linkResult.error || 'Could not link student to family account.',
      };
    }
    link = linkResult.link;
  } else {
    const backfill = await backfillStudentFamilyLinkParentContact({
      linkId: link.id,
      parentEmail,
      parentFirstName: resolvedFirstName,
      parentLastName: resolvedLastName,
      parentPhone: input.parentPhone,
    });
    if (!backfill.success) {
      return {
        success: false,
        message: backfill.error ?? 'Could not save parent contact for this student.',
      };
    }
    if (backfill.link) link = backfill.link;
  }

  const claimResult = await markStudentFamilyLinksClaimed({
    linkIds: [link.id],
    familyProgramCode: familyProgram.programCode,
    parentEmail,
    parentPhone: input.parentPhone,
    parentFirstName: resolvedFirstName || undefined,
    parentLastName: resolvedLastName,
  });

  if (!claimResult.success) {
    return { success: false, message: claimResult.error ?? 'Could not complete parent claim.' };
  }

  if (isSupabaseConfigured() && supabase) {
    const { error: participantError } = await supabase
      .from('participants')
      .update({
        parent_connection_status: 'connected',
        guardian_email: parentEmail,
        guardian_phone: input.parentPhone?.trim() || null,
        family_account_id: familyProgram.id ?? null,
        family_claim_code_used_at: now,
      })
      .eq('id', participantId);

    if (participantError) {
      return { success: false, message: participantError.message };
    }
  }

  const accessCode =
    input.accessCode?.trim() ||
    familyProgram.familyAccessCode?.trim() ||
    `${familyProgram.programCode}-FAMILY`;

  activatePrivateFamilyPortalFromClaim({
    familyProgram,
    accessCode,
    parentEmail,
    parentFirstName: resolvedFirstName || undefined,
    parentPhone: input.parentPhone,
    parentLastName: resolvedLastName,
    campProgramCode: campProgramCode,
  });

  const { participants } = await fetchParticipantsByIds([participantId]);
  const child = participants[0];
  if (child) {
    setActiveChild({
      participantId: child.id,
      displayName: child.nickname?.trim() || child.first_name?.trim() || 'Player',
      firstName: child.first_name?.trim(),
    });
  }

  console.info('[FAMILY_CLAIM_BY_CODE]', {
    claim_code: claimCode,
    participant_id: participantId,
    family_program_code: familyProgram.programCode,
    parent_email: parentEmail,
  });

  const familyClaimUrl = buildFamilyClaimUrl(claimCode);
  let welcomeEmailSkipped = false;
  const emailResult = await trackKitParentSignupWithEmail({
    parentEmail,
    parentFirstName: resolvedFirstName || undefined,
    childName: lookup.student.childDisplayName,
    familyProgram,
    familyClaimUrl,
    claimCode,
    participantId,
  });
  welcomeEmailSkipped = emailResult.skipped;

  return {
    success: true,
    message: `${lookup.student.childDisplayName} is now connected to your family portal. Existing progress is preserved.`,
    familyProgramCode: familyProgram.programCode,
    participantId,
    welcomeEmailSkipped,
  };
}

async function trackKitParentSignupWithEmail(input: {
  parentEmail: string;
  parentFirstName?: string;
  childName: string;
  familyProgram: { programCode: string; programName?: string; familyAccessCode?: string };
  familyClaimUrl: string;
  claimCode: string;
  participantId: string;
}): Promise<{ skipped: boolean }> {
  trackKitParentSignup({
    parentEmail: input.parentEmail,
    eventName: 'parent_claim_by_code',
    metadata: {
      participant_id: input.participantId,
      family_program_code: input.familyProgram.programCode,
      claim_code: input.claimCode,
    },
  });

  const emailResult = await queueWelcomeEmail({
    parentEmail: input.parentEmail,
    parentFirstName: input.parentFirstName,
    familyOrProgramName: input.familyProgram.programName ?? input.familyProgram.programCode,
    familyAccessCode: input.claimCode,
    childName: input.childName,
    loginUrl: input.familyClaimUrl,
    templateType: 'camp_parent',
    programType: 'Camp / Youth Program',
    recipientRole: 'parent_guardian',
    deliveryEventKey: `participant:${input.participantId}:parent-welcome`,
    relatedStudentId: input.participantId,
    relatedProgramId: input.familyProgram.programCode,
  });

  console.info('[FAMILY_CLAIM_EMAIL]', {
    provider: emailResult.provider,
    recipient_email: input.parentEmail,
    success: emailResult.success,
    skipped: emailResult.skipped,
    reason: emailResult.reason ?? null,
  });

  return { skipped: emailResult.skipped };
}
