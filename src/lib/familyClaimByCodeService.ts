import { recordToActivePilotProgram } from '../config/activePilotProgram';
import { DASHBOARD_FETCH_TIMEOUT_MS, withTimeout } from './fetchWithTimeout';
import {
  activatePrivateFamilyPortalFromClaim,
  createOrResolveFamilyProgramForParent,
} from './parentClaimFamilyPortalService';
import {
  createCampStudentFamilyLink,
  fetchParticipantsByIds,
  fetchStudentFamilyLinksByCampProgram,
  markStudentFamilyLinksClaimed,
} from './studentFamilyLinkService';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import type { PilotProgramRecord } from '../types/pilotProgram';
import { setActiveChild } from './activeChildContext';
import { trackKitParentSignup } from './kitIntegration';

export type FamilyClaimByCodeLookup = {
  participantId: string;
  childDisplayName: string;
  programCode: string;
  programName?: string;
  parentConnectionStatus: string;
  alreadyClaimed: boolean;
};

export type FamilyClaimByCodeResult = {
  success: boolean;
  message: string;
  familyProgramCode?: string;
  participantId?: string;
};

function childDisplayName(firstName?: string | null, nickname?: string | null): string {
  return nickname?.trim() || firstName?.trim() || 'Child';
}

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
    const { data, error } = await withTimeout(
      supabase
        .from('participants')
        .select(
          'id, first_name, nickname, program_code, parent_connection_status, family_claim_code_used_at, family_account_id',
        )
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

    return {
      student: {
        participantId: String(data.id),
        childDisplayName: childDisplayName(data.first_name, data.nickname),
        programCode,
        programName,
        parentConnectionStatus: String(data.parent_connection_status || 'unclaimed'),
        alreadyClaimed: Boolean(data.family_claim_code_used_at || data.family_account_id),
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

  if (!claimCode || !parentEmail || !parentLastName || !parentFirstName) {
    return { success: false, message: 'Claim code, parent name, and email are required.' };
  }

  const lookup = await lookupStudentByFamilyClaimCode(claimCode);
  if (lookup.error || !lookup.student) {
    return { success: false, message: lookup.error || 'Claim code not found.' };
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
    parentLastName,
    parentFirstName,
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
      parentFirstName,
      parentLastName,
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
  }

  const claimResult = await markStudentFamilyLinksClaimed({
    linkIds: [link.id],
    familyProgramCode: familyProgram.programCode,
    parentEmail,
    parentPhone: input.parentPhone,
    parentLastName,
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
    parentPhone: input.parentPhone,
    parentLastName,
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

  trackKitParentSignup({
    parentEmail,
    eventName: 'parent_claim_by_code',
    metadata: {
      participant_id: participantId,
      family_program_code: familyProgram.programCode,
    },
  });

  return {
    success: true,
    message: `${lookup.student.childDisplayName} is now connected to your family portal. Existing progress is preserved.`,
    familyProgramCode: familyProgram.programCode,
    participantId,
  };
}
