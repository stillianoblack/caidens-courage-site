/**
 * Single LaunchDarkly client initializer.
 * No streaming (no EventSource); bootstrap from localStorage only.
 * Reads REACT_APP_LAUNCHDARKLY_CLIENT_ID from env; if missing, logs warning and returns null.
 */

import type { LDClient } from 'launchdarkly-js-client-sdk';

let cached: Promise<LDClient | null> | undefined;

const ANON_KEY = 'anonymous';

/**
 * Returns the LaunchDarkly client, initializing once with streaming disabled and
 * bootstrap from localStorage. If client ID is not set, returns null and logs a warning.
 */
export function getLDClient(): Promise<LDClient | null> {
  if (cached !== undefined) return cached;

  const clientId =
    typeof process !== 'undefined' && process.env?.REACT_APP_LAUNCHDARKLY_CLIENT_ID
      ? process.env.REACT_APP_LAUNCHDARKLY_CLIENT_ID
      : '';

  if (!clientId) {
    console.warn(
      '[LaunchDarkly] REACT_APP_LAUNCHDARKLY_CLIENT_ID is not set. LaunchDarkly is disabled.'
    );
    cached = Promise.resolve(null);
    return cached;
  }

  cached = (async (): Promise<LDClient | null> => {
    try {
      const ld = await import('launchdarkly-js-client-sdk');
      const client = ld.initialize(clientId, { key: ANON_KEY }, {
        streaming: false,
        bootstrap: 'localStorage',
      });
      return client;
    } catch (e) {
      console.warn('[LaunchDarkly] Failed to initialize:', e);
      return null;
    }
  })();

  return cached;
}
