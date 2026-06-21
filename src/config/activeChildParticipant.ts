import { readScopedActiveChildRecord, rejectLegacyActiveChildStorage } from '../lib/portalSessionIsolation';

export const ACTIVE_CHILD_PARTICIPANT_ID_KEY = 'activeChildParticipantId';

export const CHILD_PROFILE_UPDATED_EVENT = 'cc-child-profile-updated';

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
