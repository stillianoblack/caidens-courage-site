import { useCallback, useEffect, useState } from 'react';
import type { AdventureModuleRecord } from '../types/adventureModule';
import {
  fetchAdventureModules,
  fetchFamilyAdventureModules,
} from '../lib/adventureModuleService';
import { getFeaturedAdventure } from '../lib/getFeaturedAdventure';

type AdventureModuleScope = 'all' | 'family';

export function useAdventureModules(scope: AdventureModuleScope = 'all') {
  const [modules, setModules] = useState<AdventureModuleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result =
      scope === 'family' ? await fetchFamilyAdventureModules() : await fetchAdventureModules();
    setModules(result.modules);
    if (result.error) {
      setError(result.error);
      if (process.env.NODE_ENV === 'development') {
        console.error('[ADVENTURE_MODULES]', result.error);
      }
    } else {
      setError(null);
    }
    setLoading(false);
  }, [scope]);

  useEffect(() => {
    void refresh();

    const handleRefresh = () => {
      void refresh();
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void refresh();
      }
    };

    window.addEventListener('focus', handleRefresh);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleRefresh);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refresh]);

  const featuredModule = getFeaturedAdventure(modules);

  return { modules, activeModule: featuredModule, featuredModule, loading, error, refresh };
}

/** Family portal scoped fetch — active/scheduled adventures only. */
export function useFamilyAdventureModules() {
  return useAdventureModules('family');
}
