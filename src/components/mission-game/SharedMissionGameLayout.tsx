import React from 'react';
import GameInteractionShell from '../game-assessment/shared/GameInteractionShell';
import MissionQuizLayout from './MissionQuizLayout';
import type { ComponentProps } from 'react';
import './shared-mission-game-layout.css';

export type SharedMissionGameLayoutProps = ComponentProps<typeof MissionQuizLayout> & {
  useCoachingRail?: boolean;
};

/** Shared gameplay layout wrapper — left-aligned game column + coaching rail. */
export default function SharedMissionGameLayout({
  useCoachingRail = false,
  ...props
}: SharedMissionGameLayoutProps) {
  return (
    <GameInteractionShell
      className={useCoachingRail ? 'shared-mission-game shared-mission-game--coachingRail' : 'shared-mission-game'}
    >
      <MissionQuizLayout {...props} />
    </GameInteractionShell>
  );
}
