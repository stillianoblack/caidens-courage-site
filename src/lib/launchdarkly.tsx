/**
 * LaunchDarkly – non-blocking, lazy, and scheduled after first paint.
 * UI renders immediately with defaultFlags; LD initializes in the background via dynamic import.
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { LDClient } from 'launchdarkly-js-client-sdk';
import { onIdle, safeOnce } from '../perf/defer';
import { SAFE_MODE } from './safeMode';

// Safe defaults so the app never shows a blank screen waiting for flags.
export const defaultFlags: Record<string, unknown> = {};

let clientRef: LDClient | null = null;
let cached: Promise<LDClient | null> | undefined;
let envWarned = false;

function getClientId(): string {
  let id = '';
  // Create React App: process.env.REACT_APP_* at build time
  if (typeof process !== 'undefined' && process.env?.REACT_APP_LAUNCHDARKLY_CLIENT_ID) {
    id = process.env.REACT_APP_LAUNCHDARKLY_CLIENT_ID;
  }
  // Vite: import.meta.env.VITE_* at build time
  if (!id && typeof import.meta !== 'undefined') {
    const viteEnv = (import.meta as unknown as { env?: { VITE_LAUNCHDARKLY_CLIENT_ID?: string } }).env;
    if (viteEnv?.VITE_LAUNCHDARKLY_CLIENT_ID) {
      id = viteEnv.VITE_LAUNCHDARKLY_CLIENT_ID;
    }
  }
  if (!id && !envWarned && !SAFE_MODE) {
    envWarned = true;
    console.warn(
      '[LaunchDarkly] Set REACT_APP_LAUNCHDARKLY_CLIENT_ID (Create React App) or VITE_LAUNCHDARKLY_CLIENT_ID (Vite) in your environment. LaunchDarkly is disabled; using default flags.'
    );
  }
  return id;
}

/**
 * Low-level initializer – dynamically imports the SDK and creates the client.
 * Never runs in SAFE_MODE; no streaming connection unless client id exists AND SAFE_MODE is false.
 */
export async function initLD(clientIdOverride?: string): Promise<LDClient | null> {
  if (SAFE_MODE) return null;
  const clientId = clientIdOverride ?? getClientId();
  if (!clientId) return null;

  try {
    const ld = await import('launchdarkly-js-client-sdk');
    const client = ld.initialize(
      clientId,
      { key: 'anonymous' },
      {
        streaming: false,
        bootstrap: 'localStorage',
      }
    );
    clientRef = client;
    return client;
  } catch (e) {
    if (!SAFE_MODE) console.warn('[LaunchDarkly] Failed to initialize:', e);
    return null;
  }
}

/**
 * Returns the LD client, initializing once in the background.
 * In SAFE_MODE returns a resolved null; no connection is ever opened.
 */
function getLDClient(): Promise<LDClient | null> {
  if (SAFE_MODE) return Promise.resolve(null);
  if (cached !== undefined) return cached;

  cached = initLD();
  return cached;
}

/**
 * Public entry point for app code.
 * In SAFE_MODE does nothing and never opens a connection.
 */
export function initLaunchDarkly(): void {
  if (typeof window === 'undefined') return;
  if (SAFE_MODE) {
    // eslint-disable-next-line no-console
    console.log('[LaunchDarkly] skipped (SAFE_MODE)');
    return;
  }

  (window as any).__INIT_FLAGS_QUEUED__ = true;

  safeOnce('launchdarkly-init', () => {
    (window as any).__INIT_FLAGS_RUNNING__ = true;
    onIdle(() => {
      void getLDClient()
        .catch(() => {})
        .finally(() => {
          (window as any).__INIT_FLAGS_RUNNING__ = false;
          (window as any).__INIT_FLAGS_DONE__ = true;
        });
    });
  });
}

/**
 * Returns the current value for a flag. Uses LD client if ready, otherwise defaultFlags.
 * Safe to call before LD is ready (returns default).
 */
export function getFlag(key: string): unknown {
  if (clientRef) return clientRef.variation(key, defaultFlags[key] as string | number | boolean);
  return defaultFlags[key];
}

// ——— Optional React context: re-render when LD is ready ———

type LaunchDarklyContextValue = {
  getFlag: (key: string) => unknown;
  isReady: boolean;
};

const LaunchDarklyContext = createContext<LaunchDarklyContextValue>({
  getFlag: (key: string) => defaultFlags[key],
  isReady: false,
});

export function useLaunchDarkly(): LaunchDarklyContextValue {
  return useContext(LaunchDarklyContext);
}

/**
 * Provider renders children immediately (no blocking). It starts LD init in useEffect
 * and updates context when the client is ready so components can re-render with real flags.
 */
export function LaunchDarklyProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [client, setClient] = useState<LDClient | null>(null);

  useEffect(() => {
    if (SAFE_MODE) return;
    getLDClient().then((c) => {
      setClient(c);
    });
  }, []);

  const getFlagCallback = useCallback((key: string): unknown => {
    if (client) return client.variation(key, defaultFlags[key] as string | number | boolean);
    return defaultFlags[key];
  }, [client]);

  const value: LaunchDarklyContextValue = {
    getFlag: getFlagCallback,
    isReady: client !== null,
  };

  return (
    <LaunchDarklyContext.Provider value={value}>
      {children}
    </LaunchDarklyContext.Provider>
  );
}
