import type { ActivePilotProgram } from '../types/pilotProgram';
import { isIndependentFamilyProgram } from './independentFamilyProgram';
import {
  activatePrivateFamilyPortalFromClaim,
  createOrResolveFamilyProgramForParent,
} from './parentClaimFamilyPortalService';
import {
  fetchParticipantsByIds,
  fetchStudentFamilyLinksByCampProgram,
  fetchStudentFamilyLinksByFamilyProgram,
  markStudentFamilyLinksClaimed,
  repairCampParentLinksForClaim,
  type StudentFamilyLink,
} from './studentFamilyLinkService';
import { fetchStudentParticipantsFromSupabase } from './pilotTrackingService';
import { setActiveChild } from './activeChildContext';
import { trackKitParentSignup } from './kitIntegration';

export type ParentLookupInput = {
  campProgramCode?: string;
  familyProgramCode?: string;
  parentEmail?: string;
  parentPhone?: string;
  parentLastName?: string;
};

export type ParentLookupMatch = {
  link: StudentFamilyLink;
  childDisplayName?: string;
};

export type ParentLookupResult = {
  matches: ParentLookupMatch[];
  needsLastNameConfirm: boolean;
  lookupSource: 'email' | 'phone' | 'none';
};

function normalizeEmail(value?: string | null): string {
  return value?.trim().toLowerCase() ?? '';
}

function normalizePhone(value?: string | null): string {
  return value?.replace(/\D/g, '') ?? '';
}

function normalizeLastName(value?: string | null): string {
  return value?.trim().toLowerCase() ?? '';
}

type ParentClaimLookupDiagnostics = {
  accessCode: string;
  parentEmail: string;
  campProgramCode?: string;
  familyProgramCode?: string;
  candidateLinkCount: number;
  candidateStudentIds: string[];
  linksMissingParentEmail: Array<{ linkId: string; studentId: string }>;
  orphanParticipantIds: string[];
  repairAttempt?: string;
};

async function buildParentClaimLookupDiagnostics(input: {
  accessCode: string;
  parentEmail: string;
  campProgramCode?: string;
  familyProgramCode?: string;
}): Promise<ParentClaimLookupDiagnostics> {
  const email = normalizeEmail(input.parentEmail);
  let links: StudentFamilyLink[] = [];

  if (input.familyProgramCode?.trim()) {
    const payload = await fetchStudentFamilyLinksByFamilyProgram(input.familyProgramCode.trim());
    links = payload.links;
  } else if (input.campProgramCode?.trim()) {
    const payload = await fetchStudentFamilyLinksByCampProgram(input.campProgramCode.trim());
    links = payload.links;
  }

  const linkedStudentIds = new Set(links.map((link) => link.student_id?.trim()).filter(Boolean));
  let orphanParticipantIds: string[] = [];

  if (input.campProgramCode?.trim()) {
    const { participants } = await fetchStudentParticipantsFromSupabase(input.campProgramCode.trim());
    orphanParticipantIds = participants
      .filter((row) => !linkedStudentIds.has(row.id))
      .map((row) => row.id);
  }

  const linksMissingParentEmail = links
    .filter((link) => !normalizeEmail(link.parent_email))
    .map((link) => ({ linkId: link.id, studentId: link.student_id }));

  return {
    accessCode: input.accessCode.trim(),
    parentEmail: email,
    campProgramCode: input.campProgramCode ?? undefined,
    familyProgramCode: input.familyProgramCode ?? undefined,
    candidateLinkCount: links.length,
    candidateStudentIds: links.map((link) => link.student_id),
    linksMissingParentEmail,
    orphanParticipantIds,
  };
}

function logParentClaimLookupFailure(
  diagnostics: ParentClaimLookupDiagnostics,
  repairAttempt?: string,
): void {
  console.warn('[PARENT_CLAIM_LOOKUP_FAILED]', {
    access_code: diagnostics.accessCode,
    parent_email: diagnostics.parentEmail,
    camp_program_code: diagnostics.campProgramCode ?? null,
    family_program_code: diagnostics.familyProgramCode ?? null,
    candidate_link_count: diagnostics.candidateLinkCount,
    candidate_student_ids: diagnostics.candidateStudentIds,
    links_missing_parent_email: diagnostics.linksMissingParentEmail,
    orphan_participant_ids: diagnostics.orphanParticipantIds,
    repair_attempt: repairAttempt ?? null,
  });
}

