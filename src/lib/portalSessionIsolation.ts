import { readScopedParentClaimRecord } from '../config/parentClaimContext';
import {
  resolvePortalProgramScope,
  programScopesMatch,
  SESSION_MISMATCH_MESSAGE,
} from './portalProgramScope';
import { logSessionIsolationWarning } from './sessionIsolationLog';

export { SESSION_MISMATCH_MESSAGE } from './portalProgramScope';
export type { PortalProgramScope } from './portalProgramScope';
export type { SessionIsolationEvent } from './sessionIsolationLog';
export { logSessionIsolationWarning } from './sessionIsolationLog';
export { resolvePortalProgramScope, programScopesMatch } from './portalProgramScope';

export const SCOPED_ACTIVE_CHILD_KEY = 'cc-scoped-active-child';

export type ScopedActiveChildRecord = {
  participantId: string;
  displayName: string;
  firstName?: string;
  programCode: string;
  accessCode?: string;
  createdAt: string;
};

export function readScopedActiveChildRecord(
  expectedProgramCode?: string,
): ScopedActiveChildRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SCOPED_ACTIVE_CHILD_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ScopedActiveChildRecord>;
    if (!parsed.participantId?.trim() || !parsed.programCode?.trim()) {
      clearScopedActiveChildRecord();
      return null;
    }
    const record: ScopedActiveChildRecord = {
      participantId: parsed.participantId.trim(),
      displayName: parsed.displayName?.trim() || 'Player',
      firstName: parsed.firstName?.trim() || undefined,
      programCode: parsed.programCode.trim(),
      accessCode: parsed.accessCode?.trim() || undefined,
      createdAt: parsed.createdAt?.trim() || new Date(0).toISOString(),
    };
    const expected =
      expectedProgramCode?.trim() || resolvePortalProgramScope()?.programCode;
    if (expected && !programScopesMatch(record.programCode, expected)) {
      logSessionIsolationWarning('active_child_program_mismatch', {
        expected_program_code: expected,
        stored_program_code: record.programCode,
        participant_id: record.participantId,
      });
      return null;
    }
    return record;
  } catch {
    return null;
  }
}

export function writeScopedActiveChildRecord(record: ScopedActiveChildRecord): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SCOPED_ACTIVE_CHILD_KEY, JSON.stringify(record));
  } catch {
    /* localStorage unavailable */
  }
}

export function clearScopedActiveChildRecord(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(SCOPED_ACTIVE_CHILD_KEY);
  } catch {
    /* localStorage unavailable */
  }
}

export function rejectLegacyActiveChildStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const legacyId = window.localStorage.getItem('activeChildParticipantId')?.trim();
    if (legacyId) {
      logSessionIsolationWarning('legacy_active_child_rejected', {
        participant_id: legacyId,
      });
      window.localStorage.removeItem('activeChildParticipantId');
      window.localStorage.removeItem('activeChildNickname');
    }
  } catch {
    /* localStorage unavailable */
  }
}

export function validateParentClaimWrite(input: {
  programCode: string;
  accessCode?: string;
  email: string;
  participantId?: string;
}): { ok: true } | { ok: false; message: string; code: string } {
  const programCode = input.programCode.trim();
  if (!programCode) {
    return { ok: false, message: SESSION_MISMATCH_MESSAGE, code: 'missing_program' };
  }

  const scope = resolvePortalProgramScope();
  if (scope && !programScopesMatch(scope.programCode, programCode)) {
    logSessionIsolationWarning('parent_attach_program_mismatch', {
      expected_program_code: scope.programCode,
      attempted_program_code: programCode,
      participant_id: input.participantId ?? null,
    });
    return { ok: false, message: SESSION_MISMATCH_MESSAGE, code: 'program_mismatch' };
  }

  const existing = readScopedParentClaimRecord();
  if (
    existing &&
    scope &&
    programScopesMatch(existing.programCode, scope.programCode) &&
    existing.accessCode?.trim() &&
    input.accessCode?.trim() &&
    existing.accessCode.trim() !== input.accessCode.trim()
  ) {
    logSessionIsolationWarning('parent_attach_program_mismatch', {
      expected_access_code: existing.accessCode,
      attempted_access_code: input.accessCode,
      participant_id: input.participantId ?? null,
    });
    return { ok: false, message: SESSION_MISMATCH_MESSAGE, code: 'access_code_mismatch' };
  }

  if (!input.email.trim()) {
    return { ok: false, message: 'Enter a valid parent email.', code: 'missing_email' };
  }

  return { ok: true };
}
