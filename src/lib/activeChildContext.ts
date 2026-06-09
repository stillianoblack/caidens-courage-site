import {
  ACTIVE_CHILD_PARTICIPANT_ID_KEY,
  CHILD_PROFILE_UPDATED_EVENT,
  notifyChildProfileUpdated,
  writeActiveChildParticipantId,
} from '../config/activeChildParticipant';
import { ACTIVE_CHILD_NICKNAME_KEY, writeActiveChildNickname } from '../config/activeChildNickname';

export const ACTIVE_CHILD_EVENT = 'cc-active-child-changed';
export const MODULE_COMPLETE_EVENT = 'cc-module-complete';

export type ActiveChildState = {
  participantId: string;
  displayName: string;
  firstName?: string;
};

export function readActiveChildState(): ActiveChildState | null {
  const participantId =
    typeof window !== 'undefined'
      ? window.localStorage.getItem(ACTIVE_CHILD_PARTICIPANT_ID_KEY)?.trim() ?? ''
      : '';
  const displayName =
    typeof window !== 'undefined'
      ? window.localStorage.getItem(ACTIVE_CHILD_NICKNAME_KEY)?.trim() ?? ''
      : '';

  if (!participantId) return null;
  return { participantId, displayName: displayName || 'Player' };
}

export function setActiveChild(child: ActiveChildState): void {
  writeActiveChildParticipantId(child.participantId);
  writeActiveChildNickname(child.displayName);
  console.info('[ACTIVE_CHILD]', {
    participant_id: child.participantId,
    display_name: child.displayName,
    first_name: child.firstName ?? null,
  });
  notifyChildProfileUpdated();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ACTIVE_CHILD_EVENT, { detail: child }));
  }
}

export function clearActiveChild(): void {
  writeActiveChildParticipantId('');
  writeActiveChildNickname('');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ACTIVE_CHILD_EVENT, { detail: null }));
  }
}

export function notifyModuleComplete(detail?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(MODULE_COMPLETE_EVENT, { detail }));
}

export { CHILD_PROFILE_UPDATED_EVENT };
