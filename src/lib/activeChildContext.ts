import {
  ACTIVE_CHILD_PARTICIPANT_ID_KEY,
  CHILD_PROFILE_UPDATED_EVENT,
  notifyChildProfileUpdated,
  writeActiveChildParticipantId,
} from '../config/activeChildParticipant';
import { ACTIVE_CHILD_NICKNAME_KEY, writeActiveChildNickname } from '../config/activeChildNickname';
import {
  clearScopedActiveChildRecord,
  readScopedActiveChildRecord,
  rejectLegacyActiveChildStorage,
  resolvePortalProgramScope,
  writeScopedActiveChildRecord,
} from './portalSessionIsolation';

export const ACTIVE_CHILD_EVENT = 'cc-active-child-changed';
export const MODULE_COMPLETE_EVENT = 'cc-module-complete';

export type ActiveChildState = {
  participantId: string;
  displayName: string;
  firstName?: string;
};

export function readActiveChildState(): ActiveChildState | null {
  rejectLegacyActiveChildStorage();

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
  if (scope?.programCode) {
    writeScopedActiveChildRecord({
      participantId: child.participantId.trim(),
      displayName: child.displayName.trim() || 'Player',
      firstName: child.firstName?.trim() || undefined,
      programCode: scope.programCode,
      accessCode: scope.accessCode,
      createdAt: new Date().toISOString(),
    });
  }

  writeActiveChildParticipantId(child.participantId);
  writeActiveChildNickname(child.displayName);
  console.info('[ACTIVE_CHILD]', {
    participant_id: child.participantId,
    display_name: child.displayName,
    first_name: child.firstName ?? null,
    program_code: scope?.programCode ?? null,
  });
  notifyChildProfileUpdated();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ACTIVE_CHILD_EVENT, { detail: child }));
  }
}

export function clearActiveChild(): void {
  clearScopedActiveChildRecord();
  writeActiveChildParticipantId('');
  writeActiveChildNickname('');
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

export { CHILD_PROFILE_UPDATED_EVENT };
