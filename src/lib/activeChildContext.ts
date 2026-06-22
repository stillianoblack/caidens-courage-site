import { ACTIVE_CHILD_PARTICIPANT_ID_KEY } from '../config/activeChildEvents';
import { notifyChildProfileUpdated } from '../config/activeChildParticipant';
import { ACTIVE_CHILD_NICKNAME_KEY } from '../config/activeChildNickname';
import {
  clearScopedActiveChildRecord,
  readScopedActiveChildRecord,
  rejectLegacyActiveChildStorage,
  resolvePortalProgramScope,
  writeScopedActiveChildRecord,
} from './portalSessionIsolation';
import { readStudentPinSession, type StudentPinSession } from './studentPinSession';

function hydrateScopedActiveChildFromPinSession(): StudentPinSession | null {
  const pinSession = readStudentPinSession({ allowCampUnderFamilyPortal: true });
  if (!pinSession?.participantId?.trim()) return null;
  if (readScopedActiveChildRecord()) return pinSession;

  const programCode = resolvePortalProgramScope()?.programCode || pinSession.programCode?.trim();
  if (!programCode) return pinSession;

  writeScopedActiveChildRecord({
    participantId: pinSession.participantId.trim(),
    displayName: pinSession.displayName?.trim() || 'Player',
    firstName: pinSession.displayName?.trim() || undefined,
    programCode,
    createdAt: new Date().toISOString(),
  });
  return pinSession;
}

export const ACTIVE_CHILD_EVENT = 'cc-active-child-changed';
export const MODULE_COMPLETE_EVENT = 'cc-module-complete';

export type ActiveChildState = {
  participantId: string;
  displayName: string;
  firstName?: string;
};

export function readActiveChildState(): ActiveChildState | null {
  rejectLegacyActiveChildStorage();

  hydrateScopedActiveChildFromPinSession();

  const scoped = readScopedActiveChildRecord();
  if (scoped) {
    return {
      participantId: scoped.participantId,
      displayName: scoped.displayName,
      firstName: scoped.firstName,
    };
  }

  return null;
}

export function setActiveChild(child: ActiveChildState): void {
  const scope = resolvePortalProgramScope();
  const pinSession = readStudentPinSession();
  const programCode = scope?.programCode?.trim() || pinSession?.programCode?.trim();
  if (programCode) {
    writeScopedActiveChildRecord({
      participantId: child.participantId.trim(),
      displayName: child.displayName.trim() || 'Player',
      firstName: child.firstName?.trim() || undefined,
      programCode,
      accessCode: scope?.accessCode,
      createdAt: new Date().toISOString(),
    });
  }

  console.info('[ACTIVE_CHILD]', {
    participant_id: child.participantId,
    display_name: child.displayName,
    first_name: child.firstName ?? null,
    program_code: programCode ?? null,
  });
  notifyChildProfileUpdated();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ACTIVE_CHILD_EVENT, { detail: child }));
  }
}

export function clearActiveChild(): void {
  clearScopedActiveChildRecord();
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(ACTIVE_CHILD_PARTICIPANT_ID_KEY);
      window.localStorage.removeItem(ACTIVE_CHILD_NICKNAME_KEY);
    } catch {
      /* localStorage unavailable */
    }
    window.dispatchEvent(new CustomEvent(ACTIVE_CHILD_EVENT, { detail: null }));
  }
}

export function notifyModuleComplete(detail?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(MODULE_COMPLETE_EVENT, { detail }));
}
