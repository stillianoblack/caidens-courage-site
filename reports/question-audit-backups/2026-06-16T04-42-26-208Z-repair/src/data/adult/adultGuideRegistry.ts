import type { GameAssessmentConfig } from '../../types/gameAssessment';
import type { AdultGuide } from '../../types/adultTraining';
import { DR_VICTORIA_LEARNING_HUB } from './drVictoriaHub';
import { DR_VICTORIA_MISSION_1_CONFIG, DR_VICTORIA_MISSION_1_ID } from './drVictoriaMission1';
import { DR_VICTORIA_MISSION_2_CONFIG, DR_VICTORIA_MISSION_2_ID } from './drVictoriaMission2';
import { DR_VICTORIA_MISSION_3_CONFIG, DR_VICTORIA_MISSION_3_ID } from './drVictoriaMission3';
import { DR_VICTORIA_MISSION_4_CONFIG, DR_VICTORIA_MISSION_4_ID } from './drVictoriaMission4';
import { DR_VICTORIA_MISSION_5_CONFIG, DR_VICTORIA_MISSION_5_ID } from './drVictoriaMission5';
import { UNCLE_T_COACHING_HUB } from './uncleTHub';
import { UNCLE_T_MISSION_1_CONFIG, UNCLE_T_MISSION_1_ID } from './uncleTMission1';
import { UNCLE_T_MISSION_2_CONFIG, UNCLE_T_MISSION_2_ID } from './uncleTMission2';
import { UNCLE_T_MISSION_3_CONFIG, UNCLE_T_MISSION_3_ID } from './uncleTMission3';

const ADULT_GUIDES: Record<string, AdultGuide> = {
  [DR_VICTORIA_LEARNING_HUB.id]: DR_VICTORIA_LEARNING_HUB,
  [UNCLE_T_COACHING_HUB.id]: UNCLE_T_COACHING_HUB,
};

const ADULT_GUIDE_MISSIONS: Record<string, Record<string, GameAssessmentConfig>> = {
  [DR_VICTORIA_LEARNING_HUB.id]: {
    [DR_VICTORIA_MISSION_1_ID]: DR_VICTORIA_MISSION_1_CONFIG,
    [DR_VICTORIA_MISSION_2_ID]: DR_VICTORIA_MISSION_2_CONFIG,
    [DR_VICTORIA_MISSION_3_ID]: DR_VICTORIA_MISSION_3_CONFIG,
    [DR_VICTORIA_MISSION_4_ID]: DR_VICTORIA_MISSION_4_CONFIG,
    [DR_VICTORIA_MISSION_5_ID]: DR_VICTORIA_MISSION_5_CONFIG,
  },
  [UNCLE_T_COACHING_HUB.id]: {
    [UNCLE_T_MISSION_1_ID]: UNCLE_T_MISSION_1_CONFIG,
    [UNCLE_T_MISSION_2_ID]: UNCLE_T_MISSION_2_CONFIG,
    [UNCLE_T_MISSION_3_ID]: UNCLE_T_MISSION_3_CONFIG,
  },
};

export function getAdultGuideById(guideId?: string): AdultGuide | null {
  if (!guideId) return null;
  return ADULT_GUIDES[guideId] ?? null;
}

export function getAllAdultGuides(): AdultGuide[] {
  return Object.values(ADULT_GUIDES);
}

export function getAdultGuideMissionById(guideId?: string, missionId?: string) {
  if (!guideId || !missionId) return null;
  const config = ADULT_GUIDE_MISSIONS[guideId]?.[missionId];
  if (!config) return null;
  return { guideId, missionId, config };
}

export { ADULT_GUIDE_MISSIONS };