export async function lookupParentChildLinks(
  input: ParentLookupInput,
): Promise<ParentLookupResult> {
  const email = normalizeEmail(input.parentEmail);
  const phone = normalizePhone(input.parentPhone);

  let links: StudentFamilyLink[] = [];

  if (input.familyProgramCode?.trim()) {
    const payload = await fetchStudentFamilyLinksByFamilyProgram(input.familyProgramCode.trim());
    links = payload.links;
  } else if (input.campProgramCode?.trim()) {
    const payload = await fetchStudentFamilyLinksByCampProgram(input.campProgramCode.trim());
    links = payload.links;
  }

  let lookupSource: ParentLookupResult['lookupSource'] = 'none';
  let matches = links.filter((link) => normalizeEmail(link.parent_email) === email);
  if (email) {
    console.info('[PARENT_LOOKUP_EMAIL]', {
      email,
      camp_program_code: input.campProgramCode ?? null,
      family_program_code: input.familyProgramCode ?? null,
      candidate_count: links.length,
      match_count: matches.length,
    });
    if (matches.length) lookupSource = 'email';
  }

  if (!matches.length && phone) {
    matches = links.filter((link) => normalizePhone(link.parent_phone) === phone);
    console.info('[PARENT_LOOKUP_PHONE]', {
      phone,
      camp_program_code: input.campProgramCode ?? null,
      family_program_code: input.familyProgramCode ?? null,
      candidate_count: links.length,
      match_count: matches.length,
    });
    if (matches.length) lookupSource = 'phone';
  }

  const parentLastName = normalizeLastName(input.parentLastName);
  const distinctLastNames = new Set(
    matches.map((link) => normalizeLastName(link.parent_last_name)).filter(Boolean),
  );
  const needsLastNameConfirm =
    matches.length > 1 && distinctLastNames.size > 1 && !parentLastName;

  if (parentLastName && matches.length > 1) {
    const narrowed = matches.filter(
      (link) => normalizeLastName(link.parent_last_name) === parentLastName,
    );
    if (narrowed.length) {
      console.info('[PARENT_LASTNAME_CONFIRM]', {
        parent_last_name: input.parentLastName,
        before_count: matches.length,
        after_count: narrowed.length,
      });
      matches = narrowed;
    }
  }

  if (matches.length) {
    console.info('[PARENT_MATCH_FOUND]', {
      lookup_source: lookupSource,
      match_count: matches.length,
      student_ids: matches.map((row) => row.student_id),
      needs_last_name_confirm: needsLastNameConfirm,
    });
    matches.forEach((link) => {
      console.info('[CHILD_LINK_FOUND]', {
        student_id: link.student_id,
        camp_program_code: link.camp_program_code,
        family_program_code: link.family_program_code,
        parent_email: link.parent_email,
        parent_claimed: link.parent_claimed,
      });
    });
  }

  return {
    matches: matches.map((link) => ({ link })),
    needsLastNameConfirm,
    lookupSource,
  };
}

