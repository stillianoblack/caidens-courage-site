import { hasConfirmedParentClaim, readParentClaimContext } from '../config/parentClaimContext';
import { DASHBOARD_FETCH_TIMEOUT_MS, withTimeout } from './fetchWithTimeout';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import {
  fetchStudentParticipantsFromSupabase,
  isValidSupabaseParticipantId,
  type StudentParticipantRecord,
} from './pilotTrackingService';

export type StudentFamilyLink = {
  id: string;
  student_id: string;
  camp_program_code: string;
  family_program_code: string | null;
  parent_first_name: string | null;
  parent_email: string | null;
  parent_last_name: string | null;
  parent_phone: string | null;
  relationship: string | null;
  parent_claimed: boolean;
  claimed_at: string | null;
  created_at: string;
};

export type ParentLinkScope = {
  email?: string;
  phone?: string;
  lastName?: string;
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

export function linkMatchesParentScope(link: StudentFamilyLink, scope?: ParentLinkScope): boolean {
  if (!scope) return false;

  const email = normalizeEmail(scope.email);
  const phone = normalizePhone(scope.phone);
  const lastName = normalizeLastName(scope.lastName);

  if (!email && !phone) return false;

  const emailMatch = email && normalizeEmail(link.parent_email) === email;
  const phoneMatch = phone && normalizePhone(link.parent_phone) === phone;

  if (!emailMatch && !phoneMatch) return false;

  if (lastName && link.parent_last_name) {
    return normalizeLastName(link.parent_last_name) === lastName;
  }

  return true;
}

export type FamilyVisibleChild = {
  studentId: string;
  displayName: string;
  source: 'family_participant' | 'camp_link';
  campProgramCode?: string;
};

export type FamilyVisibleChildrenResult = {
  familyProgramCode: string;
  participants: StudentParticipantRecord[];
  links: StudentFamilyLink[];
  children: FamilyVisibleChild[];
  allowedStudentIds: string[];
  errors: string[];
  claimRequired: boolean;
};

function isPrivateFamilyProgramCode(programCode: string): boolean {
  return programCode.trim().toUpperCase().startsWith('FAMILY-');
}

function childDisplayName(participant: Pick<StudentParticipantRecord, 'nickname' | 'first_name'>): string {
  return participant.nickname?.trim() || participant.first_name?.trim() || 'Child';
}

function slugifyToken(value: string): string {
  const slug = value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '');
  return slug || 'FAMILY';
}

/** Suggested independent family program code when linking from camp. */
export function suggestFamilyProgramCode(input: {
  parentLastName?: string;
  studentFirstName?: string;
  year?: number;
}): string {
  const year = input.year ?? new Date().getFullYear();
  const token = slugifyToken(input.parentLastName || input.studentFirstName || 'FAMILY');
  return `FAMILY-${token}-${year}`;
}

export async function fetchStudentFamilyLinksByFamilyProgram(
  familyProgramCode: string,
): Promise<{ links: StudentFamilyLink[]; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { links: [], error: 'missing_env' };
  }

  try {
    const { data, error } = await withTimeout(
      supabase
        .from('student_family_links')
        .select('*')
        .eq('family_program_code', familyProgramCode.trim())
        .order('created_at', { ascending: true }),
      DASHBOARD_FETCH_TIMEOUT_MS,
      'student_family_links_by_family',
    );

    if (error) {
      return { links: [], error: error.message };
    }

    return { links: (data ?? []) as StudentFamilyLink[] };
  } catch {
    return { links: [], error: 'fetch_failed' };
  }
}

export async function fetchStudentFamilyLinksByCampProgram(
  campProgramCode: string,
): Promise<{ links: StudentFamilyLink[]; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { links: [], error: 'missing_env' };
  }

  try {
    const { data, error } = await withTimeout(
      supabase
        .from('student_family_links')
        .select('*')
        .eq('camp_program_code', campProgramCode.trim())
        .order('created_at', { ascending: true }),
      DASHBOARD_FETCH_TIMEOUT_MS,
      'student_family_links_by_camp',
    );

    if (error) {
      return { links: [], error: error.message };
    }

    return { links: (data ?? []) as StudentFamilyLink[] };
  } catch {
    return { links: [], error: 'fetch_failed' };
  }
}

export async function fetchParticipantsByIds(
  participantIds: string[],
): Promise<{ participants: StudentParticipantRecord[]; error?: string }> {
  if (!participantIds.length) {
    return { participants: [] };
  }

  if (!isSupabaseConfigured() || !supabase) {
    return { participants: [], error: 'missing_env' };
  }

  try {
    const { data, error } = await withTimeout(
      supabase
        .from('participants')
        .select('id, nickname, first_name, role, program_code, created_at')
        .in('id', participantIds)
        .eq('role', 'student'),
      DASHBOARD_FETCH_TIMEOUT_MS,
      'participants_by_ids',
    );

    if (error) {
      return { participants: [], error: error.message };
    }

    return { participants: (data ?? []) as StudentParticipantRecord[] };
  } catch {
    return { participants: [], error: 'fetch_failed' };
  }
}

