/* Simple navigation watchdog for debugging.
 *
 * Enables console logs when the time from click -> location change exceeds 500ms.
 *
 * HOW TO USE:
 * - Set REACT_APP_DEBUG_NAV=1 in your env (or run with `REACT_APP_DEBUG_NAV=1 yarn start`).
 * - Open DevTools Console.
 * - Click between routes; if a navigation takes too long, you'll see:
 *     [navWatch] SLOW_NAV { from, to, ms }
 */

/* eslint-disable no-console */

import { SAFE_MODE } from '../lib/safeMode';

export {};

declare global {
  interface Window {
    __navWatchInit?: boolean;
  }
}

const DEBUG_ENABLED =
  typeof process !== 'undefined' &&
  typeof process.env !== 'undefined' &&
  process.env.REACT_APP_DEBUG_NAV === '1' &&
  process.env.NODE_ENV === 'development' &&
  !SAFE_MODE;

if (typeof window !== 'undefined' && typeof document !== 'undefined' && DEBUG_ENABLED) {
  if (!window.__navWatchInit) {
    window.__navWatchInit = true;

    try {
      const perf = window.performance;
      let lastClickTime = 0;
      let lastFrom = window.location.pathname + window.location.search + window.location.hash;

      const getPath = () =>
        window.location.pathname + window.location.search + window.location.hash;

      const clickListener = (event: MouseEvent) => {
        const target = event.target as HTMLElement | null;
        if (!target) return;

        const link = target.closest('a, [role="link"]') as HTMLElement | null;
        if (!link) return;

        lastClickTime = perf.now();
        lastFrom = getPath();
      };

      const maybeLogSlowNav = () => {
        if (!lastClickTime) return;
        const now = perf.now();
        const elapsed = now - lastClickTime;
        const to = getPath();

        if (elapsed > 500) {
          console.log('[navWatch] SLOW_NAV', {
            from: lastFrom,
            to,
            ms: Math.round(elapsed),
          });
        }

        lastClickTime = 0;
        lastFrom = to;
      };

      window.addEventListener('popstate', maybeLogSlowNav);

      const originalPushState = window.history.pushState.bind(window.history);
      window.history.pushState = function (
        data: any,
        unused: string,
        url?: string | URL | null
      ): void {
        originalPushState(data, unused, url as any);
        maybeLogSlowNav();
      };

      const originalReplaceState = window.history.replaceState.bind(window.history);
      window.history.replaceState = function (
        data: any,
        unused: string,
        url?: string | URL | null
      ): void {
        originalReplaceState(data, unused, url as any);
        maybeLogSlowNav();
      };

      document.addEventListener('click', clickListener, true);

      console.log('[navWatch] enabled');
    } catch (error) {
      console.warn('[navWatch] failed to initialize', error);
    }
  }
}

