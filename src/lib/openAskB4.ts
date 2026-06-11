import { ENABLE_B4_CHAT } from '../config/featureFlags';

export const OPEN_ASK_B4_EVENT = 'caidens:open-ask-b4';

export type OpenAskB4Detail = {
  prompt?: string;
};

let pendingOpenOnMount = false;

/** Queue open for the next B4ChatWidget mount (before lazy bundle finishes loading). */
export function markAskB4OpenPending(): void {
  pendingOpenOnMount = true;
}

export function consumeAskB4OpenPending(): boolean {
  if (!pendingOpenOnMount) return false;
  pendingOpenOnMount = false;
  return true;
}

export function openAskB4(prompt?: string): void {
  if (!ENABLE_B4_CHAT || typeof window === 'undefined') return;
  markAskB4OpenPending();
  window.dispatchEvent(
    new CustomEvent<OpenAskB4Detail>(OPEN_ASK_B4_EVENT, {
      detail: prompt?.trim() ? { prompt: prompt.trim() } : undefined,
    }),
  );
}
