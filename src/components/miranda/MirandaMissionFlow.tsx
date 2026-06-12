import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import GameAssessmentFlow from '../game-assessment/GameAssessmentFlow';
import {
  canPreviewMirandaGradeBand,
  readMirandaGradeBandPreviewParam,
} from '../../lib/mirandaGradeBandResolver';
import {
  getMirandaMissionById,
  isMirandaAdaptiveMission,
  resolveMirandaMissionConfig,
} from '../../data/miranda';
import { mirandaContentVersionId } from '../../data/miranda/mirandaAdaptiveBuilder';
import { useMirandaGradeBand } from '../../hooks/useMirandaGradeBand';
import MirandaGradeBandPreview from './MirandaGradeBandPreview';
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
  const location = useLocation();
  const mission = getMirandaMissionById(missionId);
  const gradeResolution = useMirandaGradeBand();

  const previewBand = useMemo(() => {
    if (!canPreviewMirandaGradeBand(location.pathname)) return null;
    return readMirandaGradeBandPreviewParam(location.search);
  }, [location.pathname, location.search]);

  const activeGradeBand = previewBand ?? gradeResolution.band;

  const config = useMemo(
    () => resolveMirandaMissionConfig(missionId, activeGradeBand),
    [missionId, activeGradeBand],
  );

  const completionContext = useMemo(() => {
    if (!isMirandaAdaptiveMission(missionId)) return undefined;
    return {
      gradeBandUsed: activeGradeBand,
      contentVersionId: mirandaContentVersionId(missionId, activeGradeBand),
      fileId: missionId,
      missionId,
    };
  }, [activeGradeBand, missionId]);

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
        useMirandaHeader={useMirandaHeader}
        embedded={embedded}
        skipLanding={skipLanding}
        familyPortalPath={familyPortalPath}
        completionContext={completionContext}
      />
    </>
  );
}
