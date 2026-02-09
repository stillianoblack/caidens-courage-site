/**
 * historyGuard – temporary instrumentation to detect unexpected history.replaceState usage.
 * In production, OFF (no-op). Entry import is commented out; this guard is belt-and-suspenders.
 */

/* eslint-disable no-console */

import { allowPerfTools } from '../perf/prodGuards';

export {};

declare global {
  interface Window {
    __historyGuardInstalled?: boolean;
  }
}

// No-op in production so replaceState is never patched
const shouldInstall =
  typeof process !== 'undefined' &&
  process.env &&
  process.env.NODE_ENV !== 'production' &&
  allowPerfTools();

if (typeof window !== 'undefined' && typeof window.history !== 'undefined' && shouldInstall) {
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

