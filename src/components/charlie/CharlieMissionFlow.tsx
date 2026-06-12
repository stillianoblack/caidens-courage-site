import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import GameAssessmentFlow from '../game-assessment/GameAssessmentFlow';
import {
  canPreviewMirandaGradeBand,
  readMirandaGradeBandPreviewParam,
  readParticipantGradeSettings,
} from '../../lib/mirandaGradeBandResolver';
import {
  getCharlieMissionById,
  isCharlieAdaptiveMission,
  resolveCharlieMissionConfig,
} from '../../data/charlie';
import { charlieContentVersionId } from '../../data/charlie/charlieAdaptiveBuilder';
import { useMirandaGradeBand } from '../../hooks/useMirandaGradeBand';
import MirandaGradeBandPreview from '../miranda/MirandaGradeBandPreview';
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
  const location = useLocation();
  const mission = getCharlieMissionById(missionId);
  const gradeResolution = useMirandaGradeBand();
  const gradeSettings = readParticipantGradeSettings();

  const previewBand = useMemo(() => {
    if (!canPreviewMirandaGradeBand(location.pathname)) return null;
    return readMirandaGradeBandPreviewParam(location.search);
  }, [location.pathname, location.search]);

  const activeGradeBand = previewBand ?? gradeResolution.band;

  const config = useMemo(
    () => resolveCharlieMissionConfig(missionId, activeGradeBand),
    [missionId, activeGradeBand],
  );

  const completionContext = useMemo(() => {
    if (!isCharlieAdaptiveMission(missionId)) return undefined;
    return {
      gradeBandUsed: activeGradeBand,
      gradeLevelUsed: gradeSettings.gradeLevel ?? undefined,
      contentVersionId: charlieContentVersionId(missionId, activeGradeBand),
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
        useCharlieHeader
        embedded={embedded}
        skipLanding={skipLanding}
        familyPortalPath={familyPortalPath}
        completionContext={completionContext}
      />
    </>
  );
}
