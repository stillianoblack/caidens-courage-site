import { readScopedActiveChildRecord, rejectLegacyActiveChildStorage } from '../lib/portalSessionIsolation';
import {
  ACTIVE_CHILD_PARTICIPANT_ID_KEY,
  CHILD_PROFILE_UPDATED_EVENT,
} from './activeChildEvents';

export { ACTIVE_CHILD_PARTICIPANT_ID_KEY, CHILD_PROFILE_UPDATED_EVENT };

export function readActiveChildParticipantId(): string {
  rejectLegacyActiveChildStorage();
  const scoped = readScopedActiveChildRecord();
  if (scoped?.participantId?.trim()) {
    return scoped.participantId.trim();
  }
  return '';
}

export function writeActiveChildParticipantId(_participantId: string): void {
  /* Legacy unscoped key retired — active child is stored in cc-scoped-active-child only. */
}

export function notifyChildProfileUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CHILD_PROFILE_UPDATED_EVENT));
}
