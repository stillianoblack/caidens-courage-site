import { useCallback, useEffect, useMemo, useState } from 'react';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { afterIdle } from '../lib/defer';
import { loadAssessmentResults } from '../lib/assessmentResultsService';
import {
  computeFamilyProgressSnapshot,
  type FamilyProgressSnapshot,
} from '../lib/familyProgressMetrics';
import { loadPilotTrackingData } from '../lib/pilotTrackingService';

const EMPTY_SNAPSHOT = computeFamilyProgressSnapshot({ programCode: '' });

export function useFamilyProgressMetrics(programCode?: string) {
  const resolvedCode = programCode ?? readActivePilotProgram()?.programCode;
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<FamilyProgressSnapshot>(EMPTY_SNAPSHOT);

  const refresh = useCallback(async () => {
    if (!resolvedCode?.trim()) {
      setSnapshot(computeFamilyProgressSnapshot({ programCode: '' }));
      setLoading(false);
      return;
    }

    setLoading(true);
    const [legacyPayload, trackingPayload] = await Promise.all([
      loadAssessmentResults(resolvedCode),
      loadPilotTrackingData(resolvedCode),
    ]);

    setSnapshot(
      computeFamilyProgressSnapshot({
        programCode: resolvedCode,
        moduleResults: trackingPayload.moduleResults,
        assessmentResults: trackingPayload.assessmentResults,
        legacyBaselines: legacyPayload.results,
      }),
    );
    setLoading(false);
  }, [resolvedCode]);

  useEffect(() => {
    afterIdle(() => {
      void refresh();
    });
  }, [refresh]);

  const metrics = useMemo(() => snapshot, [snapshot]);

  return { metrics, loading, refresh };
}
