import { initLaunchDarklyNonBlocking } from './launchDarklyNonBlocking';

/**
 * Non-blocking SDK initializer. LaunchDarkly is fully decoupled: no provider in the tree,
 * init runs with zero delay so the site never waits.
 */

const SDK_INIT_DELAY_MS = 0;

const runNonBlockingInit = (): void => {
  void initLaunchDarklyNonBlocking();
};

/**
 * Schedules runNonBlockingInit with zero delay (next tick). No wait timeout – site proceeds immediately.
 * Call once from App in a useEffect.
 */
export const scheduleNonBlockingSDK = (): (() => void) => {
  const t = setTimeout(runNonBlockingInit, SDK_INIT_DELAY_MS);
  return () => clearTimeout(t);
};
