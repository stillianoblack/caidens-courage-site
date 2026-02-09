/**
 * historyGuard – temporary instrumentation to detect unexpected history.replaceState usage.
 * In production, OFF unless ?debugPerf=1.
 */

/* eslint-disable no-console */

import { allowPerfTools } from '../perf/prodGuards';

export {};

declare global {
  interface Window {
    __historyGuardInstalled?: boolean;
  }
}

if (typeof window !== 'undefined' && typeof window.history !== 'undefined' && allowPerfTools()) {
  if (!window.__historyGuardInstalled && typeof window.history.replaceState === 'function') {
    window.__historyGuardInstalled = true;

    const orig = window.history.replaceState.bind(window.history);

    window.history.replaceState = function historyGuardReplaceState(
      ...args: Parameters<History['replaceState']>
    ): ReturnType<History['replaceState']> {
      try {
        console.warn('[historyGuard] replaceState called', args);
      } catch {
        // ignore logging failures
      }
      return orig.apply(window.history, args as any);
    } as any;
  }
}

