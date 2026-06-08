import React from 'react';
import GameInteractionShell from '../game-assessment/shared/GameInteractionShell';
import MissionQuizLayout from './MissionQuizLayout';
import type { ComponentProps } from 'react';
import './shared-mission-game-layout.css';

export type SharedMissionGameLayoutProps = ComponentProps<typeof MissionQuizLayout>;

/** Shared gameplay layout wrapper — centered column + scroll-safe quiz body. */
export default function SharedMissionGameLayout(props: SharedMissionGameLayoutProps) {
  return (
    <GameInteractionShell className="shared-mission-game">
      <MissionQuizLayout {...props} />
    </GameInteractionShell>
  );
}
