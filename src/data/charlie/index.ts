import type { GameAssessmentConfig } from '../../types/gameAssessment';
import { CHARLIE_MISSION_1_CONFIG, CHARLIE_MISSION_1_ID } from './charlieMission1';
import { CHARLIE_MISSION_2_CONFIG, CHARLIE_MISSION_2_ID } from './charlieMission2';

export type CharlieMissionMeta = {
  id: string;
  title: string;
  config: GameAssessmentConfig;
};

export const CHARLIE_MISSIONS: CharlieMissionMeta[] = [
  {
    id: CHARLIE_MISSION_1_ID,
    title: 'Turtle Trail Trouble',
    config: CHARLIE_MISSION_1_CONFIG,
  },
  {
    id: CHARLIE_MISSION_2_ID,
    title: 'Camp Critter Clues',
    config: CHARLIE_MISSION_2_CONFIG,
  },
];

export function getCharlieMissionById(id: string | undefined): CharlieMissionMeta | undefined {
  if (!id) return undefined;
  return CHARLIE_MISSIONS.find((mission) => mission.id === id);
}

export function countAvailableCharlieMissions(): number {
  return CHARLIE_MISSIONS.length;
}

export { CHARLIE_MISSION_1_ID, CHARLIE_MISSION_1_CONFIG } from './charlieMission1';
export { CHARLIE_MISSION_2_ID, CHARLIE_MISSION_2_CONFIG } from './charlieMission2';
export { CHARLIE_HUB, CHARLIE_HUB_PATH, CHARLIE_AVATAR_SRC } from './sharedAssets';
export { CHARLIE_HUB_MISSIONS } from './charlieHubData';
