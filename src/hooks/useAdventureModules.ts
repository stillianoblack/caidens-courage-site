import { useCallback, useEffect, useState } from 'react';
import type { AdventureModuleRecord } from '../types/adventureModule';
import {
  fetchAdventureModules,
  fetchFamilyAdventureModules,
} from '../lib/adventureModuleService';
import { getFeaturedAdventure } from '../lib/getFeaturedAdventure';

type AdventureModuleScope = 'all' | 'family';

const SESSION_CACHE_TTL_MS = 30_000;
const moduleCache = new Map<
  AdventureModuleScope,
  { data: AdventureModuleRecord[]; cachedAt: number }
>();
const moduleRequests = new Map<
  AdventureModuleScope,
  ReturnType<typeof fetchAdventureModules>
>();

function loadModules(scope: AdventureModuleScope) {
  const pending = moduleRequests.get(scope);
  if (pending) return pending;
  const request =
    scope === 'family' ? fetchFamilyAdventureModules() : fetchAdventureModules();
  moduleRequests.set(scope, request);
  void request.finally(() => moduleRequests.delete(scope));
  return request;
}

export function useAdventureModules(scope: AdventureModuleScope = 'all') {
  const cachedModules = moduleCache.get(scope)?.data;
  const [modules, setModules] = useState<AdventureModuleRecord[]>(cachedModules ?? []);
  const [loading, setLoading] = useState(!cachedModules);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (force = false) => {
    const cached = moduleCache.get(scope);
    if (!force && cached && Date.now() - cached.cachedAt < SESSION_CACHE_TTL_MS) {
      setModules(cached.data);
      setLoading(false);
      return;
    }
    setLoading(!moduleCache.has(scope));
    const result = await loadModules(scope);
    moduleCache.set(scope, { data: result.modules, cachedAt: Date.now() });
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
      void refresh(true);
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void refresh(true);
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
