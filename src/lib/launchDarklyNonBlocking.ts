/**
 * LaunchDarkly – completely decoupled, non-blocking init with 100ms global timeout.
 *
 * REQUIRED when you add LaunchDarkly:
 * - deferInitialization: true (do not open EventSource until you explicitly start).
 * - Never waitForInitialization: true or any blocking await before render.
 * - No LDProvider in the root layout that waits for flags.
 * - If LD is injected via <script> in HTML, add async and defer to that tag.
 *
 * To enable: add launchdarkly-react-client-sdk and REACT_APP_LAUNCHDARKLY_CLIENT_ID,
 * then uncomment the dynamic import and initialize() below.
 */

const LD_INIT_TIMEOUT_MS = 100;

/**
 * Initialize LaunchDarkly in the background. If it doesn't respond within LD_INIT_TIMEOUT_MS,
 * the site proceeds without it so navigation is never blocked.
 * Uses deferInitialization: true and never waitForInitialization.
 */
export function initLaunchDarklyNonBlocking(): void {
  const run = async (): Promise<void> => {
    try {
      const clientId =
        typeof process !== 'undefined' && process.env?.REACT_APP_LAUNCHDARKLY_CLIENT_ID
          ? process.env.REACT_APP_LAUNCHDARKLY_CLIENT_ID
          : '';
      if (!clientId || LD_INIT_TIMEOUT_MS <= 0) return;

      // When you add launchdarkly-react-client-sdk, uncomment below. Pattern: 100ms timeout + deferInitialization: true, never waitForInitialization.
      // const mod = await Promise.race([
      //   import('launchdarkly-react-client-sdk').catch(() => null),
      //   new Promise<null>((r) => setTimeout(() => r(null), LD_INIT_TIMEOUT_MS)),
      // ]);
      // if (!mod?.initialize) return;
      // await Promise.race([
      //   mod.initialize({ clientSideID: clientId, deferInitialization: true }),
      //   new Promise((_, rej) => setTimeout(() => rej(new Error('LD timeout')), LD_INIT_TIMEOUT_MS)),
      // ]);
    } catch {
      // Proceed without LaunchDarkly.
    }
  };

  void run();
}
