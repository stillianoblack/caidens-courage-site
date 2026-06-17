import { useMemo } from 'react';
import type { GameAssessmentConfig } from '../types/gameAssessment';
import type { AdaptiveQuestionSelectionContext } from '../lib/adaptiveQuestionSelection';
import type { MirandaGradeBand } from '../types/mirandaAdaptiveQuest';
import { useAdaptiveMissionGrade } from './useAdaptiveMissionGrade';
import { useStableAdaptiveMissionConfig } from './useStableAdaptiveMissionConfig';
import type { GameQuestionGradeDiagnosticsProps } from '../components/game-assessment/GameQuestionGradeDiagnostics';

type ResolveAdaptiveMissionConfig = (
  missionId: string,
  baseBand: MirandaGradeBand,
  selectionContext: Omit<AdaptiveQuestionSelectionContext, 'missionId'>,
) => GameAssessmentConfig | undefined;

/**
 * Shared grade-band resolution + frozen mission config for kid adaptive missions.
 * Prevents mid-quiz remounts and question-set reshuffles during profile refresh.
 */
export function useAdaptiveMissionFlowConfig(
  missionId: string,
  resolveConfig: ResolveAdaptiveMissionConfig,
) {
  const { grade, previewBand, baseBand, gradeReady, selectionContext, participantId } =
    useAdaptiveMissionGrade();

  const resolvedConfig = useMemo(() => {
    if (!gradeReady) return null;
    return resolveConfig(missionId, baseBand, selectionContext);
  }, [baseBand, gradeReady, missionId, resolveConfig, selectionContext]);

  const config = useStableAdaptiveMissionConfig(resolvedConfig);

  const gradeDiagnostics = useMemo<GameQuestionGradeDiagnosticsProps>(
    () => ({
      participantId,
      gradeLevel: grade.gradeLevel,
      familyGradeBand: grade.gradeBand,
      baseBand: grade.baseBand,
      contentBand: config?.adaptiveMeta?.contentBand ?? baseBand,
      allowStretch: grade.allowStretch,
      usedStretch: config?.adaptiveMeta?.usedStretch ?? false,
    }),
    [
      baseBand,
      config?.adaptiveMeta?.contentBand,
      config?.adaptiveMeta?.usedStretch,
      grade.allowStretch,
      grade.baseBand,
      grade.gradeBand,
      grade.gradeLevel,
      participantId,
    ],
  );

  return {
    grade,
    previewBand,
    baseBand,
    config,
    gradeDiagnostics,
    participantId,
    loading: !config,
  };
}
