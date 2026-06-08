import { useCallback, useEffect, useState } from 'react';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { afterIdle } from '../lib/defer';
import { loadFamilyResults, type FamilyResultsLoad } from '../lib/familyResultsService';

const EMPTY: FamilyResultsLoad = { children: [], adults: [] };

export function useFamilyResults(programCode?: string) {
  const resolvedCode = programCode ?? readActivePilotProgram()?.programCode;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FamilyResultsLoad>(EMPTY);

  const refresh = useCallback(async () => {
    if (!resolvedCode?.trim()) {
      setData({ ...EMPTY, error: 'Missing active program context.' });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const payload = await loadFamilyResults(resolvedCode);
      setData(payload);
    } finally {
      setLoading(false);
    }
  }, [resolvedCode]);

  useEffect(() => {
    afterIdle(() => {
      void refresh();
    });
  }, [refresh]);

  return { data, loading, refresh, programCode: resolvedCode };
}
