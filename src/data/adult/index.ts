import { DR_VICTORIA_MISSION_1_CONFIG, DR_VICTORIA_MISSION_1_ID } from './drVictoriaMission1';

export { DR_VICTORIA_MISSION_1_CONFIG, DR_VICTORIA_MISSION_1_ID } from './drVictoriaMission1';
export { DR_VICTORIA_GUIDE_SRC, DR_VICTORIA_MISSION_AVATAR } from './sharedAssets';

export function getDrVictoriaMissionById(missionId?: string) {
  if (missionId === DR_VICTORIA_MISSION_1_ID) {
    return { id: DR_VICTORIA_MISSION_1_ID, config: DR_VICTORIA_MISSION_1_CONFIG };
  }
  return null;
}
