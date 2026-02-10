/**
 * Lightweight defer helpers for non-blocking navigation.
 * Use afterPaint for UI cleanup (menu close, scroll); use afterIdle for heavy work.
 */

export function afterPaint(fn: () => void): void {
  if (typeof window === 'undefined') return;
  window.requestAnimationFrame(() => window.requestAnimationFrame(fn));
}

export function afterIdle(fn: () => void): void {
  if (typeof window === 'undefined') return;
  if ('requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout?: number }) => number })
      .requestIdleCallback(fn, { timeout: 2000 });
  } else {
    setTimeout(fn, 1);
  }
}
