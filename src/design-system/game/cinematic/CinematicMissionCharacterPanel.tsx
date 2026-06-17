import React from 'react';
import { themeDataAttributes } from '../../kids-adventure/characterThemes';
import type { CinematicMissionCompanionMeta } from '../../../lib/cinematicMissionCompanion';
import type { CinematicCharacterAnimationState } from '../../../hooks/useCinematicCharacterAnimationState';

type CinematicMissionCharacterPanelProps = {
  companion: CinematicMissionCompanionMeta;
  characterState?: CinematicCharacterAnimationState;
  style?: React.CSSProperties;
};

/** Left rail — glass hero zone with transparent art and metadata below the character. */
export default function CinematicMissionCharacterPanel({
  companion,
  characterState = 'idle',
  style,
}: CinematicMissionCharacterPanelProps) {
  const artSrc = companion.heroArtSrc || companion.portraitSrc;

  return (
    <aside
      className="cinematicMissionCharacterPanel"
      data-character-state={characterState}
      {...themeDataAttributes(companion.characterId)}
      aria-label={`${companion.characterName} companion`}
      style={
        {
          ...style,
          '--cinematic-character-accent': companion.accentColor,
        } as React.CSSProperties
      }
    >
      <div className="cinematicMissionCharacterStage">
        <div className="cinematicMissionCharacterGlow" aria-hidden="true" />
        <div className="cinematicMissionCharacterArtWrap">
          <span className="cinematicMissionCharacterSparkle" aria-hidden="true" />
          <img
            src={artSrc}
            alt=""
            className="cinematicMissionCharacterArt"
            width={340}
            height={500}
            decoding="async"
          />
        </div>
      </div>
      <div className="cinematicMissionCharacterCopy">
        <p className="cinematicMissionCharacterName">{companion.characterName}</p>
        <p className="cinematicMissionCharacterFocus">Focus: {companion.focusLabel}</p>
        <p className="cinematicMissionCharacterMission">
          Mission: <span>{companion.missionTitle}</span>
        </p>
        <p className="cinematicMissionCharacterReward">{companion.rewardPreview}</p>
      </div>
    </aside>
  );
}
