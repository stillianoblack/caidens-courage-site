import { useCallback, useEffect, useMemo, useState } from 'react';
import { loadAssessmentResults } from '../lib/assessmentResultsService';
import { computePilotTrackingMetrics, type PilotTrackingMetrics } from '../lib/pilotTrackingMetrics';
import { loadPilotTrackingData } from '../lib/pilotTrackingService';

export function usePilotTrackingResults(refreshKey = 0, programCode?: string) {
  const [loading, setLoading] = useState(true);
  const [legacySource, setLegacySource] = useState<'supabase' | 'local'>('local');
  const [trackingSource, setTrackingSource] = useState<'supabase' | 'local' | 'hybrid'>('local');
  const [warning, setWarning] = useState<string | undefined>();
  const [legacyResults, setLegacyResults] = useState<Awaited<ReturnType<typeof loadAssessmentResults>>['results']>([]);
  const [moduleResults, setModuleResults] = useState<
    Awaited<ReturnType<typeof loadPilotTrackingData>>['moduleResults']
  >([]);
  const [assessmentResults, setAssessmentResults] = useState<
    Awaited<ReturnType<typeof loadPilotTrackingData>>['assessmentResults']
  >([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [legacyPayload, trackingPayload] = await Promise.all([
      loadAssessmentResults(programCode),
      loadPilotTrackingData(programCode),
    ]);

    setLegacyResults(legacyPayload.results);
    setLegacySource(legacyPayload.source);
    setModuleResults(trackingPayload.moduleResults);
    setAssessmentResults(trackingPayload.assessmentResults);
    setTrackingSource(trackingPayload.source);
    setWarning(legacyPayload.warning ?? trackingPayload.warning);
    setLoading(false);
  }, [programCode]);

  useEffect(() => {
    void refresh();
  }, [refresh, refreshKey]);

  const metrics = useMemo(
    (): PilotTrackingMetrics =>
      computePilotTrackingMetrics({
        legacyBaselines: legacyResults,
        moduleResults,
        assessmentV2: assessmentResults,
      }),
    [assessmentResults, legacyResults, moduleResults],
  );

  return {
    legacyResults,
    moduleResults,
    assessmentResults,
    metrics,
    legacySource,
    trackingSource,
    source:
      (trackingSource === 'local' && legacySource === 'local' ? 'local' : 'supabase') as
        | 'supabase'
        | 'local',
    warning,
    loading,
    refresh,
  };
}
