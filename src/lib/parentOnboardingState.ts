const STORAGE_PREFIX = 'cc-parent-onboarding-complete';

export type ParentOnboardingGoals = string[];

export type ParentOnboardingRecord = {
  parentEmail: string;
  programCode: string;
  parentOnboardingComplete: boolean;
  familyGoals: ParentOnboardingGoals;
  childParticipantId?: string;
  childDisplayName?: string;
  completedAt?: string;
  dismissedAt?: string;
};

function storageKey(programCode: string, parentEmail: string): string {
  return `${STORAGE_PREFIX}:${programCode.trim().toLowerCase()}:${parentEmail.trim().toLowerCase()}`;
}

export function readParentOnboardingRecord(
  programCode: string,
  parentEmail: string,
): ParentOnboardingRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(storageKey(programCode, parentEmail));
    if (!raw) return null;
    return JSON.parse(raw) as ParentOnboardingRecord;
  } catch {
    return null;
  }
}

export function writeParentOnboardingRecord(record: ParentOnboardingRecord): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(record.programCode, record.parentEmail), JSON.stringify(record));
  } catch {
    /* storage unavailable */
  }
}

export function markParentOnboardingComplete(input: {
  programCode: string;
  parentEmail: string;
  familyGoals: ParentOnboardingGoals;
  childParticipantId?: string;
  childDisplayName?: string;
}): void {
  writeParentOnboardingRecord({
    parentEmail: input.parentEmail.trim(),
    programCode: input.programCode.trim(),
    parentOnboardingComplete: true,
    familyGoals: input.familyGoals,
    childParticipantId: input.childParticipantId,
    childDisplayName: input.childDisplayName,
    completedAt: new Date().toISOString(),
  });
}

export function dismissParentOnboardingLater(input: {
  programCode: string;
  parentEmail: string;
}): void {
  const existing = readParentOnboardingRecord(input.programCode, input.parentEmail);
  writeParentOnboardingRecord({
    parentEmail: input.parentEmail.trim(),
    programCode: input.programCode.trim(),
    parentOnboardingComplete: false,
    familyGoals: existing?.familyGoals ?? [],
    childParticipantId: existing?.childParticipantId,
    childDisplayName: existing?.childDisplayName,
    dismissedAt: new Date().toISOString(),
  });
}

export function shouldShowParentOnboarding(input: {
  programCode: string;
  parentEmail?: string | null;
  parentConnectionIncomplete?: boolean;
}): boolean {
  const email = input.parentEmail?.trim();
  const programCode = input.programCode?.trim();
  if (!programCode) return false;
  if (!email || input.parentConnectionIncomplete) return true;

  const record = readParentOnboardingRecord(programCode, email);
  return !record?.parentOnboardingComplete;
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
