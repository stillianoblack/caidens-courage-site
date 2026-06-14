import { hasCanonicalGradeLevel } from './participantGradeDisplay';
import { hasConfirmedParentClaim, readParentClaimContext } from '../config/parentClaimContext';
import {
  fetchParticipantsByIds,
  fetchStudentFamilyLinksByFamilyProgram,
  linkMatchesParentScope,
  type FamilyVisibleChild,
  type ParentLinkScope,
  type StudentFamilyLink,
} from './studentFamilyLinkService';
import { mergeLocalParticipantGradeOverrides } from './pilotTrackingLocalStorage';
import {
  fetchStudentParticipantsFromSupabase,
  type StudentParticipantRecord,
} from './pilotTrackingService';

export type HydratedFamilyChild = {
  participantId: string;
  displayName: string;
  firstName: string | null;
  nickname: string | null;
  programCode: string;
  childAgeRange: string | null;
  gradeLevel: string | null;
  gradeBand: string | null;
  allowStretchLevel: boolean;
  source: 'family_participant' | 'camp_link';
};

export type FamilyChildMissingStatus = {
  missingGrade: boolean;
  missingNickname: boolean;
  missingFamilyGoals: boolean;
  missingB4CheckIn: boolean;
  missingPath: boolean;
};

export type HydrateExistingFamilyChildrenResult = {
  programCode: string;
  children: HydratedFamilyChild[];
  participants: StudentParticipantRecord[];
  allLinks: StudentFamilyLink[];
  scopedLinks: StudentFamilyLink[];
  visibleChildren: FamilyVisibleChild[];
  allowedStudentIds: string[];
  linkedChildCount: number;
  fallbackChildCount: number;
  claimRequired: boolean;
  errors: string[];
};

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

function childDisplayName(participant: Pick<StudentParticipantRecord, 'nickname' | 'first_name'>): string {
  return participant.nickname?.trim() || participant.first_name?.trim() || 'Child';
}

function childDedupeKey(input: {
  participantId: string;
  firstName?: string | null;
  nickname?: string | null;
  programCode: string;
}): string {
  const id = input.participantId.trim();
  if (id) return `id:${id}`;
  const name = (input.nickname?.trim() || input.firstName?.trim() || '').toLowerCase();
  return `name:${normalizeCode(input.programCode)}:${name}`;
}

function participantToHydratedChild(
  participant: StudentParticipantRecord,
  source: HydratedFamilyChild['source'],
  programCode: string,
): HydratedFamilyChild {
  return {
    participantId: participant.id,
    displayName: childDisplayName(participant),
    firstName: participant.first_name?.trim() || null,
    nickname: participant.nickname?.trim() || null,
    programCode: participant.program_code?.trim() || programCode,
    childAgeRange: participant.child_age_range?.trim() || null,
    gradeLevel: participant.grade_level?.trim() || null,
    gradeBand: participant.grade_band?.trim() || null,
    allowStretchLevel: Boolean(participant.allow_stretch_level),
    source,
  };
}

export function evaluateFamilyChildMissingStatus(
  child: Pick<HydratedFamilyChild, 'gradeLevel' | 'gradeBand' | 'nickname' | 'firstName'>,
  input: {
    goalsComplete: boolean;
    b4Complete: boolean;
    hasModuleActivity: boolean;
    pathChosen: boolean;
  },
): FamilyChildMissingStatus {
  return {
    missingGrade: !hasCanonicalGradeLevel(child.gradeLevel),
    missingNickname: !child.nickname?.trim() && !child.firstName?.trim(),
    missingFamilyGoals: !input.goalsComplete,
    missingB4CheckIn: !input.b4Complete,
    missingPath: !input.pathChosen && !input.hasModuleActivity,
  };
}

/**
 * Loads linked children from student_family_links + participants, with program-code fallback.
 * Merges and dedupes by participant id, name, and program code. Does not bypass RLS.
 */
