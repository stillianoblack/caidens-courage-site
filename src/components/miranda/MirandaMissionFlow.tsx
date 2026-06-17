import React from 'react';
import {
  getMirandaMissionById,
  isMirandaAdaptiveMission,
  resolveMirandaMissionConfig,
} from '../../data/miranda';
import { mirandaContentVersionId } from '../../data/miranda/mirandaAdaptiveBuilder';
import AdaptiveMissionGameFlow from '../mission-game/AdaptiveMissionGameFlow';
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
  return (
    <AdaptiveMissionGameFlow
      characterId="miranda"
      missionId={missionId}
      missionExists={Boolean(getMirandaMissionById(missionId))}
      resolveConfig={resolveMirandaMissionConfig}
      isAdaptiveMission={isMirandaAdaptiveMission}
      contentVersionId={mirandaContentVersionId}
      themeClassName={themeClassName}
      exitPath={exitPath}
      exitLabel={exitLabel}
      useMirandaHeader={useMirandaHeader}
      embedded={embedded}
      skipLanding={skipLanding}
      familyPortalPath={familyPortalPath}
    />
  );
}
