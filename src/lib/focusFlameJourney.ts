export const OPEN_FOCUS_FLAME_JOURNEY_EVENT = 'caidens:open-focus-flame-journey';
export const FOCUS_FLAME_ADD_CHILD_EVENT = 'caidens:focus-flame-add-child';

export function openFocusFlameJourney(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(OPEN_FOCUS_FLAME_JOURNEY_EVENT));
}
