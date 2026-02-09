/**
 * historyGuard – temporary instrumentation to detect unexpected history.replaceState usage.
 * Logs every replaceState call so we can see who is rewriting URLs.
 */

/* eslint-disable no-console */

export {};

declare global {
  interface Window {
    __historyGuardInstalled?: boolean;
  }
}

if (typeof window !== 'undefined' && typeof window.history !== 'undefined') {
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

