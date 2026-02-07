/**
 * LaunchDarkly – zero-wait init. Use withLDProvider (not asyncWithLDProvider) so the app
 * renders immediately without waiting for the SDK to be "ready."
 *
 * REQUIRED when you add LaunchDarkly:
 * - Use withLDProvider, not asyncWithLDProvider – app renders immediately, no wait for flags.
 * - deferInitialization: true – SDK does not open EventSource until you explicitly start.
 * - startWaitSeconds: 0 and waitForInitialization: false – fail over to defaults instantly, no 5–10s hang.
 * - If LD is injected via <script>, add async and defer to that tag.
 *
 * To enable: add launchdarkly-react-client-sdk and REACT_APP_LAUNCHDARKLY_CLIENT_ID,
 * then uncomment the dynamic import and initialize() below.
 */

const LD_INIT_TIMEOUT_MS = 0;

/**
 * Initialize LaunchDarkly in the background. Zero wait: deferInitialization: true,
 * startWaitSeconds: 0, waitForInitialization: false so the site never hangs.
 */
export function initLaunchDarklyNonBlocking(): void {
  const run = async (): Promise<void> => {
    try {
      const clientId =
        typeof process !== 'undefined' && process.env?.REACT_APP_LAUNCHDARKLY_CLIENT_ID
          ? process.env.REACT_APP_LAUNCHDARKLY_CLIENT_ID
          : '';
      if (!clientId || LD_INIT_TIMEOUT_MS < 0) return;

      // When you add launchdarkly-react-client-sdk, uncomment below. Use withLDProvider (not asyncWithLDProvider).
      // Init options: deferInitialization: true, startWaitSeconds: 0, waitForInitialization: false – zero wait.
      // const mod = await import('launchdarkly-react-client-sdk').catch(() => null);
      // if (!mod?.initialize) return;
      // await mod.initialize({
      //   clientSideID: clientId,
      //   deferInitialization: true,
      //   startWaitSeconds: 0,
      //   waitForInitialization: false,
      // });
    } catch {
      // Proceed without LaunchDarkly.
    }
  };

  void run();
}
