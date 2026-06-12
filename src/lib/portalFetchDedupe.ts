const inFlight = new Map<string, Promise<unknown>>();

/**
 * Coalesce concurrent portal data loads (e.g. multiple hooks on the same page).
 * Logs duplicate in-flight keys in development only.
 */
export async function dedupePortalFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const existing = inFlight.get(key);
  if (existing) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[portal-fetch] Reusing in-flight request: ${key}`);
    }
    return existing as Promise<T>;
  }

  const promise = fetcher().finally(() => {
    inFlight.delete(key);
  });
  inFlight.set(key, promise);
  return promise;
}
