import React from 'react';
import { CharacterMissionBoard } from '../mission-board';
import { MIRANDA_HUB } from '../../data/miranda';
import { MIRANDA_DETECTIVE_RANK, MIRANDA_MISSION_BOARD_ITEMS } from '../../data/miranda/missionBoardData';
import MirandaAvatar from './MirandaAvatar';

type MirandaMysteryFilesHubProps = {
  onSelectMission?: () => void;
};

export default function MirandaMysteryFilesHub({ onSelectMission }: MirandaMysteryFilesHubProps) {
  return (
    <CharacterMissionBoard
      className="characterMissionBoard--miranda"
      header={{
        eyebrow: MIRANDA_HUB.eyebrow,
        title: MIRANDA_HUB.title,
        subtitle: MIRANDA_HUB.subtitle,
        intro: MIRANDA_HUB.intro,
      }}
      missions={MIRANDA_MISSION_BOARD_ITEMS}
      rank={MIRANDA_DETECTIVE_RANK}
      avatar={<MirandaAvatar variant="hub" />}
      smartBack
      progressionHint="Start with File #1 — complete each case to unlock the next mystery."
      onSelectMission={() => onSelectMission?.()}
    />
  );
}
