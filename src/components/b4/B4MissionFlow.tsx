import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import GameAssessmentFlow from '../game-assessment/GameAssessmentFlow';
import {
  canPreviewMirandaGradeBand,
  readMirandaGradeBandPreviewParam,
  readParticipantGradeSettings,
} from '../../lib/mirandaGradeBandResolver';
import {
  getB4MissionById,
  isB4AdaptiveMission,
  resolveB4MissionConfig,
} from '../../data/b4';
import { b4ContentVersionId } from '../../data/b4/b4AdaptiveBuilder';
import { useB4GradeBand } from '../../hooks/useB4GradeBand';
import MirandaGradeBandPreview from '../miranda/MirandaGradeBandPreview';
import '../miranda/miranda-grade-band-preview.css';

type B4MissionFlowProps = {
  missionId: string;
  themeClassName?: string;
  exitPath: string;
  exitLabel?: string;
  embedded?: boolean;
  skipLanding?: boolean;
  familyPortalPath?: string;
};

export default function B4MissionFlow({
  missionId,
  themeClassName = 'b4-game',
  exitPath,
  exitLabel,
  embedded = false,
  skipLanding = false,
  familyPortalPath,
}: B4MissionFlowProps) {
  const location = useLocation();
  const mission = getB4MissionById(missionId);
  const gradeResolution = useB4GradeBand();
  const gradeSettings = readParticipantGradeSettings();

  const previewBand = useMemo(() => {
    if (!canPreviewMirandaGradeBand(location.pathname)) return null;
    return readMirandaGradeBandPreviewParam(location.search);
  }, [location.pathname, location.search]);

  const activeGradeBand = previewBand ?? gradeResolution.band;

  const config = useMemo(
    () => resolveB4MissionConfig(missionId, activeGradeBand),
    [missionId, activeGradeBand],
  );

  const completionContext = useMemo(() => {
    if (!isB4AdaptiveMission(missionId)) return undefined;
    return {
      gradeBandUsed: activeGradeBand,
      gradeLevelUsed: gradeSettings.gradeLevel ?? undefined,
      contentVersionId: b4ContentVersionId(missionId, activeGradeBand),
      fileId: missionId,
      missionId,
    };
  }, [activeGradeBand, gradeSettings.gradeLevel, missionId]);

  if (!mission || !config) {
    return null;
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
        useB4Header
        embedded={embedded}
        skipLanding={skipLanding}
        familyPortalPath={familyPortalPath}
        completionContext={completionContext}
      />
    </>
  );
}
