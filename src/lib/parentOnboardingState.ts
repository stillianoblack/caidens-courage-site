import { hasConfirmedParentClaim, type ParentClaimContext } from '../config/parentClaimContext';
import { hasFamilyChildGoals, readFamilyChildGoalsLocal } from './familyChildGoalsService';
import { isParentConnected, isParentConnectedForLink, resolveParentEmailFromSources } from './portalIdentity';
import type { StudentFamilyLink } from './studentFamilyLinkService';

const STORAGE_PREFIX = 'cc-family-onboarding-complete';

export type ParentOnboardingGoals = string[];

export type FamilyOnboardingRecord = {
  parentEmail: string;
  programCode: string;
  participantId: string;
  complete: boolean;
  skipped: boolean;
  familyGoals: ParentOnboardingGoals;
  childDisplayName?: string;
  completedAt?: string;
  skippedAt?: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeProgramCode(programCode: string): string {
  return programCode.trim().toLowerCase();
}

function normalizeParticipantId(participantId: string): string {
  return participantId.trim();
}

export function familyOnboardingStorageKey(
  programCode: string,
  participantId: string,
  parentEmail: string,
): string {
  return `${STORAGE_PREFIX}:${normalizeProgramCode(programCode)}:${normalizeParticipantId(participantId)}:${normalizeEmail(parentEmail)}`;
}

export function readFamilyOnboardingRecord(
  programCode: string,
  participantId: string,
  parentEmail: string,
): FamilyOnboardingRecord | null {
  if (typeof window === 'undefined') return null;
  const key = familyOnboardingStorageKey(programCode, participantId, parentEmail);
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FamilyOnboardingRecord;
    if (!parsed?.programCode || !parsed?.participantId || !parsed?.parentEmail) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeFamilyOnboardingRecord(record: FamilyOnboardingRecord): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      familyOnboardingStorageKey(record.programCode, record.participantId, record.parentEmail),
      JSON.stringify(record),
    );
  } catch {
    /* storage unavailable */
  }
}

export function markFamilyOnboardingComplete(input: {
  programCode: string;
  participantId: string;
  parentEmail: string;
  familyGoals: ParentOnboardingGoals;
  childDisplayName?: string;
}): void {
  writeFamilyOnboardingRecord({
    parentEmail: normalizeEmail(input.parentEmail),
    programCode: input.programCode.trim(),
    participantId: normalizeParticipantId(input.participantId),
    complete: true,
    skipped: false,
    familyGoals: input.familyGoals,
    childDisplayName: input.childDisplayName,
    completedAt: new Date().toISOString(),
  });
}

export function markFamilyOnboardingSkipped(input: {
  programCode: string;
  participantId: string;
  parentEmail: string;
}): void {
  const existing = readFamilyOnboardingRecord(
    input.programCode,
    input.participantId,
    input.parentEmail,
  );
  writeFamilyOnboardingRecord({
    parentEmail: normalizeEmail(input.parentEmail),
    programCode: input.programCode.trim(),
    participantId: normalizeParticipantId(input.participantId),
    complete: false,
    skipped: true,
    familyGoals: existing?.familyGoals ?? [],
    childDisplayName: existing?.childDisplayName,
    skippedAt: new Date().toISOString(),
  });
}

/** @deprecated Use readFamilyOnboardingRecord with participantId. */
export function readParentOnboardingRecord(
  programCode: string,
  parentEmail: string,
): FamilyOnboardingRecord | null {
  if (typeof window === 'undefined') return null;
  const prefix = `${STORAGE_PREFIX}:${normalizeProgramCode(programCode)}:`;
  const suffix = `:${normalizeEmail(parentEmail)}`;
  try {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key?.startsWith(prefix) || !key.endsWith(suffix)) continue;
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      return JSON.parse(raw) as FamilyOnboardingRecord;
    }
  } catch {
    return null;
  }
  return null;
}

/** @deprecated Use markFamilyOnboardingComplete. */
export function markParentOnboardingComplete(input: {
  programCode: string;
  parentEmail: string;
  familyGoals: ParentOnboardingGoals;
  childParticipantId?: string;
  childDisplayName?: string;
}): void {
  if (!input.childParticipantId?.trim()) return;
  markFamilyOnboardingComplete({
    programCode: input.programCode,
    participantId: input.childParticipantId,
    parentEmail: input.parentEmail,
    familyGoals: input.familyGoals,
    childDisplayName: input.childDisplayName,
  });
}

/** @deprecated Use markFamilyOnboardingSkipped. */
export function dismissParentOnboardingLater(input: {
  programCode: string;
  parentEmail: string;
  participantId?: string;
}): void {
  if (!input.participantId?.trim()) return;
  markFamilyOnboardingSkipped({
    programCode: input.programCode,
    participantId: input.participantId,
    parentEmail: input.parentEmail,
  });
}

function resolveScopedParentLink(
  familyLinks: StudentFamilyLink[],
  participantId: string,
  parentClaim?: ParentClaimContext | null,
): StudentFamilyLink | null {
  const scoped = familyLinks.find((link) => link.student_id === participantId);
  if (scoped) return scoped;
  if (!parentClaim) return null;
  return familyLinks.find((link) => link.student_id === participantId) ?? null;
}

