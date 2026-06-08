import { useCallback, useEffect, useMemo, useState } from 'react';
import { loadAssessmentResults, type AssessmentResultsLoad } from '../lib/assessmentResultsService';
import { computePilotDashboardMetrics } from '../lib/pilotDashboardMetrics';

export function useAssessmentResults(refreshKey = 0, programCode?: string) {
  const [payload, setPayload] = useState<AssessmentResultsLoad>({
    results: [],
    source: 'local',
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const next = await loadAssessmentResults(programCode);
    console.log('[DASHBOARD] Final source passed to PilotLocalNote:', next.source);
    setPayload(next);
    setLoading(false);
  }, [programCode]);

  useEffect(() => {
    void refresh();
  }, [refresh, refreshKey]);

  const metrics = useMemo(
    () => computePilotDashboardMetrics(payload.results),
    [payload.results],
  );

  return {
    results: payload.results,
    source: payload.source,
    warning: payload.warning,
    loading,
    metrics,
    refresh,
  };
}
