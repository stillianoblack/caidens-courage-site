import type { GameAssessmentConfig } from '../../types/gameAssessment';
import { DR_VICTORIA_MISSION_1_CONFIG, DR_VICTORIA_MISSION_1_ID } from './drVictoriaMission1';
import { DR_VICTORIA_MISSION_2_CONFIG, DR_VICTORIA_MISSION_2_ID } from './drVictoriaMission2';
import { DR_VICTORIA_MISSION_3_CONFIG, DR_VICTORIA_MISSION_3_ID } from './drVictoriaMission3';
import { UNCLE_T_MISSION_1_CONFIG, UNCLE_T_MISSION_1_ID } from './uncleTMission1';
import { UNCLE_T_MISSION_2_CONFIG, UNCLE_T_MISSION_2_ID } from './uncleTMission2';
import { DR_VICTORIA_MISSION_4_CONFIG, DR_VICTORIA_MISSION_4_ID } from './drVictoriaMission4';
import { DR_VICTORIA_MISSION_5_CONFIG, DR_VICTORIA_MISSION_5_ID } from './drVictoriaMission5';
import { UNCLE_T_MISSION_3_CONFIG, UNCLE_T_MISSION_3_ID } from './uncleTMission3';

export { DR_VICTORIA_MISSION_1_CONFIG, DR_VICTORIA_MISSION_1_ID } from './drVictoriaMission1';
export { DR_VICTORIA_MISSION_2_CONFIG, DR_VICTORIA_MISSION_2_ID } from './drVictoriaMission2';
export { DR_VICTORIA_MISSION_3_CONFIG, DR_VICTORIA_MISSION_3_ID } from './drVictoriaMission3';
export { UNCLE_T_MISSION_1_CONFIG, UNCLE_T_MISSION_1_ID } from './uncleTMission1';
export { UNCLE_T_MISSION_2_CONFIG, UNCLE_T_MISSION_2_ID } from './uncleTMission2';
export { DR_VICTORIA_MISSION_4_CONFIG, DR_VICTORIA_MISSION_4_ID } from './drVictoriaMission4';
export { DR_VICTORIA_MISSION_5_CONFIG, DR_VICTORIA_MISSION_5_ID } from './drVictoriaMission5';
export { UNCLE_T_MISSION_3_CONFIG, UNCLE_T_MISSION_3_ID } from './uncleTMission3';
export { DR_VICTORIA_GUIDE_ID, DR_VICTORIA_LEARNING_HUB } from './drVictoriaHub';
export { UNCLE_T_GUIDE_ID, UNCLE_T_COACHING_HUB } from './uncleTHub';
export {
  getAdultGuideById,
  getAdultGuideMissionById,
  getAllAdultGuides,
} from './adultGuideRegistry';
export {
  DR_VICTORIA_FRAMEWORK,
  DR_VICTORIA_SERIES_AUDIENCE,
  DR_VICTORIA_SERIES_TITLE,
  buildDrVictoriaMissionConfig,
} from './drVictoriaMissionFramework';
export {
  UNCLE_T_FRAMEWORK,
  UNCLE_T_SERIES_AUDIENCE,
  UNCLE_T_SERIES_TITLE,
  buildUncleTMissionConfig,
} from './uncleTMissionFramework';
export {
  DR_VICTORIA_GUIDE_SRC,
  DR_VICTORIA_MISSION_AVATAR,
  UNCLE_T_GUIDE_SRC,
  UNCLE_T_MISSION_AVATAR,
} from './sharedAssets';

const DR_VICTORIA_MISSIONS: Record<string, GameAssessmentConfig> = {
  [DR_VICTORIA_MISSION_1_ID]: DR_VICTORIA_MISSION_1_CONFIG,
  [DR_VICTORIA_MISSION_2_ID]: DR_VICTORIA_MISSION_2_CONFIG,
  [DR_VICTORIA_MISSION_3_ID]: DR_VICTORIA_MISSION_3_CONFIG,
  [DR_VICTORIA_MISSION_4_ID]: DR_VICTORIA_MISSION_4_CONFIG,
  [DR_VICTORIA_MISSION_5_ID]: DR_VICTORIA_MISSION_5_CONFIG,
};

export function getDrVictoriaMissionById(missionId?: string) {
  if (!missionId) return null;
  const config = DR_VICTORIA_MISSIONS[missionId];
  if (!config) return null;
  return { id: missionId, config };
}

const UNCLE_T_MISSIONS: Record<string, GameAssessmentConfig> = {
  [UNCLE_T_MISSION_1_ID]: UNCLE_T_MISSION_1_CONFIG,
  [UNCLE_T_MISSION_2_ID]: UNCLE_T_MISSION_2_CONFIG,
  [UNCLE_T_MISSION_3_ID]: UNCLE_T_MISSION_3_CONFIG,
};

export function getUncleTMissionById(missionId?: string) {
  if (!missionId) return null;
  const config = UNCLE_T_MISSIONS[missionId];
  if (!config) return null;
  return { id: missionId, config };
}
