import { useCallback, useEffect, useState } from 'react';
import type { AdventureMonthRecord } from '../types/adventureMonth';
import { fetchAdventureMonths, fetchFamilyAdventureMonths } from '../lib/adventureMonthService';

type AdventureMonthsScope = 'all' | 'family';

export function useAdventureMonths(scope: AdventureMonthsScope = 'family') {
  const [months, setMonths] = useState<AdventureMonthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromFallback, setFromFallback] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result =
      scope === 'family' ? await fetchFamilyAdventureMonths() : await fetchAdventureMonths();
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
      void refresh();
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
