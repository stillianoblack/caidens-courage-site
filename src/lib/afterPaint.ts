/**
 * Schedule non-critical work to run after first paint / when the browser is idle.
 * Used to ensure things like feature flags and chat widgets never block navigation.
 */

export function afterPaint(fn: () => void): number {
  if (typeof window === 'undefined') {
    return -1 as any;
  }

  const ric = (window as any).requestIdleCallback;
  if (typeof ric === 'function') {
    return ric(() => fn(), { timeout: 2000 });
  }

  return window.setTimeout(fn, 1200);
}

