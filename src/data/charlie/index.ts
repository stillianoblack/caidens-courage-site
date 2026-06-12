import type { GameAssessmentConfig } from '../../types/gameAssessment';
import type { CharlieGradeBand } from '../../types/charlieAdaptiveQuest';
import {
  buildCharlieAdaptiveConfig,
  CHARLIE_ADAPTIVE_MISSION_REGISTRY,
  getCharlieDashboardDescription,
  isCharlieAdaptiveMissionId,
} from './charlieAdaptiveBuilder';
import { CHARLIE_ADAPTIVE_MISSION_FILES } from './charlieAdaptiveMissions';
import './charlieAdaptiveMissions';

export type CharlieMissionMeta = {
  id: string;
  missionNumber: number;
  title: string;
  subtitle: string;
  description: string;
  skills: string[];
  skillArea: string;
  reward: string;
  adaptiveMissionId: string;
  config: GameAssessmentConfig;
};

export const CHARLIE_MISSIONS: CharlieMissionMeta[] = CHARLIE_ADAPTIVE_MISSION_FILES.map((file) => ({
  id: file.id,
  missionNumber: file.missionNumber,
  title: file.title,
  subtitle: file.subtitle,
  description: file.gradeContent['2-3']?.dashboardDescription ?? file.storySetup,
  skills: file.skillFocus,
  skillArea: file.skillArea,
  reward: file.complete.badges?.[0] ?? 'Science Badge',
  adaptiveMissionId: file.id,
  config: buildCharlieAdaptiveConfig(file, '2-3'),
}));

export function getCharlieMissionById(id: string | undefined): CharlieMissionMeta | undefined {
  if (!id) return undefined;
  return CHARLIE_MISSIONS.find((mission) => mission.id === id);
}

export function getCharlieAdaptiveMission(missionId: string) {
  return CHARLIE_ADAPTIVE_MISSION_REGISTRY[missionId];
}

export function resolveCharlieMissionDescription(
  missionId: string,
  gradeBand: CharlieGradeBand,
): string {
  const file = getCharlieAdaptiveMission(missionId);
  if (file) {
    return getCharlieDashboardDescription(file, gradeBand);
  }
  return getCharlieMissionById(missionId)?.description ?? '';
}

export function resolveCharlieMissionConfig(
  missionId: string,
  gradeBand: CharlieGradeBand,
): GameAssessmentConfig | undefined {
  const mission = getCharlieMissionById(missionId);
  if (!mission) return undefined;

  const adaptiveFile = getCharlieAdaptiveMission(mission.adaptiveMissionId);
  if (adaptiveFile) {
    return buildCharlieAdaptiveConfig(adaptiveFile, gradeBand);
  }

  return mission.config;
}

export function isCharlieAdaptiveMission(missionId: string): boolean {
  return isCharlieAdaptiveMissionId(missionId);
}

export function countAvailableCharlieMissions(): number {
  return CHARLIE_MISSIONS.length;
}

export {
  CHARLIE_ADAPTIVE_MISSION_FILES,
  CHARLIE_ADAPTIVE_MISSION_IDS,
  CHARLIE_MISSION_1_ID,
  CHARLIE_MISSION_2_ID,
  CHARLIE_MISSION_3_ID,
  CHARLIE_MISSION_4_ID,
  CHARLIE_MISSION_5_ID,
  CHARLIE_MISSION_6_ID,
  CHARLIE_MISSION_7_ID,
  CHARLIE_MISSION_8_ID,
} from './charlieAdaptiveMissions';

export { CHARLIE_HUB, CHARLIE_HUB_PATH, CHARLIE_AVATAR_SRC } from './sharedAssets';

export {
  buildCharlieAdaptiveConfig,
  getCharlieMissionForParticipant,
  charlieContentVersionId,
} from './charlieAdaptiveBuilder';
