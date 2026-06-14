import { useCallback, useEffect, useState } from 'react';
import { readActiveChildParticipantId } from '../config/activeChildParticipant';
import { ACTIVE_CHILD_EVENT } from '../lib/activeChildContext';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { checkBaselineCompletion } from '../lib/baselineCompletion';
import type { LocalAssessmentV2Record } from '../lib/pilotTrackingLocalStorage';

export function useBaselineGate(
  participantId?: string,
  assessments?: LocalAssessmentV2Record[],
) {
  const program = readActivePilotProgram();
  const [activeParticipantId, setActiveParticipantId] = useState(
    () => participantId?.trim() || readActiveChildParticipantId(),
  );
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const resolvedId = participantId?.trim() || readActiveChildParticipantId();
    setActiveParticipantId(resolvedId);
    setLoading(true);
    const done = await checkBaselineCompletion(program?.programCode, resolvedId, assessments);
    setComplete(done);
    setLoading(false);
  }, [assessments, participantId, program?.programCode]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (
        event.key === 'activeChildParticipantId' ||
        event.key?.startsWith('caidens-courage-b4-baseline-check') ||
        event.key === 'caidens-courage-b4-baseline-results-archive'
      ) {
        void refresh();
      }
    };

    const onBaselineComplete = () => {
      void refresh();
    };

    const onActiveChild = () => {
      void refresh();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('cc-baseline-complete', onBaselineComplete);
    window.addEventListener(ACTIVE_CHILD_EVENT, onActiveChild);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('cc-baseline-complete', onBaselineComplete);
      window.removeEventListener(ACTIVE_CHILD_EVENT, onActiveChild);
    };
  }, [refresh]);

  return {
    complete,
    loading,
    participantId: activeParticipantId,
    programCode: program?.programCode,
    refresh,
  };
}
