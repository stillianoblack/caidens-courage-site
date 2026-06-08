import { useCallback, useEffect, useMemo, useState } from 'react';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { loadAssessmentResults } from '../lib/assessmentResultsService';
import { afterIdle } from '../lib/defer';
import {
  computeFamilyChildrenSummaries,
  type FamilyChildSummary,
} from '../lib/familyChildrenMetrics';
import {
  fetchStudentParticipantsFromSupabase,
  loadPilotTrackingData,
} from '../lib/pilotTrackingService';

export function useFamilyChildrenMetrics(programCode?: string) {
  const resolvedCode = programCode ?? readActivePilotProgram()?.programCode;
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState<FamilyChildSummary[]>([]);

  const refresh = useCallback(async () => {
    if (!resolvedCode?.trim()) {
      setChildren([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [participantsPayload, legacyPayload, trackingPayload] = await Promise.all([
        fetchStudentParticipantsFromSupabase(resolvedCode),
        loadAssessmentResults(resolvedCode),
        loadPilotTrackingData(resolvedCode),
      ]);

      setChildren(
        computeFamilyChildrenSummaries({
          programCode: resolvedCode,
          participants: participantsPayload.participants,
          moduleResults: trackingPayload.moduleResults,
          assessmentResults: trackingPayload.assessmentResults,
          legacyBaselines: legacyPayload.results,
        }),
      );
    } finally {
      setLoading(false);
    }
  }, [resolvedCode]);

  useEffect(() => {
    afterIdle(() => {
      void refresh();
    });
  }, [refresh]);

  const metrics = useMemo(() => children, [children]);

  return { children: metrics, loading, refresh };
}