export async function createCampStudentFamilyLink(input: {
  studentId: string;
  campProgramCode: string;
  parentFirstName?: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone?: string;
  relationship?: string;
}): Promise<{ success: boolean; link?: StudentFamilyLink; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase is not configured.' };
  }

  const studentId = input.studentId.trim();
  if (!isValidSupabaseParticipantId(studentId)) {
    console.warn('[CAMP_CHILD_LINK_INSERT_START]', {
      blocked: true,
      student_id: studentId,
      reason: 'invalid_participant_id',
    });
    return {
      success: false,
      error: 'Invalid participant id. Camp child must be saved to Supabase before linking.',
    };
  }

  console.info('[CAMP_CHILD_LINK_INSERT_START]', {
    student_id: studentId,
    camp_program_code: input.campProgramCode.trim(),
    parent_email: input.parentEmail.trim(),
  });

  const payload = {
    student_id: studentId,
    camp_program_code: input.campProgramCode.trim(),
    family_program_code: null,
    parent_first_name: input.parentFirstName?.trim() || null,
    parent_email: input.parentEmail.trim(),
    parent_last_name: input.parentLastName.trim(),
    parent_phone: input.parentPhone?.trim() || null,
    relationship: input.relationship?.trim() || 'parent',
    parent_claimed: false,
  };

  try {
    const { data, error } = await withTimeout(
      supabase.from('student_family_links').insert(payload).select('*').single(),
      DASHBOARD_FETCH_TIMEOUT_MS,
      'camp_student_family_link_insert',
    );

    if (error) {
      return { success: false, error: error.message };
    }

    const link = data as StudentFamilyLink;
    console.info('[CAMP_CHILD_LINK_INSERT_SUCCESS]', {
      link_id: link.id,
      student_id: link.student_id,
      camp_program_code: link.camp_program_code,
      parent_email: link.parent_email,
      parent_claimed: link.parent_claimed,
    });
    return { success: true, link };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not create camp parent link.';
    return { success: false, error: message };
  }
}

export async function markStudentFamilyLinksClaimed(input: {
  linkIds: string[];
  familyProgramCode: string;
  parentEmail: string;
  parentPhone?: string;
  parentLastName?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!input.linkIds.length) {
    return { success: false, error: 'No links to claim.' };
  }

  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase is not configured.' };
  }

  const claimedAt = new Date().toISOString();
  const payload = {
    family_program_code: input.familyProgramCode.trim(),
    parent_email: input.parentEmail.trim(),
    parent_phone: input.parentPhone?.trim() || null,
    parent_last_name: input.parentLastName?.trim() || null,
    parent_claimed: true,
    claimed_at: claimedAt,
  };

  try {
    const { error } = await withTimeout(
      supabase.from('student_family_links').update(payload).in('id', input.linkIds),
      DASHBOARD_FETCH_TIMEOUT_MS,
      'student_family_links_claim',
    );

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not mark links claimed.';
    return { success: false, error: message };
  }
}

export async function createStudentFamilyLink(input: {
  studentId: string;
  campProgramCode: string;
  familyProgramCode: string;
  parentFirstName?: string;
  parentEmail?: string;
  parentLastName?: string;
  parentPhone?: string;
  relationship?: string;
}): Promise<{ success: boolean; link?: StudentFamilyLink; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase is not configured.' };
  }

  const payload = {
    student_id: input.studentId.trim(),
    camp_program_code: input.campProgramCode.trim(),
    family_program_code: input.familyProgramCode.trim(),
    parent_first_name: input.parentFirstName?.trim() || null,
    parent_email: input.parentEmail?.trim() || null,
    parent_last_name: input.parentLastName?.trim() || null,
    parent_phone: input.parentPhone?.trim() || null,
    relationship: input.relationship?.trim() || null,
    parent_claimed: false,
  };

  try {
    const { data, error } = await withTimeout(
      supabase.from('student_family_links').insert(payload).select('*').single(),
      DASHBOARD_FETCH_TIMEOUT_MS,
      'student_family_link_insert',
    );

    if (error) {
      console.warn('[CAMP_PARENT_LINK]', { action: 'insert_failed', error: error.message, payload });
      return { success: false, error: error.message };
    }

    const link = data as StudentFamilyLink;
    console.info('[CAMP_PARENT_LINK]', {
      action: 'linked',
      student_id: link.student_id,
      camp_program_code: link.camp_program_code,
      family_program_code: link.family_program_code,
      parent_last_name: link.parent_last_name,
    });
    return { success: true, link };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not create family link.';
    console.warn('[CAMP_PARENT_LINK]', { action: 'insert_failed', error: message, payload });
    return { success: false, error: message };
  }
}

