/**
 * Router-level navigation markers for Perf Detective.
 * No-op in production unless ?debugPerf=1; off when SAFE_MODE.
 */

import { allowPerfTools } from '../perf/prodGuards';

declare global {
  interface Window {
    __NAV_START?: (to: string) => void;
    __NAV_END?: () => void;
  }
}

function shouldRun(): boolean {
  return allowPerfTools() && !(typeof window !== 'undefined' && (window as unknown as { __SAFE_MODE__?: boolean }).__SAFE_MODE__);
}

export function markNavStart(to: string): void {
  if (!shouldRun()) return;
  if (typeof window !== 'undefined' && window.__NAV_START) {
    window.__NAV_START(to);
  }
  if (typeof performance !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log('[NAV] start ->', to, Math.round(performance.now()));
  }
}

export function markNavEnd(): void {
  if (!shouldRun()) return;
  if (typeof window !== 'undefined' && window.__NAV_END) {
    window.__NAV_END();
  }
  const path = typeof window !== 'undefined' && window.location ? window.location.pathname : '';
  if (typeof performance !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log('[NAV] end', path, Math.round(performance.now()));
  }
}
