/* Route-level performance diagnostics for Caiden's Courage.
 *
 * CHECKLIST – how to use:
 * 1) Enable logging with the env flag:
 *      REACT_APP_PERF_LOG=true yarn start
 *    or add REACT_APP_PERF_LOG=true to your .env before build.
 * 2) Open DevTools Console.
 * 3) Click through routes in the header and watch for:
 *      [routePerf] NAV   // route transitions that took > 1000ms to render
 *      [routePerf] FETCH // network requests that took > 2000ms
 * 4) For each slow NAV log, note:
 *      - from / to path
 *      - total ms for the transition
 *      - any slowFetches attached to that navigation window.
 *
 * This file is imported for side effects only.
 * It is safe in production; it only runs when REACT_APP_PERF_LOG === 'true'.
 */

/* eslint-disable no-console */

import { SAFE_MODE } from '../lib/safeMode';

export {};

declare global {
  interface Window {
    __routePerfInit?: boolean;
  }
}

const PERF_ENABLED =
  typeof process !== 'undefined' &&
  typeof process.env !== 'undefined' &&
  process.env.REACT_APP_PERF_LOG === 'true' &&
  process.env.NODE_ENV === 'development' &&
  !SAFE_MODE;

if (typeof window !== 'undefined' && PERF_ENABLED && !window.__routePerfInit) {
  window.__routePerfInit = true;

  try {
    const perf = window.performance;

    type SlowFetch = { url: string; ms: number; error?: boolean };

    type PendingNav = {
      kind: 'pushState' | 'replaceState' | 'popstate';
      from: string;
      to: string;
      startTime: number;
      slowFetches: SlowFetch[];
      finished: boolean;
    };

    const getPath = () =>
      window.location.pathname + window.location.search + window.location.hash;

    let lastPath = getPath();
    let pendingNav: PendingNav | null = null;

    const maybeLogNav = () => {
      if (!pendingNav || pendingNav.finished) return;
      const now = perf.now();
      const total = now - pendingNav.startTime;
      pendingNav.finished = true;

      if (total > 1000) {
        console.log('[routePerf] NAV', {
          kind: pendingNav.kind,
          from: pendingNav.from,
          to: pendingNav.to,
          ms: Math.round(total),
          slowFetches: pendingNav.slowFetches,
        });
      }
    };

    const startNav = (kind: PendingNav['kind'], from: string, to: string) => {
      pendingNav = {
        kind,
        from,
        to,
        startTime: perf.now(),
        slowFetches: [],
        finished: false,
      };

      // Approximate "route rendered" as 2 frames after the navigation event.
      if (typeof window.requestAnimationFrame === 'function') {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(maybeLogNav);
        });
      } else {
        setTimeout(maybeLogNav, 1000);
      }
    };

    // Patch history methods to detect client-side navigation.
    const originalPushState = window.history.pushState.bind(window.history);
    window.history.pushState = function (
      data: any,
      unused: string,
      url?: string | URL | null
    ): void {
      const from = lastPath;
      originalPushState(data, unused, url as any);
      const to = getPath();
      lastPath = to;
      startNav('pushState', from, to);
    };

    const originalReplaceState = window.history.replaceState.bind(window.history);
    window.history.replaceState = function (
      data: any,
      unused: string,
      url?: string | URL | null
    ): void {
      const from = lastPath;
      originalReplaceState(data, unused, url as any);
      const to = getPath();
      lastPath = to;
      startNav('replaceState', from, to);
    };

    window.addEventListener('popstate', () => {
      const from = lastPath;
      const to = getPath();
      lastPath = to;
      startNav('popstate', from, to);
    });

    // Monkey-patch fetch to detect slow network calls and associate them with active navigations.
    if (typeof window.fetch === 'function') {
      const originalFetch: typeof window.fetch = window.fetch.bind(window);

      window.fetch = async function patchedFetch(
        input: RequestInfo | URL,
        init?: RequestInit
      ): Promise<Response> {
        const start = perf.now();
        const url =
          typeof input === 'string'
            ? input
            : input && typeof input === 'object' && 'url' in input
            ? (input as { url: string }).url
            : 'unknown';

        const recordSlowFetch = (ms: number, error?: boolean) => {
          if (ms <= 2000) return;
          const entry: SlowFetch = { url, ms: Math.round(ms) };
          if (error) entry.error = true;

          console.log(
            error ? '[routePerf] FETCH ERROR >2000ms' : '[routePerf] FETCH >2000ms',
            entry
          );

          if (pendingNav && !pendingNav.finished) {
            pendingNav.slowFetches.push(entry);
          }
        };

        try {
          const response = await originalFetch(input as any, init as any);
          const duration = perf.now() - start;
          recordSlowFetch(duration, false);
          return response;
        } catch (err) {
          const duration = perf.now() - start;
          recordSlowFetch(duration, true);
          throw err;
        }
      };
    }

    console.log('[routePerf] enabled');
  } catch (error) {
    console.warn('[routePerf] failed to initialize', error);
  }
}

