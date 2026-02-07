/**
 * LaunchDarkly – non-blocking, client-only init (stub).
 *
 * RULES (apply when you add LaunchDarkly):
 * - Do NOT use waitForInitialization: true or any blocking await before render.
 * - Do NOT wrap the root in a provider that awaits LD client – that blocks navigation and causes EventSource timeouts.
 * - DO load the SDK only on the client: call init from runNonBlockingInit() in initNonBlockingSDK.ts (runs after idle).
 * - DO use bootstrap or defaultFlags so the UI shows immediately; let EventSource connect in the background.
 *
 * If you use launchdarkly-react-client-sdk:
 * - Use LDProvider with bootstrap option, or AsyncLDProvider with a short timeout and render children before ready.
 * - Or dynamically import the provider and render it only after init (so root layout never waits).
 *
 * If LaunchDarkly is injected via a script tag (e.g. Netlify): load that script only after idle, or ensure the script
 * does not use waitForInitialization / blocking init. This stub is a no-op until you add the package or wire your own init.
 */

export async function initLaunchDarklyNonBlocking(): Promise<void> {
  // Stub: no LaunchDarkly package in repo. When you add it:
  // 1. Dynamic import: const { initialize } = await import('launchdarkly-react-client-sdk');
  // 2. Call initialize({ clientSideID, bootstrap?: {...} });  // never waitForInitialization: true
  // 3. Call this from runNonBlockingInit() in initNonBlockingSDK.ts so it runs only after idle.
}
