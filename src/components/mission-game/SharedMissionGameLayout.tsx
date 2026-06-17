import React from 'react';
import GameInteractionShell from '../game-assessment/shared/GameInteractionShell';
import type { GameUIPatternId } from '../../design-system/game/patterns/gameUIPatterns';
import MissionQuizLayout from './MissionQuizLayout';
import type { ComponentProps } from 'react';
import './shared-mission-game-layout.css';
import '../../design-system/game/cinematic/cinematic-mission.css';

export type SharedMissionGameLayoutProps = ComponentProps<typeof MissionQuizLayout> & {
  useCoachingRail?: boolean;
  patternId?: GameUIPatternId;
  cinematicMode?: boolean;
};

/** Shared gameplay layout wrapper — pattern tokens + coaching rail + optional cinematic mode. */
export default function SharedMissionGameLayout({
  useCoachingRail = false,
  patternId,
  attachActionsToFeedback = false,
  cinematicMode = false,
  ...props
}: SharedMissionGameLayoutProps) {
  return (
    <GameInteractionShell
      className={[
        useCoachingRail ? 'shared-mission-game shared-mission-game--coachingRail' : 'shared-mission-game',
        cinematicMode ? 'shared-mission-game--cinematic' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      patternId={patternId}
      usePlayLayout={useCoachingRail}
    >
      <MissionQuizLayout
        {...props}
        cinematicMode={cinematicMode}
        patternId={patternId}
        attachActionsToFeedback={attachActionsToFeedback}
      />
    </GameInteractionShell>
  );
}
