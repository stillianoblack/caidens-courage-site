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

const readFlag = (key: string): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
};

const writeFlag = (key: string, value: boolean): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent(B4_FOCUS_FLIGHT_UNLOCK_EVENT));
  } catch {
    /* localStorage unavailable */
  }
};

export const getB4FocusFlightUnlockState = (): B4FocusFlightUnlockState => {
  // TODO(progress): Unlock B-4 Focus Flight after Week 1 completion, unlock
  // Dragon Flight after Week 3, unlock Memory Match after Week 2, and save
  // unlock state to Supabase instead of localStorage.
  const unlocked = true;
  const seen = readFlag(B4_FOCUS_FLIGHT_UNLOCK_SEEN_KEY);
  const played = readFlag(B4_FOCUS_FLIGHT_PLAYED_KEY);
  const arcadeVisited = readFlag(B4_FOCUS_FLIGHT_ARCADE_VISITED_KEY);
  const highlightPending = readFlag(B4_FOCUS_FLIGHT_HIGHLIGHT_KEY);

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

export const markB4FocusFlightUnlockSeen = (): void => {
  writeFlag(B4_FOCUS_FLIGHT_UNLOCK_SEEN_KEY, true);
};

export const markB4FocusFlightArcadeVisited = (): void => {
  writeFlag(B4_FOCUS_FLIGHT_ARCADE_VISITED_KEY, true);
};

export const markB4FocusFlightPlayed = (): void => {
  writeFlag(B4_FOCUS_FLIGHT_PLAYED_KEY, true);
  writeFlag(B4_FOCUS_FLIGHT_UNLOCK_SEEN_KEY, true);
  writeFlag(B4_FOCUS_FLIGHT_ARCADE_VISITED_KEY, true);
  writeFlag(B4_FOCUS_FLIGHT_HIGHLIGHT_KEY, false);
};

export const requestB4FocusFlightHighlight = (): void => {
  writeFlag(B4_FOCUS_FLIGHT_HIGHLIGHT_KEY, true);
};

export const clearB4FocusFlightHighlight = (): void => {
  writeFlag(B4_FOCUS_FLIGHT_HIGHLIGHT_KEY, false);
};
