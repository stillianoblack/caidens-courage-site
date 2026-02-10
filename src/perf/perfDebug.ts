/**
 * Performance debug mode: only active when URL has ?perf=1.
 * - Long task observer (duration, startTime, attribution if supported)
 * - Route-change timings: [route] then [route-painted] after double rAF
 * - Top 10 resources by size after each route change
 * Zero impact when ?perf=1 is not present (module is loaded only when param is set).
 */

const PERF_PARAM = 'perf';

function isPerfEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return new URLSearchParams(window.location.search).get(PERF_PARAM) === '1';
  } catch {
    return false;
  }
}

function logLongTask(entry: PerformanceEntry & { attribution?: Array<{ name?: string; scriptURL?: string }> }): void {
  const duration = 'duration' in entry ? (entry as PerformanceEntry & { duration: number }).duration : 0;
  const startTime = entry.startTime ?? 0;
  const payload: Record<string, unknown> = { duration: Math.round(duration), startTime: Math.round(startTime) };
  const attr = (entry as PerformanceEntry & { attribution?: unknown[] }).attribution;
  if (attr && Array.isArray(attr) && attr.length > 0) {
    payload.attribution = attr.map((a: { name?: string; scriptURL?: string }) => ({
      name: a?.name,
      scriptURL: a?.scriptURL,
    }));
  }
  if (typeof console !== 'undefined' && console.log) {
    console.log('[longtask]', payload);
  }
}

function startLongTaskObserver(): void {
  if (typeof PerformanceObserver === 'undefined') return;
  try {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => logLongTask(entry as Parameters<typeof logLongTask>[0]));
    });
    observer.observe({ type: 'longtask', buffered: true });
  } catch {
    // longtask not supported
  }
}

function logTopResources(limit = 10): void {
  if (typeof performance === 'undefined' || typeof performance.getEntriesByType !== 'function') return;
  try {
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const withSize = entries.map((e) => ({
      name: e.name,
      size: e.transferSize ?? e.decodedBodySize ?? 0,
    }));
    withSize.sort((a, b) => b.size - a.size);
    const top = withSize.slice(0, limit);
    if (typeof console !== 'undefined' && console.log) {
      console.log('[route-resources]', top.map((t) => ({ name: t.name, size: t.size })));
    }
  } catch {
    // ignore
  }
}

function scheduleAfterPaint(fn: () => void): void {
  if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(() => requestAnimationFrame(fn));
  } else {
    setTimeout(fn, 0);
  }
}

/**
 * Call this when the route pathname changes. Logs [route], then after next paint [route-painted] and top resources.
 */
export function onRouteChange(pathname: string): void {
  if (!isPerfEnabled()) return;
  const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
  if (typeof console !== 'undefined' && console.log) {
    console.log('[route]', pathname, 'at', t0);
  }
  scheduleAfterPaint(() => {
    const elapsed = (typeof performance !== 'undefined' ? performance.now() : 0) - t0;
    if (typeof console !== 'undefined' && console.log) {
      console.log('[route-painted]', pathname, `${Math.round(elapsed)}ms`);
    }
    logTopResources(10);
  });
}

/**
 * Enable perf debug: longtask observer and install route callback on window so App can call it.
 * Only run when ?perf=1. Call once after dynamic import.
 */
export function enablePerfDebug(): void {
  if (!isPerfEnabled()) return;
  startLongTaskObserver();
  if (typeof window !== 'undefined') {
    (window as unknown as { __PERF_DEBUG_ON_ROUTE__?: (pathname: string) => void }).__PERF_DEBUG_ON_ROUTE__ = onRouteChange;
  }
}
