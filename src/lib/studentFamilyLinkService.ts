import { DASHBOARD_FETCH_TIMEOUT_MS, withTimeout } from './fetchWithTimeout';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import {
  fetchStudentParticipantsFromSupabase,
  type StudentParticipantRecord,
} from './pilotTrackingService';

export type StudentFamilyLink = {
  id: string;
  student_id: string;
  camp_program_code: string;
  family_program_code: string;
  parent_email: string | null;
  parent_last_name: string | null;
  relationship: string | null;
  created_at: string;
};

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
};

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

export async function createStudentFamilyLink(input: {
  studentId: string;
  campProgramCode: string;
  familyProgramCode: string;
  parentEmail?: string;
  parentLastName?: string;
  relationship?: string;
}): Promise<{ success: boolean; link?: StudentFamilyLink; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase is not configured.' };
  }

  const payload = {
    student_id: input.studentId.trim(),
    camp_program_code: input.campProgramCode.trim(),
    family_program_code: input.familyProgramCode.trim(),
    parent_email: input.parentEmail?.trim() || null,
    parent_last_name: input.parentLastName?.trim() || null,
    relationship: input.relationship?.trim() || null,
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

/** Family portal children: direct family participants + camp students linked to this family program. */
export async function resolveFamilyVisibleChildren(
  familyProgramCode: string,
): Promise<FamilyVisibleChildrenResult> {
  const code = familyProgramCode.trim();
  const errors: string[] = [];

  if (!code) {
    return {
      familyProgramCode: '',
      participants: [],
      links: [],
      children: [],
      allowedStudentIds: [],
      errors: ['Missing active program context.'],
    };
  }

  const [familyParticipantsPayload, linksPayload] = await Promise.all([
    fetchStudentParticipantsFromSupabase(code),
    fetchStudentFamilyLinksByFamilyProgram(code),
  ]);

  if (familyParticipantsPayload.error) errors.push(familyParticipantsPayload.error);
  if (linksPayload.error) errors.push(linksPayload.error);

  const familyParticipants = familyParticipantsPayload.participants;
  const links = linksPayload.links;

  console.info('[FAMILY_CHILD_LINKS]', {
    family_program_code: code,
    link_count: links.length,
    links: links.map((row) => ({
      student_id: row.student_id,
      camp_program_code: row.camp_program_code,
      parent_last_name: row.parent_last_name,
    })),
  });

  const linkedIds = links.map((row) => row.student_id).filter(Boolean);
  const missingLinkedIds = linkedIds.filter(
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

  for (const participant of familyParticipants) {
    allowed.add(participant.id);
    children.push({
      studentId: participant.id,
      displayName: childDisplayName(participant),
      source: 'family_participant',
    });
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
