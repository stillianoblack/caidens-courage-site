import { programScopesMatch, resolvePortalProgramScope } from './portalProgramScope';
import { readParentClaimContext } from '../config/parentClaimContext';
import { logSessionIsolationWarning } from './sessionIsolationLog';
import { notifyPortalSessionChanged } from './portalSessionEvents';

const STUDENT_PIN_SESSION_KEY = 'cc-student-pin-session';

export type StudentPinSession = {
  participantId: string;
  programCode: string;
  displayName: string;
  verifiedAt: string;
};

export function readStudentPinSession(options?: {
  allowCampUnderFamilyPortal?: boolean;
}): StudentPinSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STUDENT_PIN_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StudentPinSession;
    if (!parsed.participantId?.trim() || !parsed.programCode?.trim()) return null;

    const expectedProgram = resolvePortalProgramScope()?.programCode;
    if (
      expectedProgram &&
      !programScopesMatch(parsed.programCode, expectedProgram)
    ) {
      const claim = readParentClaimContext({ programCode: expectedProgram });
      const campMatches =
        options?.allowCampUnderFamilyPortal &&
        claim?.campProgramCode?.trim() &&
        programScopesMatch(parsed.programCode, claim.campProgramCode);

      if (!campMatches) {
        logSessionIsolationWarning('student_pin_program_mismatch', {
          expected_program_code: expectedProgram,
          stored_program_code: parsed.programCode,
          participant_id: parsed.participantId,
        });
        clearStudentPinSession();
        return null;
      }
    }

    return parsed;
  } catch {
    return null;
  }
}

export function writeStudentPinSession(session: StudentPinSession): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STUDENT_PIN_SESSION_KEY, JSON.stringify(session));
    notifyPortalSessionChanged('student_pin_session_write');
  } catch {
    /* ignore */
  }
}

export function clearStudentPinSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STUDENT_PIN_SESSION_KEY);
    notifyPortalSessionChanged('student_pin_session_clear');
  } catch {
    /* ignore */
  }
}

export function hasActiveStudentPinSession(): boolean {
  return Boolean(readStudentPinSession()?.participantId);
}
