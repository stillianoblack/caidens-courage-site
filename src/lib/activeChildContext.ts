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
import { notifyPortalSessionChanged } from './portalSessionEvents';

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

let lastActiveChildSignature = '';

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
  const previous = readScopedActiveChildRecord();
  const nextParticipantId = child.participantId.trim();
  const nextDisplayName = child.displayName.trim() || 'Player';
  const nextFirstName = child.firstName?.trim() || undefined;
  const unchanged =
    (previous?.participantId === nextParticipantId &&
      previous?.displayName === nextDisplayName &&
      previous?.firstName === nextFirstName &&
      (!programCode || previous?.programCode === programCode)) ||
    lastActiveChildSignature ===
      `${programCode ?? ''}|${nextParticipantId}|${nextDisplayName}|${nextFirstName ?? ''}`;

  if (programCode) {
    writeScopedActiveChildRecord({
      participantId: nextParticipantId,
      displayName: nextDisplayName,
      firstName: nextFirstName,
      programCode,
      accessCode: scope?.accessCode,
      createdAt: new Date().toISOString(),
    });
  }

  lastActiveChildSignature = `${programCode ?? ''}|${nextParticipantId}|${nextDisplayName}|${nextFirstName ?? ''}`;
  if (unchanged) return;
  notifyChildProfileUpdated();
  notifyPortalSessionChanged('active_child_set');
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
    notifyPortalSessionChanged('active_child_clear');
    window.dispatchEvent(new CustomEvent(ACTIVE_CHILD_EVENT, { detail: null }));
  }
}

export function notifyModuleComplete(detail?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(MODULE_COMPLETE_EVENT, { detail }));
}
