import React, { useMemo } from 'react';
import { CharacterMissionBoard } from '../mission-board';
import { MIRANDA_HUB } from '../../data/miranda';
import { MIRANDA_MISSION_BOARD_ITEMS } from '../../data/miranda/missionBoardData';
import { useCharacterModuleProgress } from '../../hooks/useCharacterModuleProgress';
import {
  applyMissionBoardProgress,
  buildMirandaRank,
} from '../../lib/characterProgressService';
import MirandaAvatar from './MirandaAvatar';

type MirandaMysteryFilesHubProps = {
  onSelectMission?: () => void;
};

export default function MirandaMysteryFilesHub({ onSelectMission }: MirandaMysteryFilesHubProps) {
  const { progress } = useCharacterModuleProgress('miranda');

  const missions = useMemo(
    () => applyMissionBoardProgress(MIRANDA_MISSION_BOARD_ITEMS, progress.completedModuleIds),
    [progress.completedModuleIds],
  );

  const rank = useMemo(
    () => buildMirandaRank(progress.completedCount, progress.totalCount),
    [progress.completedCount, progress.totalCount],
  );

  return (
    <CharacterMissionBoard
      className="characterMissionBoard--miranda"
      header={{
        eyebrow: MIRANDA_HUB.eyebrow,
        title: MIRANDA_HUB.title,
        subtitle: MIRANDA_HUB.subtitle,
        intro: MIRANDA_HUB.intro,
      }}
      missions={missions}
      rank={rank}
      avatar={<MirandaAvatar variant="hub" />}
      smartBack
      progressionHint={
        progress.completedCount > 0
          ? `${progress.completedCount} of ${progress.totalCount} cases complete — keep solving!`
          : 'Start with File #1 — complete each case to unlock the next mystery.'
      }
      onSelectMission={() => onSelectMission?.()}
    />
  );
}
