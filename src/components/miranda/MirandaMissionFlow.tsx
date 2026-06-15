import React, { useMemo } from 'react';
import GameAssessmentFlow from '../game-assessment/GameAssessmentFlow';
import {
  getMirandaMissionById,
  isMirandaAdaptiveMission,
  resolveMirandaMissionConfig,
} from '../../data/miranda';
import { mirandaContentVersionId } from '../../data/miranda/mirandaAdaptiveBuilder';
import { useAdaptiveMissionGrade } from '../../hooks/useAdaptiveMissionGrade';
import MirandaGradeBandPreview from './MirandaGradeBandPreview';
import GradeResolutionLoading from '../game-assessment/GradeResolutionLoading';
import './miranda-grade-band-preview.css';

type MirandaMissionFlowProps = {
  missionId: string;
  themeClassName?: string;
  exitPath: string;
  exitLabel?: string;
  useMirandaHeader?: boolean;
  embedded?: boolean;
  skipLanding?: boolean;
  familyPortalPath?: string;
};

export default function MirandaMissionFlow({
  missionId,
  themeClassName = 'miranda-game',
  exitPath,
  exitLabel,
  useMirandaHeader = true,
  embedded = false,
  skipLanding = false,
  familyPortalPath,
}: MirandaMissionFlowProps) {
  const mission = getMirandaMissionById(missionId);
  const { grade, previewBand, baseBand, gradeReady, selectionContext, participantId } =
    useAdaptiveMissionGrade();

  const config = useMemo(() => {
    if (!gradeReady) return null;
    return resolveMirandaMissionConfig(missionId, baseBand, selectionContext);
  }, [baseBand, gradeReady, missionId, selectionContext]);

  const completionContext = useMemo(() => {
    if (!isMirandaAdaptiveMission(missionId)) return undefined;
    const contentBand = config?.adaptiveMeta?.contentBand ?? baseBand;
    return {
      gradeBandUsed: contentBand,
      gradeLevelUsed: grade.gradeLevel ?? undefined,
      contentVersionId: mirandaContentVersionId(missionId, contentBand as typeof baseBand),
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
        useMirandaHeader={useMirandaHeader}
        embedded={embedded}
        skipLanding={skipLanding}
        familyPortalPath={familyPortalPath}
        completionContext={completionContext}
        gradeDiagnostics={gradeDiagnostics}
      />
    </>
  );
}
