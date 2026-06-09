export const ACTIVE_CHILD_PARTICIPANT_ID_KEY = 'activeChildParticipantId';

export const CHILD_PROFILE_UPDATED_EVENT = 'cc-child-profile-updated';

export function readActiveChildParticipantId(): string {
  try {
    const raw = localStorage.getItem(ACTIVE_CHILD_PARTICIPANT_ID_KEY);
    return raw?.trim() ?? '';
  } catch {
    return '';
  }
}

export function writeActiveChildParticipantId(participantId: string): void {
  try {
    const trimmed = participantId.trim();
    if (trimmed) {
      localStorage.setItem(ACTIVE_CHILD_PARTICIPANT_ID_KEY, trimmed);
    } else {
      localStorage.removeItem(ACTIVE_CHILD_PARTICIPANT_ID_KEY);
    }
  } catch {
    /* localStorage unavailable */
  }
}

export function notifyChildProfileUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CHILD_PROFILE_UPDATED_EVENT));
}