/** Family portal children: only parent/guardian-claimed links, never a full camp roster. */
export async function resolveFamilyVisibleChildren(
  familyProgramCode: string,
  parentScope?: ParentLinkScope,
): Promise<FamilyVisibleChildrenResult> {
  const code = familyProgramCode.trim();
  const claimContext = readParentClaimContext();
  const scope = parentScope ?? claimContext ?? undefined;
  const errors: string[] = [];
  const emptyResult = (claimRequired: boolean): FamilyVisibleChildrenResult => ({
    familyProgramCode: code,
    participants: [],
    links: [],
    children: [],
    allowedStudentIds: [],
    errors,
    claimRequired,
  });

  if (!code) {
    return {
      ...emptyResult(true),
      familyProgramCode: '',
      errors: ['Missing active program context.'],
    };
  }

  if (!hasConfirmedParentClaim(claimContext)) {
    console.info('[FAMILY_CLAIM_REQUIRED]', {
      family_program_code: code,
      reason: 'missing_or_unconfirmed_parent_claim',
    });
    return {
      ...emptyResult(true),
      errors: ['Enter Parent/Guardian Email to Find Your Child.'],
    };
  }

  const isPrivateFamily = isPrivateFamilyProgramCode(code);
  const linksPayload = await fetchStudentFamilyLinksByFamilyProgram(code);
  if (linksPayload.error) errors.push(linksPayload.error);

  const scopedLinks = linksPayload.links.filter((link) => linkMatchesParentScope(link, scope));

  console.info('[FAMILY_CLAIM_MATCH]', {
    family_program_code: code,
    parent_scope: {
      email: scope?.email ?? null,
      phone: scope?.phone ? '***' : null,
      last_name: scope?.lastName ?? null,
    },
    matched_link_count: scopedLinks.length,
    student_ids: scopedLinks.map((row) => row.student_id),
  });

  const familyParticipantsPayload = isPrivateFamily
    ? await fetchStudentParticipantsFromSupabase(code)
    : { participants: [] as StudentParticipantRecord[], error: undefined };
  if (familyParticipantsPayload.error) errors.push(familyParticipantsPayload.error);

  const familyParticipants = familyParticipantsPayload.participants;
  const links = scopedLinks;
  const linkedIds = links.map((row) => row.student_id).filter(Boolean);
  const useLinkOnlyVisibility = !isPrivateFamily || links.length > 0;

  const participantIdsToFetch = new Set<string>(linkedIds);
  if (!useLinkOnlyVisibility) {
    for (const participant of familyParticipants) {
      participantIdsToFetch.add(participant.id);
    }
  }

  const missingLinkedIds = Array.from(participantIdsToFetch).filter(
    (id) => !familyParticipants.some((participant) => participant.id === id),
  );

  const linkedParticipantsPayload = missingLinkedIds.length
    ? await fetchParticipantsByIds(missingLinkedIds)
    : { participants: [] as StudentParticipantRecord[] };
  if (linkedParticipantsPayload.error) errors.push(linkedParticipantsPayload.error);

  const participantById = new Map<string, StudentParticipantRecord>();
  for (const participant of [...familyParticipants, ...linkedParticipantsPayload.participants]) {
    participantById.set(participant.id, participant);
  }

  const children: FamilyVisibleChild[] = [];
  const allowed = new Set<string>();

  if (!useLinkOnlyVisibility) {
    for (const participant of familyParticipants) {
      allowed.add(participant.id);
      children.push({
        studentId: participant.id,
        displayName: childDisplayName(participant),
        source: 'family_participant',
      });
    }
  }

  for (const link of links) {
    allowed.add(link.student_id);
    if (children.some((child) => child.studentId === link.student_id)) {
      continue;
    }
    const participant = participantById.get(link.student_id);
    children.push({
      studentId: link.student_id,
      displayName: participant ? childDisplayName(participant) : 'Linked Child',
      source: 'camp_link',
      campProgramCode: link.camp_program_code,
    });
  }

  const sortedChildren = children.sort((a, b) => a.displayName.localeCompare(b.displayName));
  const allowedStudentIds = Array.from(allowed);

  console.info('[FAMILY_VISIBLE_CHILDREN]', {
    family_program_code: code,
    claim_required: false,
    allowed_student_ids: allowedStudentIds,
    children: sortedChildren.map((child) => ({
      student_id: child.studentId,
      display_name: child.displayName,
      source: child.source,
    })),
  });

  return {
    familyProgramCode: code,
    participants: familyParticipants,
    links,
    children: sortedChildren,
    allowedStudentIds,
    errors,
    claimRequired: false,
  };
}

export function isStudentVisibleToFamily(
  participantId: string | null | undefined,
  allowedStudentIds: string[],
): boolean {
  const id = participantId?.trim();
  if (!id || !allowedStudentIds.length) return false;
  return allowedStudentIds.includes(id);
}
