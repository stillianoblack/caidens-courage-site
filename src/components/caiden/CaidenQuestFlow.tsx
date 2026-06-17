import React from 'react';
import {
  getCaidenQuestById,
  isCaidenAdaptiveQuest,
  resolveCaidenQuestConfig,
} from '../../data/caiden';
import { caidenContentVersionId } from '../../data/caiden/caidenAdaptiveBuilder';
import AdaptiveMissionGameFlow from '../mission-game/AdaptiveMissionGameFlow';
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
  return (
    <AdaptiveMissionGameFlow
      characterId="caiden"
      missionId={questId}
      missionExists={Boolean(getCaidenQuestById(questId))}
      resolveConfig={resolveCaidenQuestConfig}
      isAdaptiveMission={isCaidenAdaptiveQuest}
      contentVersionId={caidenContentVersionId}
      themeClassName={themeClassName}
      exitPath={exitPath}
      exitLabel={exitLabel}
      useCaidenHeader
      embedded={embedded}
      skipLanding={skipLanding}
      familyPortalPath={familyPortalPath}
    />
  );
}
