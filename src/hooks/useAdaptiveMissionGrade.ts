import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  canPreviewMirandaGradeBand,
  readMirandaGradeBandPreviewParam,
} from '../lib/mirandaGradeBandResolver';
import { readActiveChildParticipantId } from '../config/activeChildParticipant';
import { useMirandaGradeBand } from './useMirandaGradeBand';
import type { AdaptiveQuestionSelectionContext } from '../lib/adaptiveQuestionSelection';
import type { MirandaGradeBand } from '../types/mirandaAdaptiveQuest';

export function useAdaptiveMissionGrade(participantId?: string) {
  const location = useLocation();
  const grade = useMirandaGradeBand(participantId);
  const resolvedParticipantId = participantId?.trim() || readActiveChildParticipantId();

  const previewBand = useMemo(() => {
    if (!canPreviewMirandaGradeBand(location.pathname)) return null;
    return readMirandaGradeBandPreviewParam(location.search);
  }, [location.pathname, location.search]);

  const baseBand = (previewBand ?? grade.baseBand) as MirandaGradeBand;
  const gradeReady = Boolean(previewBand) || !grade.loading;

  const selectionContext = useMemo<Omit<AdaptiveQuestionSelectionContext, 'missionId'>>(
    () => ({
      participantId: resolvedParticipantId,
      gradeLevel: grade.gradeLevel,
      gradeBand: grade.gradeBand,
      allowStretch: grade.allowStretch,
      previewBand: previewBand ?? null,
    }),
    [
      grade.allowStretch,
      grade.gradeBand,
      grade.gradeLevel,
      previewBand,
      resolvedParticipantId,
    ],
  );

  return {
    grade,
    previewBand,
    baseBand,
    gradeReady,
    selectionContext,
    participantId: resolvedParticipantId,
  };
}
