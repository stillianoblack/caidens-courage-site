import React from 'react';
import GameInteractionShell from '../game-assessment/shared/GameInteractionShell';
import type { GameUIPatternId } from '../../design-system/game/patterns/gameUIPatterns';
import MissionQuizLayout from './MissionQuizLayout';
import type { ComponentProps } from 'react';
import './shared-mission-game-layout.css';

export type SharedMissionGameLayoutProps = ComponentProps<typeof MissionQuizLayout> & {
  useCoachingRail?: boolean;
  patternId?: GameUIPatternId;
};

/** Shared gameplay layout wrapper — pattern tokens + coaching rail. */
export default function SharedMissionGameLayout({
  useCoachingRail = false,
  patternId,
  attachActionsToFeedback = false,
  ...props
}: SharedMissionGameLayoutProps) {
  return (
    <GameInteractionShell
      className={useCoachingRail ? 'shared-mission-game shared-mission-game--coachingRail' : 'shared-mission-game'}
      patternId={patternId}
      usePlayLayout={useCoachingRail}
    >
      <MissionQuizLayout
        {...props}
        patternId={patternId}
        attachActionsToFeedback={attachActionsToFeedback}
      />
    </GameInteractionShell>
  );
}
