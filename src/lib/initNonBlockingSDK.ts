/**
 * Non-blocking SDK / analytics initializer.
 * Run after first paint and when the browser is idle so the router and navigation
 * are never blocked. Use this for LaunchDarkly, analytics, or any script that
 * opens EventSource/long-lived connections (which can show as "canceled" during
 * client-side navigation if started too early).
 *
 * If you add LaunchDarkly (or similar), initialize it inside runNonBlockingInit
 * so it runs after the app has mounted and the first route has rendered.
 */

const runNonBlockingInit = (): void => {
  // Add any third-party SDK init here, e.g.:
  // - LaunchDarkly LDClient.init()
  // - Analytics (gtag, Segment, etc.)
  // They will run after idle and will not block navigation or cause premature canceled requests.
};

/**
 * Schedules runNonBlockingInit to run when the main thread is idle (or after a short timeout).
 * Call this once from the root component (e.g. App) in a useEffect.
 */
export const scheduleNonBlockingSDK = (): (() => void) => {
  let canceled = false;
  const run = () => {
    if (canceled) return;
    runNonBlockingInit();
  };
  if (typeof requestIdleCallback !== 'undefined') {
    const id = requestIdleCallback(run, { timeout: 2500 });
    return () => {
      canceled = true;
      cancelIdleCallback(id);
    };
  }
  const t = setTimeout(run, 500);
  return () => {
    canceled = true;
    clearTimeout(t);
  };
};
