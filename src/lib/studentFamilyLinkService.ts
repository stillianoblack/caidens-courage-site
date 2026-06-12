import { hasConfirmedParentClaim, readParentClaimContext } from '../config/parentClaimContext';
import { hydrateExistingFamilyChildren } from './hydrateExistingFamilyChildren';
import { DASHBOARD_FETCH_TIMEOUT_MS, withTimeout } from './fetchWithTimeout';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import { isValidSupabaseParticipantId, type StudentParticipantRecord } from './pilotTrackingService';

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
    const selectWithGrade =
      'id, nickname, first_name, role, program_code, created_at, grade_level, grade_band, allow_stretch_level';
    const selectBase = 'id, nickname, first_name, role, program_code, created_at';

    const primary = await supabase
      .from('participants')
      .select(selectWithGrade)
      .in('id', participantIds)
      .eq('role', 'student');

    let participants: StudentParticipantRecord[] = (primary.data ?? []) as StudentParticipantRecord[];
    let fetchError = primary.error;

    if (fetchError && /grade_level|grade_band|allow_stretch_level|column.*does not exist|42703/i.test(fetchError.message)) {
      const fallback = await supabase
        .from('participants')
        .select(selectBase)
        .in('id', participantIds)
        .eq('role', 'student');
      participants = (fallback.data ?? []) as StudentParticipantRecord[];
      fetchError = fallback.error;
    }

    if (fetchError) {
      return { participants: [], error: fetchError.message };
    }

    return { participants };
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

/** Family portal children: hydrated from links + program participants (deduped). */
export async function resolveFamilyVisibleChildren(
  familyProgramCode: string,
  parentScope?: ParentLinkScope,
): Promise<FamilyVisibleChildrenResult> {
  const code = familyProgramCode.trim();
  const claimContext = readParentClaimContext();
  const scope = parentScope ?? claimContext ?? undefined;
  const hydration = await hydrateExistingFamilyChildren(code, scope);

  if (hydration.claimRequired) {
    console.info('[FAMILY_CLAIM_REQUIRED]', {
      family_program_code: code,
      reason: 'missing_or_unconfirmed_parent_claim',
      linked_child_count: hydration.linkedChildCount,
      fallback_child_count: hydration.fallbackChildCount,
    });
  } else {
    console.info('[FAMILY_CLAIM_MATCH]', {
      family_program_code: code,
      parent_scope: {
        email: scope?.email ?? null,
        phone: scope?.phone ? '***' : null,
        last_name: scope?.lastName ?? null,
      },
      matched_link_count: hydration.scopedLinks.length,
      student_ids: hydration.scopedLinks.map((row) => row.student_id),
      linked_child_count: hydration.linkedChildCount,
      fallback_child_count: hydration.fallbackChildCount,
    });

    console.info('[FAMILY_VISIBLE_CHILDREN]', {
      family_program_code: code,
      claim_required: false,
      allowed_student_ids: hydration.allowedStudentIds,
      children: hydration.visibleChildren.map((child) => ({
        student_id: child.studentId,
        display_name: child.displayName,
        source: child.source,
      })),
    });
  }

  return {
    familyProgramCode: code,
    participants: hydration.participants,
    links: hydration.scopedLinks,
    children: hydration.visibleChildren,
    allowedStudentIds: hydration.allowedStudentIds,
    errors: hydration.errors,
    claimRequired: hydration.claimRequired,
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

/** Link a newly added family child to camp roster visibility when parent has claimed camp links. */
export async function ensureFamilyChildLink(input: {
  studentId: string;
  familyProgramCode: string;
}): Promise<{ linked: boolean; error?: string }> {
  const studentId = input.studentId.trim();
  const familyProgramCode = input.familyProgramCode.trim();
  if (!studentId || !familyProgramCode) {
    return { linked: false, error: 'Missing student or program code.' };
  }

  const { links, error: fetchError } = await fetchStudentFamilyLinksByFamilyProgram(familyProgramCode);
  if (fetchError) {
    return { linked: false, error: fetchError };
  }

  if (links.some((link) => link.student_id === studentId)) {
    return { linked: true };
  }

  const template = links.find((link) => link.camp_program_code?.trim()) ?? links[0];
  const campProgramCode = template?.camp_program_code?.trim() || familyProgramCode;
  const parentClaim = readParentClaimContext();

  const result = await createStudentFamilyLink({
    studentId,
    campProgramCode,
    familyProgramCode,
    parentEmail: parentClaim?.email || template?.parent_email || undefined,
    parentLastName: parentClaim?.lastName || template?.parent_last_name || undefined,
    parentFirstName: template?.parent_first_name || undefined,
    relationship: 'parent',
  });

  if (!result.success || !result.link) {
    return { linked: false, error: result.error };
  }

  if (hasConfirmedParentClaim(parentClaim)) {
    await markStudentFamilyLinksClaimed({
      linkIds: [result.link.id],
      familyProgramCode,
      parentEmail: parentClaim?.email || template?.parent_email || '',
      parentPhone: parentClaim?.phone,
      parentLastName: parentClaim?.lastName || template?.parent_last_name || undefined,
    });
  }

  return { linked: true };
}
