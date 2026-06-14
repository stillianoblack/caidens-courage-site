/**
 * Clears stuck scroll locks after route changes or modal close.
 * Avoids removing React portal nodes — only resets document interaction state.
 */
export function resetPortalInteractionState(): void {
  if (typeof document === 'undefined') return;

  document.body.style.overflow = '';
  document.body.style.pointerEvents = '';
  document.documentElement.style.overflow = '';
}
