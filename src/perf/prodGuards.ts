/**
 * prodGuards – central gate for perf/debug tooling.
 *
 * In production builds this should safely return false so that optional
 * instrumentation (PerfDetective, historyGuard, navMarks) never runs unless
 * explicitly opted in via query params.
 */

/* eslint-disable no-console */

export function allowPerfTools(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const params = new URLSearchParams(window.location.search);
    const debugPerf = params.get('debugPerf') === '1' || params.get('perf') === '1';
    const debugNav = params.get('debugNav') === '1';

    // Enable tools only when explicitly requested via query params
    return debugPerf || debugNav;
  } catch {
    return false;
  }
}

