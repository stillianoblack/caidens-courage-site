/**
 * Perf Detective – instrumentation to identify code paths blocking navigation.
 * Runs in production so we can capture real-world freezes.
 * Use __NAV_START(path) / __NAV_END() from navMarks or directly for router-level marks.
 */

const SAFE_MODE = (process.env.REACT_APP_SAFE_MODE ?? '1') === '1';

interface LongTaskRecord {
  name: string;
  startTime: number;
  duration: number;
  at: string;
  attribution?: unknown;
}

const longTasks: LongTaskRecord[] = [];
const NAV_STUCK_MS = 4000;

function observe(
  type: string,
  cb: (list: PerformanceObserverEntryList) => void
): PerformanceObserver | null {
  try {
    const o = new PerformanceObserver(cb);
    o.observe({ entryTypes: [type], buffered: true } as PerformanceObserverInit);
    return o;
  } catch {
    return null;
  }
}

export function installPerfDetective(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // eslint-disable-next-line no-console
  console.log('[PerfDetective] install', { safe: SAFE_MODE });

  // longtask – main-thread blocks
  observe('longtask', (list) => {
    const entries = list.getEntries() as PerformanceEntry[];
    for (const e of entries) {
      const entry = e as PerformanceEntry & { duration?: number; attribution?: unknown };
      const duration = entry.duration ?? 0;
      const startTime = entry.startTime ?? 0;
      const at = typeof window !== 'undefined' && window.location ? window.location.pathname : '';
      const record: LongTaskRecord = {
        name: entry.name ?? 'longtask',
        startTime,
        duration,
        at,
      };
      if (entry.attribution !== undefined) {
        record.attribution = entry.attribution;
      }
      longTasks.push(record);
      if (longTasks.length > 50) longTasks.shift();
      // eslint-disable-next-line no-console
      console.warn(
        '[LONGTASK]',
        Math.round(duration),
        'ms',
        'at',
        at,
        { startTime, duration, attribution: entry.attribution }
      );
    }
  });

  // largest-contentful-paint
  observe('largest-contentful-paint', (list) => {
    const entries = list.getEntries();
    const last = entries[entries.length - 1];
    if (last) {
      const lcp = last as PerformanceEntry & { renderTime?: number; loadTime?: number };
      // eslint-disable-next-line no-console
      console.log('[PerfDetective] LCP', {
        renderTime: lcp.renderTime,
        loadTime: lcp.loadTime,
        startTime: lcp.startTime,
      });
    }
  });

  // event timing (if available)
  observe('event', (list) => {
    const entries = list.getEntries();
    for (const e of entries) {
      const ev = e as PerformanceEntry & { duration?: number; processingStart?: number };
      const duration = ev.duration ?? 0;
      if (duration > 100) {
        // eslint-disable-next-line no-console
        console.warn('[PerfDetective] slow event', {
          name: ev.name,
          duration: Math.round(duration),
          startTime: ev.startTime,
          processingStart: ev.processingStart,
        });
      }
    }
  });

  // Global NAV watchdog (timer: number in browser, NodeJS.Timeout in Node; use permissive type)
  const navState: { active: boolean; to: string; t0: number; timer: number | ReturnType<typeof setTimeout> | null } = {
    active: false,
    to: '',
    t0: 0,
    timer: null,
  };

  (window as unknown as { __NAV_STATE?: typeof navState }).__NAV_STATE = navState;
  (window as unknown as { __NAV_START?: (to: string) => void }).__NAV_START = (to: string) => {
    navState.active = true;
    navState.to = to;
    navState.t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (navState.timer) clearTimeout(navState.timer);
    navState.timer = window.setTimeout(() => {
      const from = typeof window !== 'undefined' && window.location ? window.location.pathname : '';
      const dt = typeof performance !== 'undefined' ? performance.now() - navState.t0 : 0;
      // eslint-disable-next-line no-console
      console.error('[NAV STUCK >4s]', { from, to: navState.to, dt: Math.round(dt) });
      // eslint-disable-next-line no-console
      console.error('[Recent LONGTASKS]', longTasks.slice(-10));
    }, NAV_STUCK_MS) as unknown as number | ReturnType<typeof setTimeout> | null;
  };
  (window as unknown as { __NAV_END?: () => void }).__NAV_END = () => {
    if (!navState.active) return;
    const dt =
      typeof performance !== 'undefined' ? performance.now() - navState.t0 : 0;
    const path = typeof window !== 'undefined' && window.location ? window.location.pathname : '';
    // eslint-disable-next-line no-console
    console.log('[NAV DONE]', { path, dt: Math.round(dt) });
    navState.active = false;
    if (navState.timer) {
      clearTimeout(navState.timer);
      navState.timer = null;
    }
  };

  // Hard cleanup: unregister all service workers and wipe caches
  try {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((rs) => {
        rs.forEach((r) => r.unregister());
      });
    }
    if ('caches' in window) {
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
    }
  } catch {
    // ignore
  }
}
