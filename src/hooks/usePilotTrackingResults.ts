import { useCallback, useEffect, useMemo, useState } from 'react';
import { afterIdle } from '../lib/defer';
import { loadAssessmentResults } from '../lib/assessmentResultsService';
import { computePilotTrackingMetrics, type PilotTrackingMetrics } from '../lib/pilotTrackingMetrics';
import {
  buildParticipantNameLookup,
  collectParticipantIdsFromResults,
} from '../lib/pilotResultsDisplay';
import { fetchParticipantsByIds } from '../lib/studentFamilyLinkService';
import {
  fetchStudentParticipantsFromSupabase,
  loadPilotTrackingData,
  type StudentParticipantRecord,
} from '../lib/pilotTrackingService';

const EMPTY_METRICS = computePilotTrackingMetrics({
  legacyBaselines: [],
  moduleResults: [],
  assessmentV2: [],
});

export function usePilotTrackingResults(
  refreshKey = 0,
  programCode?: string,
  enabled = true,
) {
  const [loading, setLoading] = useState(false);
  const [legacySource, setLegacySource] = useState<'supabase' | 'local'>('supabase');
  const [trackingSource, setTrackingSource] = useState<'supabase' | 'local' | 'hybrid'>('supabase');
  const [warning, setWarning] = useState<string | undefined>();
  const [legacyResults, setLegacyResults] = useState<
    Awaited<ReturnType<typeof loadAssessmentResults>>['results']
  >([]);
  const [moduleResults, setModuleResults] = useState<
    Awaited<ReturnType<typeof loadPilotTrackingData>>['moduleResults']
  >([]);
  const [assessmentResults, setAssessmentResults] = useState<
    Awaited<ReturnType<typeof loadPilotTrackingData>>['assessmentResults']
  >([]);
  const [participants, setParticipants] = useState<StudentParticipantRecord[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [legacyPayload, trackingPayload, programParticipantsPayload] = await Promise.all([
        loadAssessmentResults(programCode),
        loadPilotTrackingData(programCode),
        programCode ? fetchStudentParticipantsFromSupabase(programCode) : Promise.resolve({ participants: [] }),
      ]);

      const orphanIds = collectParticipantIdsFromResults({
        moduleResults: trackingPayload.moduleResults,
        assessmentResults: trackingPayload.assessmentResults,
      }).filter(
        (id) => !programParticipantsPayload.participants.some((participant) => participant.id === id),
      );
      const orphanParticipantsPayload =
        orphanIds.length > 0
          ? await fetchParticipantsByIds(orphanIds)
          : { participants: [] as StudentParticipantRecord[] };

      setLegacyResults(legacyPayload.results);
      setLegacySource(legacyPayload.source);
      setModuleResults(trackingPayload.moduleResults);
      setAssessmentResults(trackingPayload.assessmentResults);
      setParticipants([
        ...programParticipantsPayload.participants,
        ...orphanParticipantsPayload.participants,
      ]);
      setTrackingSource(trackingPayload.source);
      setWarning(legacyPayload.warning ?? trackingPayload.warning);
    } finally {
      setLoading(false);
    }
  }, [programCode]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    afterIdle(() => {
      void refresh();
    });
  }, [enabled, refresh, refreshKey]);

  const metrics = useMemo(
    (): PilotTrackingMetrics =>
      enabled
        ? computePilotTrackingMetrics({
            legacyBaselines: legacyResults,
            moduleResults,
            assessmentV2: assessmentResults,
          })
        : EMPTY_METRICS,
    [assessmentResults, enabled, legacyResults, moduleResults],
  );

  const participantLookup = useMemo(
    () => buildParticipantNameLookup(participants),
    [participants],
  );

  return {
    legacyResults,
    moduleResults,
    assessmentResults,
    participants,
    participantLookup,
    metrics,
    legacySource,
    trackingSource,
    source:
      (trackingSource === 'local' && legacySource === 'local' ? 'local' : 'supabase') as
        | 'supabase'
        | 'local',
    warning,
    loading: enabled && loading,
    refresh,
  };
}