export async function claimParentFamilyPortal(input: {
  program: ActivePilotProgram;
  parentEmail: string;
  parentPhone?: string;
  parentLastName?: string;
  accessCode: string;
}): Promise<{
  success: boolean;
  message?: string;
  needsLastNameConfirm?: boolean;
  familyProgram?: ActivePilotProgram;
  matchedStudentIds?: string[];
}> {
  const email = input.parentEmail.trim();
  if (!email) {
    return { success: false, message: 'Parent/Guardian email is required.' };
  }

  if (isIndependentFamilyProgram(input.program)) {
    console.error('[CAMP_PARENT_CLAIM_BLOCKED]', {
      reason: 'independent_family_program',
      program_code: input.program.programCode,
      access_code: input.accessCode.trim(),
      parent_email: normalizeEmail(email),
    });
    return {
      success: false,
      message:
        'This code is for an independent family account. Use your signup email to open your family portal.',
    };
  }

  const campProgramCode = input.program.programCode;

  let lookup = await lookupParentChildLinks({
    campProgramCode,
    parentEmail: email,
    parentPhone: input.parentPhone,
    parentLastName: input.parentLastName,
  });

  if (!lookup.matches.length && campProgramCode) {
    const repair = await repairCampParentLinksForClaim({
      campProgramCode,
      parentEmail: email,
      parentPhone: input.parentPhone,
      parentLastName: input.parentLastName,
    });

    if (repair.repaired) {
      console.info('[PARENT_CLAIM_REPAIR]', {
        access_code: input.accessCode.trim(),
        parent_email: email,
        camp_program_code: campProgramCode,
        reason: repair.reason,
        link_ids: repair.linkIds ?? [],
        student_ids: repair.studentIds ?? [],
      });
      lookup = await lookupParentChildLinks({
        campProgramCode,
        parentEmail: email,
        parentPhone: input.parentPhone,
        parentLastName: input.parentLastName,
      });
    } else if (repair.reason && repair.reason !== 'no_repair_candidate') {
      console.info('[PARENT_CLAIM_REPAIR_SKIPPED]', {
        access_code: input.accessCode.trim(),
        parent_email: email,
        camp_program_code: campProgramCode,
        reason: repair.reason,
        link_ids: repair.linkIds ?? [],
        student_ids: repair.studentIds ?? [],
      });
    }
  }

  if (lookup.needsLastNameConfirm) {
    return {
      success: false,
      needsLastNameConfirm: true,
      message: 'Multiple children matched. Enter your last name to continue.',
    };
  }

  if (!lookup.matches.length) {
    const diagnostics = await buildParentClaimLookupDiagnostics({
      accessCode: input.accessCode,
      parentEmail: email,
      campProgramCode,
    });
    logParentClaimLookupFailure(diagnostics);

    return {
      success: false,
      message:
        'No children are linked to that email for this program. Ask your camp facilitator to confirm your contact info.',
    };
  }

  const familyProgram = await createOrResolveFamilyProgramForParent({
    parentEmail: email,
    parentLastName:
      input.parentLastName?.trim() ||
      lookup.matches[0]?.link.parent_last_name ||
      'Family',
    parentFirstName: lookup.matches[0]?.link.parent_first_name || undefined,
    campProgram: input.program,
    existingFamilyProgramCode: lookup.matches.find((row) => row.link.family_program_code)?.link
      .family_program_code,
  });

  if (!familyProgram) {
    return { success: false, message: 'Could not set up your family portal.' };
  }

  const linkIds = lookup.matches.map((row) => row.link.id);
  const claimResult = await markStudentFamilyLinksClaimed({
    linkIds,
    familyProgramCode: familyProgram.programCode,
    parentEmail: email,
    parentPhone: input.parentPhone,
    parentLastName: input.parentLastName,
  });

  if (!claimResult.success) {
    return { success: false, message: claimResult.error ?? 'Could not complete parent claim.' };
  }

  activatePrivateFamilyPortalFromClaim({
    familyProgram,
    accessCode: input.accessCode,
    parentEmail: email,
    parentPhone: input.parentPhone,
    parentLastName: input.parentLastName,
  });

  const matchedStudentIds = lookup.matches.map((row) => row.link.student_id);
  if (matchedStudentIds.length >= 1) {
    const { participants } = await fetchParticipantsByIds(matchedStudentIds);
    const first = participants[0];
    if (first) {
      setActiveChild({
        participantId: first.id,
        displayName: first.nickname?.trim() || first.first_name?.trim() || 'Player',
        firstName: first.first_name?.trim(),
      });
    }
  }

  console.info('[PARENT_CLAIMED]', {
    parent_email: email,
    family_program_code: familyProgram.programCode,
    matched_student_ids: matchedStudentIds,
    link_count: linkIds.length,
  });

  trackKitParentSignup({
    parentEmail: email,
    eventName: 'parent_claim',
    metadata: {
      family_program_code: familyProgram.programCode,
      matched_student_count: matchedStudentIds.length,
    },
  });

  return {
    success: true,
    familyProgram,
    matchedStudentIds,
    message:
      matchedStudentIds.length === 1
        ? 'Your child is ready in your private family portal.'
        : `${matchedStudentIds.length} children are linked to your family portal.`,
  };
}
