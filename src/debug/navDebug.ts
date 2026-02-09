/* Navigation performance diagnostics for Caiden's Courage.
 *
 * README:
 * - Logs are enabled automatically on production hostnames that include "caidenscourage.com".
 * - To enable logs locally, run the app with REACT_APP_DEBUG_NAV=1, e.g.:
 *     REACT_APP_DEBUG_NAV=1 yarn start
 *   or set REACT_APP_DEBUG_NAV=1 in a .env file.
 *
 * This module is imported for its side effects; it attaches listeners to:
 * - clicks on <a> / [role="link"]
 * - history.pushState / history.replaceState / popstate
 * - PerformanceObserver("longtask") where supported
 * - a heartbeat interval to detect event loop stalls
 *
 * It never throws: all failures are swallowed so production UX is safe.
 */

/* eslint-disable no-console */

export {};

declare global {
  interface Window {
    __navDebugInit?: boolean;
  }
}

function shouldEnableNavDebug(): boolean {
  if (typeof window === 'undefined') return false;

  const hostMatches = window.location.hostname.includes('caidenscourage.com');

  // Create React App inlines process.env.REACT_APP_* at build time.
  // Guard against process being undefined in non-Node environments.
  const hasDebugFlag =
    typeof process !== 'undefined' &&
    typeof process.env !== 'undefined' &&
    process.env.REACT_APP_DEBUG_NAV === '1';

  return hostMatches || hasDebugFlag;
}

function initNavDebug(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (!shouldEnableNavDebug()) return;

  if (window.__navDebugInit) return;
  window.__navDebugInit = true;

  try {
    const perf = window.performance;
    let lastClickTime = 0;
    let lastFromPath =
      window.location.pathname + window.location.search + window.location.hash;

    const getCurrentPath = () =>
      window.location.pathname + window.location.search + window.location.hash;

    const logNav = (kind: 'pushState' | 'replaceState' | 'popstate') => {
      if (!lastClickTime) return;
      const now = perf.now();
      const to = getCurrentPath();
      const ms = Math.round(now - lastClickTime);

      console.log('NAV', {
        kind,
        from: lastFromPath,
        to,
        ms,
      });

      // Reset so only the first nav after a click is logged.
      lastClickTime = 0;
      lastFromPath = to;
    };

    // Track the last click on <a> or [role="link"]
    const clickListener = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const link = target.closest('a, [role="link"]') as
        | HTMLAnchorElement
        | (HTMLElement & { href?: string })
        | null;
      if (!link) return;

      lastClickTime = perf.now();
      lastFromPath = getCurrentPath();
    };

    document.addEventListener('click', clickListener, true);

    // Monkey-patch history methods to detect route changes initiated by push/replace.
    const originalPushState = window.history.pushState.bind(window.history);
    window.history.pushState = function (
      data: any,
      unused: string,
      url?: string | URL | null
    ): void {
      originalPushState(data, unused, url as any);
      logNav('pushState');
    };

    const originalReplaceState = window.history.replaceState.bind(window.history);
    window.history.replaceState = function (
      data: any,
      unused: string,
      url?: string | URL | null
    ): void {
      originalReplaceState(data, unused, url as any);
      logNav('replaceState');
    };

    window.addEventListener('popstate', () => logNav('popstate'));

    // Long task detection via PerformanceObserver ("longtask") where available.
    const perfObserverSupported =
      typeof (window as any).PerformanceObserver !== 'undefined' &&
      typeof (window as any).PerformanceLongTaskTiming !== 'undefined';

    if (perfObserverSupported) {
      try {
        const LongTaskObserver = (window as any)
          .PerformanceObserver as typeof PerformanceObserver;
        const observer = new LongTaskObserver((list) => {
          for (const entry of list.getEntries() as any) {
            const duration = entry.duration as number;
            if (duration > 200) {
              console.log('LONGTASK', {
                name: entry.name,
                duration,
                startTime: entry.startTime,
              });
            }
          }
        });

        observer.observe({ entryTypes: ['longtask'] as any });
      } catch {
        // Ignore observer failures; debugging only.
      }
    }

    // Heartbeat to detect event loop stalls > 500ms beyond the expected interval.
    const HEARTBEAT_INTERVAL = 1000;
    let lastBeat = perf.now();

    setInterval(() => {
      const now = perf.now();
      const expectedNext = lastBeat + HEARTBEAT_INTERVAL;
      const delay = now - expectedNext;

      if (delay > 500) {
        console.log('EVENT_LOOP_BLOCK', {
          blockedMs: Math.round(delay),
        });
      }

      lastBeat = now;
    }, HEARTBEAT_INTERVAL);

    console.log('[navDebug] enabled');
  } catch (error) {
    // Swallow all errors – diagnostics should never break the app.
    console.warn('[navDebug] failed to initialize', error);
  }
}

// Initialize immediately on module load in the browser environment.
if (typeof window !== 'undefined') {
  // Use requestIdleCallback when available so we don't interfere with first paint.
  const start = () => initNavDebug();

  if (typeof (window as any).requestIdleCallback === 'function') {
    (window as any).requestIdleCallback(start, { timeout: 2000 });
  } else {
    setTimeout(start, 1500);
  }
}

