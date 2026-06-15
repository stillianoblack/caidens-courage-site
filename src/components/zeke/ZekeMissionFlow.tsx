import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import GameAssessmentFlow from '../game-assessment/GameAssessmentFlow';
import {
  canPreviewMirandaGradeBand,
  readMirandaGradeBandPreviewParam,
  readParticipantGradeSettings,
} from '../../lib/mirandaGradeBandResolver';
import { readActiveChildParticipantId } from '../../config/activeChildParticipant';
import {
  getZekeMissionById,
  isZekeAdaptiveMission,
  resolveZekeMissionConfig,
} from '../../data/zeke';
import { zekeContentVersionId } from '../../data/zeke/zekeAdaptiveBuilder';
import { useZekeGradeBand } from '../../hooks/useZekeGradeBand';
import MirandaGradeBandPreview from '../miranda/MirandaGradeBandPreview';
import '../miranda/miranda-grade-band-preview.css';

type ZekeMissionFlowProps = {
  missionId: string;
  themeClassName?: string;
  exitPath: string;
  exitLabel?: string;
  embedded?: boolean;
  skipLanding?: boolean;
  familyPortalPath?: string;
};

export default function ZekeMissionFlow({
  missionId,
  themeClassName = 'zeke-game',
  exitPath,
  exitLabel,
  embedded = false,
  skipLanding = false,
  familyPortalPath,
}: ZekeMissionFlowProps) {
  const location = useLocation();
  const mission = getZekeMissionById(missionId);
  const gradeResolution = useZekeGradeBand();
  const gradeSettings = readParticipantGradeSettings();
  const participantId = readActiveChildParticipantId();

  const previewBand = useMemo(() => {
    if (!canPreviewMirandaGradeBand(location.pathname)) return null;
    return readMirandaGradeBandPreviewParam(location.search);
  }, [location.pathname, location.search]);

  const activeGradeBand = previewBand ?? gradeResolution.band;

  const config = useMemo(
    () =>
      resolveZekeMissionConfig(missionId, activeGradeBand, {
        participantId,
        gradeLevel: gradeSettings.gradeLevel,
      }),
    [activeGradeBand, gradeSettings.gradeLevel, missionId, participantId],
  );

  const completionContext = useMemo(() => {
    if (!isZekeAdaptiveMission(missionId)) return undefined;
    return {
      gradeBandUsed: activeGradeBand,
      gradeLevelUsed: gradeSettings.gradeLevel ?? undefined,
      contentVersionId: zekeContentVersionId(missionId, activeGradeBand),
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
        useZekeHeader
        embedded={embedded}
        skipLanding={skipLanding}
        familyPortalPath={familyPortalPath}
        completionContext={completionContext}
      />
    </>
  );
}
