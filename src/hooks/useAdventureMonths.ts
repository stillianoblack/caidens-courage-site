import { useCallback, useEffect, useState } from 'react';
import type { AdventureMonthRecord } from '../types/adventureMonth';
import { fetchAdventureMonths, fetchFamilyAdventureMonths } from '../lib/adventureMonthService';

type AdventureMonthsScope = 'all' | 'family';

const SESSION_CACHE_TTL_MS = 30_000;
const monthCache = new Map<
  AdventureMonthsScope,
  { data: AdventureMonthRecord[]; cachedAt: number }
>();
const monthRequests = new Map<
  AdventureMonthsScope,
  ReturnType<typeof fetchAdventureMonths>
>();

function loadMonths(scope: AdventureMonthsScope) {
  const pending = monthRequests.get(scope);
  if (pending) return pending;
  const request =
    scope === 'family' ? fetchFamilyAdventureMonths() : fetchAdventureMonths();
  monthRequests.set(scope, request);
  void request.finally(() => monthRequests.delete(scope));
  return request;
}

export function useAdventureMonths(scope: AdventureMonthsScope = 'family') {
  const cachedMonths = monthCache.get(scope)?.data;
  const [months, setMonths] = useState<AdventureMonthRecord[]>(cachedMonths ?? []);
  const [loading, setLoading] = useState(!cachedMonths);
  const [error, setError] = useState<string | null>(null);
  const [fromFallback, setFromFallback] = useState(false);

  const refresh = useCallback(async (force = false) => {
    const cached = monthCache.get(scope);
    if (!force && cached && Date.now() - cached.cachedAt < SESSION_CACHE_TTL_MS) {
      setMonths(cached.data);
      setLoading(false);
      return;
    }
    setLoading(!monthCache.has(scope));
    const result = await loadMonths(scope);
    monthCache.set(scope, { data: result.months, cachedAt: Date.now() });
    setMonths(result.months);
    setError(result.error ?? null);
    setFromFallback(Boolean(result.fromFallback));
    setLoading(false);
  }, [scope]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        void refresh(true);
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [refresh]);

  return { months, loading, error, fromFallback, refresh };
}
