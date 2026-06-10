export const OPEN_ASK_B4_EVENT = 'caidens:open-ask-b4';

export type OpenAskB4Detail = {
  prompt?: string;
};

export function openAskB4(prompt?: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<OpenAskB4Detail>(OPEN_ASK_B4_EVENT, {
      detail: prompt?.trim() ? { prompt: prompt.trim() } : undefined,
    }),
  );
}