export async function hydrateExistingFamilyChildren(
  familyProgramCode: string,
  parentScope?: ParentLinkScope,
): Promise<HydrateExistingFamilyChildrenResult> {
  const code = familyProgramCode.trim();
  const claimContext = readParentClaimContext();
  const scope = parentScope ?? claimContext ?? undefined;
  const errors: string[] = [];
  const empty = (claimRequired: boolean): HydrateExistingFamilyChildrenResult => ({
    programCode: code,
    children: [],
    participants: [],
    allLinks: [],
    scopedLinks: [],
    visibleChildren: [],
    allowedStudentIds: [],
    linkedChildCount: 0,
    fallbackChildCount: 0,
    claimRequired,
    errors,
  });

  if (!code) {
    return { ...empty(true), errors: ['Missing active program context.'] };
  }

  const claimRequired = !hasConfirmedParentClaim(claimContext);

  const linksPayload = await fetchStudentFamilyLinksByFamilyProgram(code);
  if (linksPayload.error) errors.push(linksPayload.error);

  const allLinks = linksPayload.links;
  const scopedLinks = claimRequired
    ? allLinks
    : allLinks.filter((link) => linkMatchesParentScope(link, scope));

  const familyParticipantsPayload = await fetchStudentParticipantsFromSupabase(code);
  if (familyParticipantsPayload.error) errors.push(familyParticipantsPayload.error);

  const familyParticipants = familyParticipantsPayload.participants;
  const allLinkedIds = Array.from(
    new Set(allLinks.map((link) => link.student_id?.trim()).filter((id): id is string => Boolean(id))),
  );

  const participantIdsToFetch = new Set<string>(allLinkedIds);
  for (const participant of familyParticipants) {
    participantIdsToFetch.add(participant.id);
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

  const linkedChildCount = allLinkedIds.filter((id) => participantById.has(id)).length;
  const fallbackChildCount = familyParticipants.filter(
    (participant) => !allLinkedIds.includes(participant.id),
  ).length;

  const children: HydratedFamilyChild[] = [];
  const seen = new Set<string>();

  const pushChild = (child: HydratedFamilyChild) => {
    const key = childDedupeKey(child);
    if (seen.has(key)) return;
    seen.add(key);
    children.push(child);
  };

  for (const link of scopedLinks) {
    const studentId = link.student_id?.trim();
    if (!studentId) continue;
    const participant = participantById.get(studentId);
    if (participant) {
      pushChild(participantToHydratedChild(participant, 'camp_link', code));
      continue;
    }
    pushChild({
      participantId: studentId,
      displayName: 'Linked Child',
      firstName: null,
      nickname: null,
      programCode: link.camp_program_code?.trim() || code,
      childAgeRange: null,
      gradeLevel: null,
      gradeBand: null,
      allowStretchLevel: false,
      source: 'camp_link',
    });
  }

  for (const participant of familyParticipants) {
    pushChild(participantToHydratedChild(participant, 'family_participant', code));
  }

  const sortedChildren = children.sort((a, b) => a.displayName.localeCompare(b.displayName));
  const allowedStudentIds = sortedChildren.map((child) => child.participantId);
  const visibleChildren: FamilyVisibleChild[] = sortedChildren.map((child) => ({
    studentId: child.participantId,
    displayName: child.displayName,
    source: child.source === 'family_participant' ? 'family_participant' : 'camp_link',
    campProgramCode:
      child.source === 'camp_link'
        ? scopedLinks.find((link) => link.student_id === child.participantId)?.camp_program_code ?? undefined
        : undefined,
  }));

  const participants = mergeLocalParticipantGradeOverrides(
    allowedStudentIds
      .map((id) => participantById.get(id))
      .filter((row): row is StudentParticipantRecord => Boolean(row)),
  );

  const childrenWithLocalGrades = sortedChildren.map((child) => {
    const participant = participants.find((row) => row.id === child.participantId);
    if (!participant) return child;
    return {
      ...child,
      gradeBand: participant.grade_band?.trim() || child.gradeBand,
      allowStretchLevel: participant.allow_stretch_level ?? child.allowStretchLevel,
    };
  });

  return {
    programCode: code,
    children: childrenWithLocalGrades,
    participants,
    allLinks,
    scopedLinks,
    visibleChildren,
    allowedStudentIds,
    linkedChildCount,
    fallbackChildCount,
    claimRequired,
    errors:
      claimRequired && childrenWithLocalGrades.length === 0
        ? errors.length
          ? errors
          : ['Enter Parent/Guardian Email to Find Your Child.']
        : errors,
  };
}
