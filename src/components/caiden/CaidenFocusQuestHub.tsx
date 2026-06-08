import React from 'react';
import { CharacterMissionBoard } from '../mission-board';
import { CAIDEN_HUB, CAIDEN_STATUS_PILL, CAIDEN_AVATAR_SRC } from '../../data/caiden/sharedAssets';
import { CAIDEN_QUEST_BOARD_ITEMS, CAIDEN_QUEST_RANK } from '../../data/caiden/missionBoardData';
import CharacterAvatar from '../game-assessment/shared/CharacterAvatar';
import CaidenSkillTracker from './CaidenSkillTracker';
import '../focus-skills/focus-skills-snapshot.css';

export default function CaidenFocusQuestHub() {
  return (
    <>
      <CharacterMissionBoard
        className="characterMissionBoard--caiden"
        header={{
          eyebrow: CAIDEN_HUB.eyebrow,
          title: CAIDEN_HUB.title,
          subtitle: CAIDEN_HUB.subtitle,
          intro: CAIDEN_HUB.intro,
        }}
        missions={CAIDEN_QUEST_BOARD_ITEMS}
        rank={CAIDEN_QUEST_RANK}
        avatar={
          <CharacterAvatar src={CAIDEN_AVATAR_SRC} alt="Caiden" size="large" theme="caiden" />
        }
        smartBack
        statusPill={CAIDEN_STATUS_PILL}
        pathVariant="caiden"
      />
      <CaidenSkillTracker />
    </>
  );
}
