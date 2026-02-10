/**
 * Dev-only: when ?debug=1, patch setInterval/setTimeout/requestAnimationFrame
 * to count active handles. Expose getActiveCounts() for route-change logging.
 * No overhead when ?debug=1 is not in the URL.
 */

let installed = false;
let activeIntervals = 0;
let activeTimeouts = 0;
let rafPending = 0;

export function getActiveCounts(): { intervals: number; timeouts: number; rafPending: number } {
  return { intervals: activeIntervals, timeouts: activeTimeouts, rafPending };
}

function isDebug1(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return new URLSearchParams(window.location.search).get('debug') === '1';
  } catch {
    return false;
  }
}

export function installTimerDebug(): void {
  if (installed || typeof window === 'undefined') return;
  if (!isDebug1()) return;

  const origSetInterval = window.setInterval;
  const origSetTimeout = window.setTimeout;
  const origClearInterval = window.clearInterval;
  const origClearTimeout = window.clearTimeout;
  const origRAF = window.requestAnimationFrame;
  const origCancelRAF = window.cancelAnimationFrame;

  window.setInterval = function (handler: TimerHandler, timeout?: number, ...args: unknown[]) {
    activeIntervals += 1;
    const id = origSetInterval.apply(window, [handler, timeout, ...args] as unknown as Parameters<typeof setInterval>);
    return id as unknown as number;
  } as typeof setInterval;

  window.setTimeout = function (handler: TimerHandler, timeout?: number, ...args: unknown[]) {
    activeTimeouts += 1;
    const wrapped = () => {
      activeTimeouts = Math.max(0, activeTimeouts - 1);
      if (typeof handler === 'function') (handler as (...a: unknown[]) => void)(...args);
      // Pass-through for legacy string handler (rare)
      else if (typeof handler === 'string') {
        // eslint-disable-next-line no-eval
        eval(handler);
      }
    };
    const id = origSetTimeout.apply(window, [wrapped, timeout] as unknown as Parameters<typeof setTimeout>);
    return id as unknown as number;
  } as typeof setTimeout;

  window.clearInterval = function (
    intervalId?: string | number | ReturnType<typeof setInterval> | undefined
  ): void {
    if (intervalId != null) activeIntervals = Math.max(0, activeIntervals - 1);
    origClearInterval(intervalId as ReturnType<typeof setInterval>);
  };

  window.clearTimeout = function (
    timeoutId?: string | number | ReturnType<typeof setTimeout> | undefined
  ): void {
    if (timeoutId != null) activeTimeouts = Math.max(0, activeTimeouts - 1);
    origClearTimeout(timeoutId as ReturnType<typeof setTimeout>);
  };

  window.requestAnimationFrame = function (callback: FrameRequestCallback) {
    rafPending += 1;
    return origRAF.call(window, (time: number) => {
      rafPending = Math.max(0, rafPending - 1);
      callback(time);
    });
  };

  window.cancelAnimationFrame = function (id: number) {
    rafPending = Math.max(0, rafPending - 1);
    return origCancelRAF.call(window, id);
  };

  installed = true;
}
