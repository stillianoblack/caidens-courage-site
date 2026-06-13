import { useCallback, useEffect, useState } from 'react';
import type { AdventureModuleRecord } from '../types/adventureModule';
import {
  fetchAdventureModules,
  resolveActiveAdventureModule,
} from '../lib/adventureModuleService';

export function useAdventureModules() {
  const [modules, setModules] = useState<AdventureModuleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await fetchAdventureModules();
    setModules(result.modules);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const activeModule = resolveActiveAdventureModule(modules);

  return { modules, activeModule, loading, refresh };
}
