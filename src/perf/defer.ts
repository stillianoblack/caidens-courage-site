/**
 * Helpers for deferring non-critical work until after first paint / idle.
 *
 * - afterFirstPaint(cb): runs cb on the next animation frame after the app has mounted.
 * - onIdle(cb): uses requestIdleCallback when available, with a 1500ms timeout fallback.
 * - safeOnce(key, cb): ensures cb only runs once per tab for the given key.
 */

type VoidFn = () => void;

const onceKeys = new Set<string>();

export function afterFirstPaint(cb: VoidFn): void {
  if (typeof window === 'undefined') return;

  // If we've already passed first paint, schedule to the next frame.
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    window.requestAnimationFrame(() => cb());
    return;
  }

  // Otherwise wait for DOMContentLoaded, then schedule.
  const handler = () => {
    window.removeEventListener('DOMContentLoaded', handler);
    window.requestAnimationFrame(() => cb());
  };

  window.addEventListener('DOMContentLoaded', handler);
}

export function onIdle(cb: VoidFn): void {
  if (typeof window === 'undefined') return;

  const ric = (window as any).requestIdleCallback as
    | ((fn: IdleRequestCallback, opts?: { timeout?: number }) => number)
    | undefined;

  if (typeof ric === 'function') {
    ric(
      () => {
        cb();
      },
      { timeout: 1500 }
    );
  } else {
    window.setTimeout(() => cb(), 1500);
  }
}

export function safeOnce(key: string, cb: VoidFn): void {
  if (onceKeys.has(key)) return;
  onceKeys.add(key);
  cb();
}

