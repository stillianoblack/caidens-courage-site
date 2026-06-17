import React from 'react';
import CinematicMissionShell from './CinematicMissionShell';
import CharacterPanel from './CharacterPanel';
import MissionQuestionPanel from './MissionQuestionPanel';
import B4CoachPanel from './B4CoachPanel';
import type { CinematicMissionCompanionMeta } from '../../../lib/cinematicMissionCompanion';
import type { CinematicCharacterAnimationState } from '../../../hooks/useCinematicCharacterAnimationState';

type CinematicMissionLayoutProps = {
  backgroundSrc: string;
  backgroundSource?: string;
  companion: CinematicMissionCompanionMeta;
  questionKey?: string;
  characterState?: CinematicCharacterAnimationState;
  center: React.ReactNode;
  coach: React.ReactNode;
};

/**
 * Three-column cinematic mission layout — reusable across all kid character missions.
 * TODO(future): Skill/badge progression hooks in character + coach panels.
 */
export default function CinematicMissionLayout({
  backgroundSrc,
  backgroundSource,
  companion,
  questionKey,
  characterState = 'idle',
  center,
  coach,
}: CinematicMissionLayoutProps) {
  return (
    <CinematicMissionShell backgroundSrc={backgroundSrc} backgroundSource={backgroundSource}>
      <div className="cinematicMissionGrid">
        <CharacterPanel companion={companion} characterState={characterState} />
        <MissionQuestionPanel questionKey={questionKey}>{center}</MissionQuestionPanel>
        <B4CoachPanel>{coach}</B4CoachPanel>
      </div>
    </CinematicMissionShell>
  );
}
