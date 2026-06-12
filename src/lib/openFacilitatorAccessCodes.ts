export const OPEN_FACILITATOR_ACCESS_CODES_EVENT = 'caidens:open-facilitator-access-codes';

export function openFacilitatorAccessCodes(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(OPEN_FACILITATOR_ACCESS_CODES_EVENT));
}
