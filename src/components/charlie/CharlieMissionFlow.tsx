import React, { useMemo } from 'react';
import GameAssessmentFlow from '../game-assessment/GameAssessmentFlow';
import {
  getCharlieMissionById,
  isCharlieAdaptiveMission,
  resolveCharlieMissionConfig,
} from '../../data/charlie';
import { charlieContentVersionId } from '../../data/charlie/charlieAdaptiveBuilder';
import { useAdaptiveMissionGrade } from '../../hooks/useAdaptiveMissionGrade';
import MirandaGradeBandPreview from '../miranda/MirandaGradeBandPreview';
import GradeResolutionLoading from '../game-assessment/GradeResolutionLoading';
import '../miranda/miranda-grade-band-preview.css';

type CharlieMissionFlowProps = {
  missionId: string;
  themeClassName?: string;
  exitPath: string;
  exitLabel?: string;
  embedded?: boolean;
  skipLanding?: boolean;
  familyPortalPath?: string;
};

export default function CharlieMissionFlow({
  missionId,
  themeClassName = 'charlie-game',
  exitPath,
  exitLabel,
  embedded = false,
  skipLanding = false,
  familyPortalPath,
}: CharlieMissionFlowProps) {
  const mission = getCharlieMissionById(missionId);
  const { grade, previewBand, baseBand, gradeReady, selectionContext, participantId } =
    useAdaptiveMissionGrade();

  const config = useMemo(() => {
    if (!gradeReady) return null;
    return resolveCharlieMissionConfig(missionId, baseBand, selectionContext);
  }, [baseBand, gradeReady, missionId, selectionContext]);

  const completionContext = useMemo(() => {
    if (!isCharlieAdaptiveMission(missionId)) return undefined;
    const contentBand = config?.adaptiveMeta?.contentBand ?? baseBand;
    return {
      gradeBandUsed: contentBand,
      gradeLevelUsed: grade.gradeLevel ?? undefined,
      contentVersionId: charlieContentVersionId(missionId, contentBand as typeof baseBand),
      fileId: missionId,
      missionId,
    };
  }, [baseBand, config?.adaptiveMeta?.contentBand, grade.gradeLevel, missionId]);

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

  if (!mission) {
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
        useCharlieHeader
        embedded={embedded}
        skipLanding={skipLanding}
        familyPortalPath={familyPortalPath}
        completionContext={completionContext}
        gradeDiagnostics={gradeDiagnostics}
      />
    </>
  );
}
