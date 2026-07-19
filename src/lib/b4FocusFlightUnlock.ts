export const B4_FOCUS_FLIGHT_UNLOCK_SEEN_KEY = 'b4FocusFlightUnlockSeen';
export const B4_FOCUS_FLIGHT_PLAYED_KEY = 'b4FocusFlightPlayed';
export const B4_FOCUS_FLIGHT_ARCADE_VISITED_KEY = 'b4FocusFlightArcadeVisited';
export const B4_FOCUS_FLIGHT_HIGHLIGHT_KEY = 'b4FocusFlightHighlightPending';
export const B4_FOCUS_FLIGHT_UNLOCK_EVENT = 'b4-focus-flight-unlock-state';

export type B4FocusFlightUnlockState = {
  unlocked: boolean;
  seen: boolean;
  played: boolean;
  arcadeVisited: boolean;
  shouldShowModal: boolean;
  shouldShowArcadeBadge: boolean;
  shouldHighlightCard: boolean;
};

const participantKey = (key: string, participantId?: string | null): string => {
  const id = participantId?.trim();
  return id ? `${key}:${id}` : key;
};

const readFlag = (key: string, participantId?: string | null): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(participantKey(key, participantId)) === 'true';
  } catch {
    return false;
  }
};

const writeFlag = (key: string, value: boolean, participantId?: string | null): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(participantKey(key, participantId), value ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent(B4_FOCUS_FLIGHT_UNLOCK_EVENT));
  } catch {
    /* localStorage unavailable */
  }
};

export const getB4FocusFlightUnlockState = (participantId?: string | null): B4FocusFlightUnlockState => {
  // TODO(progress): Unlock B-4 Focus Flight after Week 1 completion, unlock
  // Dragon Flight after Week 3, unlock Memory Match after Week 2, and save
  // unlock state to Supabase instead of localStorage.
  const unlocked = true;
  const seen = readFlag(B4_FOCUS_FLIGHT_UNLOCK_SEEN_KEY, participantId);
  const played = readFlag(B4_FOCUS_FLIGHT_PLAYED_KEY, participantId);
  const arcadeVisited = readFlag(B4_FOCUS_FLIGHT_ARCADE_VISITED_KEY, participantId);
  const highlightPending = readFlag(B4_FOCUS_FLIGHT_HIGHLIGHT_KEY, participantId);

  return {
    unlocked,
    seen,
    played,
    arcadeVisited,
    shouldShowModal: unlocked && !seen && !played,
    shouldShowArcadeBadge: unlocked && !played && !arcadeVisited,
    shouldHighlightCard: unlocked && !played && (highlightPending || !arcadeVisited),
  };
};

export const markB4FocusFlightUnlockSeen = (participantId?: string | null): void => {
  writeFlag(B4_FOCUS_FLIGHT_UNLOCK_SEEN_KEY, true, participantId);
};

export const markB4FocusFlightArcadeVisited = (participantId?: string | null): void => {
  writeFlag(B4_FOCUS_FLIGHT_ARCADE_VISITED_KEY, true, participantId);
};

export const markB4FocusFlightPlayed = (participantId?: string | null): void => {
  writeFlag(B4_FOCUS_FLIGHT_PLAYED_KEY, true, participantId);
  writeFlag(B4_FOCUS_FLIGHT_UNLOCK_SEEN_KEY, true, participantId);
  writeFlag(B4_FOCUS_FLIGHT_ARCADE_VISITED_KEY, true, participantId);
  writeFlag(B4_FOCUS_FLIGHT_HIGHLIGHT_KEY, false, participantId);
};

export const requestB4FocusFlightHighlight = (participantId?: string | null): void => {
  writeFlag(B4_FOCUS_FLIGHT_HIGHLIGHT_KEY, true, participantId);
};

export const clearB4FocusFlightHighlight = (participantId?: string | null): void => {
  writeFlag(B4_FOCUS_FLIGHT_HIGHLIGHT_KEY, false, participantId);
};

export const getParticipantB4FlightStorageKey = participantKey;
