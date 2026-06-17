import React, { useMemo } from 'react';
import type { ComponentProps } from 'react';
import GameAssessmentFlow from '../game-assessment/GameAssessmentFlow';
import GradeResolutionLoading from '../game-assessment/GradeResolutionLoading';
import MirandaGradeBandPreview from '../miranda/MirandaGradeBandPreview';
import { useAdaptiveMissionFlowConfig } from '../../hooks/useAdaptiveMissionFlowConfig';
import type { GameAssessmentConfig } from '../../types/gameAssessment';
import type { AdaptiveQuestionSelectionContext } from '../../lib/adaptiveQuestionSelection';
import type { MirandaGradeBand } from '../../types/mirandaAdaptiveQuest';
import '../miranda/miranda-grade-band-preview.css';

export type AdaptiveMissionCharacterId = 'caiden' | 'miranda' | 'charlie' | 'zeke';

type AdaptiveMissionGameFlowProps = Omit<
  ComponentProps<typeof GameAssessmentFlow>,
  'config' | 'gradeDiagnostics' | 'completionContext'
> & {
  characterId: AdaptiveMissionCharacterId;
  missionId: string;
  missionExists: boolean;
  resolveConfig: (
    missionId: string,
    baseBand: MirandaGradeBand,
    selectionContext: Omit<AdaptiveQuestionSelectionContext, 'missionId'>,
  ) => GameAssessmentConfig | undefined;
  buildCompletionContext?: (input: {
    missionId: string;
    baseBand: MirandaGradeBand;
    contentBand: string;
    gradeLevel: string | null | undefined;
    contentVersionId: string;
  }) => ComponentProps<typeof GameAssessmentFlow>['completionContext'];
  contentVersionId?: (missionId: string, contentBand: MirandaGradeBand) => string;
  isAdaptiveMission?: (missionId: string) => boolean;
};

/**
 * Shared adaptive kid mission shell — grade band, frozen config, diagnostics, progression.
 */
export default function AdaptiveMissionGameFlow({
  characterId,
  missionId,
  missionExists,
  resolveConfig,
  buildCompletionContext,
  contentVersionId,
  isAdaptiveMission,
  ...gameProps
}: AdaptiveMissionGameFlowProps) {
  const { config, grade, previewBand, baseBand, gradeDiagnostics, loading } =
    useAdaptiveMissionFlowConfig(missionId, resolveConfig);

  const completionContext = useMemo(() => {
    if (!config || !isAdaptiveMission?.(missionId)) return undefined;
    const contentBand = config.adaptiveMeta?.contentBand ?? baseBand;
    const versionId = contentVersionId?.(missionId, contentBand as MirandaGradeBand) ?? '';
    const payload = {
      missionId,
      baseBand,
      contentBand,
      gradeLevel: grade.gradeLevel ?? undefined,
      contentVersionId: versionId,
    };
    if (buildCompletionContext) {
      return buildCompletionContext(payload);
    }
    return {
      gradeBandUsed: contentBand,
      gradeLevelUsed: grade.gradeLevel ?? undefined,
      contentVersionId: versionId,
      fileId: missionId,
      missionId,
    };
  }, [
    baseBand,
    buildCompletionContext,
    config,
    contentVersionId,
    grade.gradeLevel,
    isAdaptiveMission,
    missionId,
  ]);

  if (!missionExists) {
    return null;
  }

  if (loading || !config) {
    return <GradeResolutionLoading />;
  }

  return (
    <>
      {previewBand ? <MirandaGradeBandPreview bandKey={previewBand} /> : null}
      <GameAssessmentFlow
        {...gameProps}
        config={config}
        missionCharacterId={characterId}
        completionContext={completionContext}
        gradeDiagnostics={gradeDiagnostics}
      />
    </>
  );
}