export function parentProfileExists(input: {
  parentClaim?: ParentClaimContext | null;
  parentLink?: StudentFamilyLink | null;
}): boolean {
  if (hasConfirmedParentClaim(input.parentClaim)) return true;
  if (isParentConnectedForLink(input.parentLink)) return true;
  const link = input.parentLink;
  if (!link) return false;
  const hasEmail = Boolean(link.parent_email?.trim());
  const hasName = Boolean(link.parent_first_name?.trim() || link.parent_last_name?.trim());
  return hasEmail && hasName;
}

export function isFamilyOnboardingCriteriaMet(input: {
  programCode: string;
  participantId: string;
  parentEmail: string;
  parentClaim?: ParentClaimContext | null;
  parentLink?: StudentFamilyLink | null;
  childDisplayName?: string;
  familyGoalsComplete?: boolean;
  record?: FamilyOnboardingRecord | null;
}): boolean {
  const email = input.parentEmail.trim();
  if (!email) return false;

  const record =
    input.record ??
    readFamilyOnboardingRecord(input.programCode, input.participantId, email);
  if (record?.complete || record?.skipped) return true;

  const connected = isParentConnectedForLink(input.parentLink);
  const claimConfirmed = hasConfirmedParentClaim(input.parentClaim);
  const emailConnected = connected || (claimConfirmed && Boolean(email));

  if (!emailConnected) return false;

  const profileReady = parentProfileExists({
    parentClaim: input.parentClaim,
    parentLink: input.parentLink,
  });

  if (!profileReady && !claimConfirmed) return false;

  const goalsComplete =
    input.familyGoalsComplete ??
    hasFamilyChildGoals(
      readFamilyChildGoalsLocal(input.programCode, input.participantId),
    );

  return goalsComplete || Boolean(record?.skipped);
}

export type FamilyOnboardingVisibility = {
  show: boolean;
  goalsOnly: boolean;
};

export function resolveFamilyOnboardingVisibility(input: {
  programCode: string;
  participantId?: string | null;
  parentEmail?: string | null;
  parentClaim?: ParentClaimContext | null;
  familyLinks: StudentFamilyLink[];
  childDisplayName?: string;
}): FamilyOnboardingVisibility {
  const programCode = input.programCode?.trim();
  const participantId = input.participantId?.trim();
  if (!programCode || !participantId) {
    return { show: false, goalsOnly: false };
  }

  const parentClaim = input.parentClaim ?? null;
  const parentLink = resolveScopedParentLink(input.familyLinks, participantId, parentClaim);
  const parentEmail =
    input.parentEmail?.trim() ||
    resolveParentEmailFromSources({
      programCode,
      parentClaim,
      parentLink,
    });

  const connected = isParentConnected({
    programCode,
    familyLinks: input.familyLinks,
    parentClaim,
    participantId,
  });

  if (connected && parentEmail) {
    if (
      !readFamilyOnboardingRecord(programCode, participantId, parentEmail)?.complete &&
      !readFamilyOnboardingRecord(programCode, participantId, parentEmail)?.skipped
    ) {
      markFamilyOnboardingComplete({
        programCode,
        participantId,
        parentEmail,
        familyGoals: [],
      });
    }
    return { show: false, goalsOnly: false };
  }

  if (!parentEmail) {
    return { show: true, goalsOnly: false };
  }

  const record = readFamilyOnboardingRecord(programCode, participantId, parentEmail);
  if (record?.complete || record?.skipped) {
    return { show: false, goalsOnly: false };
  }

  const goalsComplete = hasFamilyChildGoals(
    readFamilyChildGoalsLocal(programCode, participantId),
  );

  if (
    isFamilyOnboardingCriteriaMet({
      programCode,
      participantId,
      parentEmail,
      parentClaim,
      parentLink,
      childDisplayName: input.childDisplayName,
      familyGoalsComplete: goalsComplete,
      record,
    })
  ) {
    markFamilyOnboardingComplete({
      programCode,
      participantId,
      parentEmail,
      familyGoals: [],
    });
    return { show: false, goalsOnly: false };
  }

  const claimConfirmed = hasConfirmedParentClaim(parentClaim);
  const profileReady = parentProfileExists({ parentClaim, parentLink });

  if (claimConfirmed && profileReady && !goalsComplete && !record?.skipped) {
    return { show: true, goalsOnly: true };
  }

  if (!claimConfirmed || !profileReady) {
    return { show: true, goalsOnly: false };
  }

  return { show: false, goalsOnly: false };
}

/** @deprecated Use resolveFamilyOnboardingVisibility. */
export function shouldShowParentOnboarding(input: {
  programCode: string;
  parentEmail?: string | null;
  parentConnectionIncomplete?: boolean;
  participantId?: string | null;
  familyLinks?: StudentFamilyLink[];
  childDisplayName?: string;
  parentClaim?: ParentClaimContext | null;
}): boolean {
  return resolveFamilyOnboardingVisibility({
    programCode: input.programCode,
    participantId: input.participantId,
    parentEmail: input.parentEmail,
    parentClaim: input.parentClaim,
    familyLinks: input.familyLinks ?? [],
    childDisplayName: input.childDisplayName,
  }).show;
}

export const PARENT_ONBOARDING_GOAL_OPTIONS = [
  'Focus',
  'Confidence',
  'Reading',
  'Emotional awareness',
  'Communication',
  'Consistency',
  'Teamwork',
] as const;
