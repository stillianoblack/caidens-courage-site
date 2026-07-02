export const PORTAL_SESSION_CHANGED_EVENT = 'cc-portal-session-changed';

export function notifyPortalSessionChanged(reason?: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(PORTAL_SESSION_CHANGED_EVENT, {
      detail: reason ? { reason } : undefined,
    }),
  );
}
