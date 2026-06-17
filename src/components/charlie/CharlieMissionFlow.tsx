import React from 'react';
import {
  getCharlieMissionById,
  isCharlieAdaptiveMission,
  resolveCharlieMissionConfig,
} from '../../data/charlie';
import { charlieContentVersionId } from '../../data/charlie/charlieAdaptiveBuilder';
import AdaptiveMissionGameFlow from '../mission-game/AdaptiveMissionGameFlow';
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
  return (
    <AdaptiveMissionGameFlow
      characterId="charlie"
      missionId={missionId}
      missionExists={Boolean(getCharlieMissionById(missionId))}
      resolveConfig={resolveCharlieMissionConfig}
      isAdaptiveMission={isCharlieAdaptiveMission}
      contentVersionId={charlieContentVersionId}
      themeClassName={themeClassName}
      exitPath={exitPath}
      exitLabel={exitLabel}
      useCharlieHeader
      embedded={embedded}
      skipLanding={skipLanding}
      familyPortalPath={familyPortalPath}
    />
  );
}
