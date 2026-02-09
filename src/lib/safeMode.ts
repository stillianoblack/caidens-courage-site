/**
 * SAFE MODE – central toggle to disable non-critical runtime work in production.
 *
 * Default: ON (REACT_APP_SAFE_MODE=1 or undefined).
 * Set REACT_APP_SAFE_MODE=0 in env to re-enable deferred features when stable.
 */

export const SAFE_MODE: boolean =
  (process.env.REACT_APP_SAFE_MODE ?? '1') === '1';

export function runAfterPaint(fn: () => void): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const run = () => {
    const idle = () => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(fn, { timeout: 1500 });
      } else {
        setTimeout(fn, 0);
      }
    };
    // Two RAFs to ensure we are past first paint.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(idle);
    });
  };

  if (document.readyState === 'complete') {
    run();
  } else {
    window.addEventListener('load', run, { once: true });
  }
}

