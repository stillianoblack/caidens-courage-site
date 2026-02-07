import { initLaunchDarklyNonBlocking } from './launchDarklyNonBlocking';

/**
 * Non-blocking SDK initializer. LaunchDarkly is fully decoupled: no provider in the tree,
 * init runs after a 100ms global timeout so the site always proceeds without waiting.
 */

const SDK_INIT_DELAY_MS = 100;

const runNonBlockingInit = (): void => {
  void initLaunchDarklyNonBlocking();
};

/**
 * Schedules runNonBlockingInit after a 100ms global timeout. If LaunchDarkly (or any SDK)
 * doesn't respond instantly, the site has already rendered and navigation is unblocked.
 * Call once from App in a useEffect.
 */
export const scheduleNonBlockingSDK = (): (() => void) => {
  const t = setTimeout(runNonBlockingInit, SDK_INIT_DELAY_MS);
  return () => clearTimeout(t);
};
