import React, { useMemo } from 'react';
import GameAssessmentFlow from '../game-assessment/GameAssessmentFlow';
import {
  getCaidenQuestById,
  isCaidenAdaptiveQuest,
  resolveCaidenQuestConfig,
} from '../../data/caiden';
import { caidenContentVersionId } from '../../data/caiden/caidenAdaptiveBuilder';
import { useAdaptiveMissionGrade } from '../../hooks/useAdaptiveMissionGrade';
import MirandaGradeBandPreview from '../miranda/MirandaGradeBandPreview';
import GradeResolutionLoading from '../game-assessment/GradeResolutionLoading';
import '../miranda/miranda-grade-band-preview.css';

type CaidenQuestFlowProps = {
  questId: string;
  themeClassName?: string;
  exitPath: string;
  exitLabel?: string;
  embedded?: boolean;
  skipLanding?: boolean;
  familyPortalPath?: string;
};

export default function CaidenQuestFlow({
  questId,
  themeClassName = 'caiden-game',
  exitPath,
  exitLabel,
  embedded = false,
  skipLanding = false,
  familyPortalPath,
}: CaidenQuestFlowProps) {
  const quest = getCaidenQuestById(questId);
  const { grade, previewBand, baseBand, gradeReady, selectionContext, participantId } =
    useAdaptiveMissionGrade();

  const config = useMemo(() => {
    if (!gradeReady) return null;
    return resolveCaidenQuestConfig(questId, baseBand, selectionContext);
  }, [baseBand, gradeReady, questId, selectionContext]);

  const completionContext = useMemo(() => {
    if (!isCaidenAdaptiveQuest(questId)) return undefined;
    const contentBand = config?.adaptiveMeta?.contentBand ?? baseBand;
    return {
      gradeBandUsed: contentBand,
      gradeLevelUsed: grade.gradeLevel ?? undefined,
      contentVersionId: caidenContentVersionId(questId, contentBand as typeof baseBand),
      fileId: questId,
      missionId: questId,
    };
  }, [baseBand, config?.adaptiveMeta?.contentBand, grade.gradeLevel, questId]);

  const gradeDiagnostics = useMemo(
    () => ({
      participantId,
      gradeLevel: grade.gradeLevel,
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
      grade.gradeLevel,
      participantId,
    ],
  );

  if (!quest) {
    return null;
  }

  if (!gradeReady || !config) {
    return <GradeResolutionLoading />;
  }

  const showPreviewPill = Boolean(previewBand);

  return (
    <>
      {showPreviewPill && previewBand ? (
        <MirandaGradeBandPreview bandKey={previewBand} />
      ) : null}
      <GameAssessmentFlow
        config={config}
        themeClassName={themeClassName}
        exitPath={exitPath}
        exitLabel={exitLabel}
        useCaidenHeader
        embedded={embedded}
        skipLanding={skipLanding}
        familyPortalPath={familyPortalPath}
        completionContext={completionContext}
        gradeDiagnostics={gradeDiagnostics}
      />
    </>
  );
}
