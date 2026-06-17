import React from 'react';
import {
  getZekeMissionById,
  isZekeAdaptiveMission,
  resolveZekeMissionConfig,
} from '../../data/zeke';
import { zekeContentVersionId } from '../../data/zeke/zekeAdaptiveBuilder';
import AdaptiveMissionGameFlow from '../mission-game/AdaptiveMissionGameFlow';
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
  return (
    <AdaptiveMissionGameFlow
      characterId="zeke"
      missionId={missionId}
      missionExists={Boolean(getZekeMissionById(missionId))}
      resolveConfig={resolveZekeMissionConfig}
      isAdaptiveMission={isZekeAdaptiveMission}
      contentVersionId={zekeContentVersionId}
      themeClassName={themeClassName}
      exitPath={exitPath}
      exitLabel={exitLabel}
      useZekeHeader
      embedded={embedded}
      skipLanding={skipLanding}
      familyPortalPath={familyPortalPath}
    />
  );
}
