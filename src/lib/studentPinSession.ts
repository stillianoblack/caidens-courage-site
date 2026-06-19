const STUDENT_PIN_SESSION_KEY = 'cc-student-pin-session';

export type StudentPinSession = {
  participantId: string;
  programCode: string;
  displayName: string;
  verifiedAt: string;
};

export function readStudentPinSession(): StudentPinSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STUDENT_PIN_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StudentPinSession;
    if (!parsed.participantId?.trim() || !parsed.programCode?.trim()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeStudentPinSession(session: StudentPinSession): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STUDENT_PIN_SESSION_KEY, JSON.stringify(session));
  } catch {
    /* ignore */
  }
}

export function clearStudentPinSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STUDENT_PIN_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function hasActiveStudentPinSession(): boolean {
  return Boolean(readStudentPinSession()?.participantId);
}
