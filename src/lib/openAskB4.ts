export const OPEN_ASK_B4_EVENT = 'caidens:open-ask-b4';

export function openAskB4(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(OPEN_ASK_B4_EVENT));
}
