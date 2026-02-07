import { initLaunchDarklyNonBlocking } from './launchDarklyNonBlocking';

/**
 * Non-blocking SDK / analytics initializer.
 * Run after first paint and when the browser is idle so the router and navigation
 * are never blocked. LaunchDarkly (and any SDK that uses EventSource) must NOT
 * use waitForInitialization: true or block the first render – init here only after idle.
 */

const runNonBlockingInit = (): void => {
  // LaunchDarkly: init only after idle; never use waitForInitialization: true.
  void initLaunchDarklyNonBlocking();
  // Add other analytics (gtag, Segment, etc.) here – they will not block navigation.
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
