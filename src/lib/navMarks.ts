/**
 * Router-level navigation markers for Perf Detective.
 * Call markNavStart(to) when user initiates navigation (e.g. link click).
 * Call markNavEnd() when the route has finished updating (e.g. location.pathname changed).
 */

declare global {
  interface Window {
    __NAV_START?: (to: string) => void;
    __NAV_END?: () => void;
  }
}

export function markNavStart(to: string): void {
  if (typeof window !== 'undefined' && window.__NAV_START) {
    window.__NAV_START(to);
  }
  if (typeof performance !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log('[NAV] start ->', to, Math.round(performance.now()));
  }
}

export function markNavEnd(): void {
  if (typeof window !== 'undefined' && window.__NAV_END) {
    window.__NAV_END();
  }
  const path = typeof window !== 'undefined' && window.location ? window.location.pathname : '';
  if (typeof performance !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log('[NAV] end', path, Math.round(performance.now()));
  }
}
