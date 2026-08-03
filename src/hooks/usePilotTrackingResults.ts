import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { loadAssessmentResults } from '../lib/assessmentResultsService';
import { computePilotTrackingMetrics, type PilotTrackingMetrics } from '../lib/pilotTrackingMetrics';
import { loadPilotDashboardTracking } from '../lib/pilotDashboardTrackingLoader';
import { buildParticipantNameLookup } from '../lib/pilotResultsDisplay';
import type { StudentFamilyLink } from '../lib/studentFamilyLinkService';
import {
  loadPilotTrackingData,
  type StudentParticipantRecord,
} from '../lib/pilotTrackingService';
import { resolveSyncWarningMessage } from '../lib/syncWarningMessages';

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
  const [familyWarning, setFamilyWarning] = useState<string | undefined>();
  const requestIdRef = useRef(0);
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
  const [familyLinks, setFamilyLinks] = useState<StudentFamilyLink[]>([]);

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    const code = programCode?.trim();
    if (!code) {
      setParticipants([]);
      setModuleResults([]);
      setAssessmentResults([]);
      setFamilyLinks([]);
      setWarning(undefined);
      setFamilyWarning(undefined);
      return;
    }

    setLoading(true);
    try {
      const { legacyPayload, trackingPayload, familyLinksPayload, directoryPayload } =
        await loadPilotDashboardTracking(code);

      if (requestId !== requestIdRef.current) return;

      if (process.env.NODE_ENV === 'development') {
        console.info('[PILOT_PARTICIPANT_LOOKUP]', {
          program_code: code,
          merged_participants: directoryPayload.participants.length,
          directory_errors: directoryPayload.errors,
        });
      }

      setLegacyResults(legacyPayload.results);
      setLegacySource(legacyPayload.source);
      setModuleResults(trackingPayload.moduleResults);
      setAssessmentResults(trackingPayload.assessmentResults);
      setParticipants(directoryPayload.participants);
      setFamilyLinks(familyLinksPayload.links);
      setTrackingSource(trackingPayload.source);
      setWarning(
        resolveSyncWarningMessage(
          directoryPayload.errors[0] ?? undefined,
        ) ?? undefined,
      );
      setFamilyWarning(
        legacyPayload.warning || trackingPayload.warning || familyLinksPayload.error
          ? 'We couldn’t load the latest guide snapshot. Your program tools are still available.'
          : undefined,
      );
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      setWarning('We couldn’t load the latest program details. Please refresh and try again.');
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [programCode]);

  useEffect(() => {
    if (!enabled || !programCode?.trim()) {
      return;
    }
    void refresh();
  }, [enabled, programCode, refresh, refreshKey]);

  const metrics = useMemo(
    (): PilotTrackingMetrics =>
      enabled
        ? computePilotTrackingMetrics({
            legacyBaselines: programCode?.trim() ? [] : legacyResults,
            moduleResults,
            assessmentV2: assessmentResults,
            participants,
          })
        : EMPTY_METRICS,
    [assessmentResults, enabled, legacyResults, moduleResults, participants, programCode],
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
    familyLinks,
    participantLookup,
    metrics,
    legacySource,
    trackingSource,
    source:
      (trackingSource === 'local' && legacySource === 'local' ? 'local' : 'supabase') as
        | 'supabase'
        | 'local',
    warning,
    familyWarning,
    loading: enabled && loading,
    refresh,
  };
}
