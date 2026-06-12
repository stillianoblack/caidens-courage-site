import type { GameAssessmentConfig } from '../../types/gameAssessment';
import type { ZekeGradeBand } from '../../types/zekeAdaptiveQuest';
import {
  buildZekeAdaptiveConfig,
  ZEKE_ADAPTIVE_MISSION_REGISTRY,
  getZekeDashboardDescription,
  isZekeAdaptiveMissionId,
} from './zekeAdaptiveBuilder';
import { ZEKE_ADAPTIVE_MISSION_FILES } from './zekeAdaptiveMissions';
import './zekeAdaptiveMissions';

export type ZekeMissionMeta = {
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

export const ZEKE_MISSIONS: ZekeMissionMeta[] = ZEKE_ADAPTIVE_MISSION_FILES.map((file) => ({
  id: file.id,
  missionNumber: file.missionNumber,
  title: file.title,
  subtitle: file.subtitle,
  description: file.gradeContent['2-3']?.dashboardDescription ?? file.storySetup,
  skills: file.skillFocus,
  skillArea: file.skillArea,
  reward: file.complete.badges?.[0] ?? 'Team Badge',
  adaptiveMissionId: file.id,
  config: buildZekeAdaptiveConfig(file, '2-3'),
}));

export function getZekeMissionById(id: string | undefined): ZekeMissionMeta | undefined {
  if (!id) return undefined;
  return ZEKE_MISSIONS.find((mission) => mission.id === id);
}

export function getZekeAdaptiveMission(missionId: string) {
  return ZEKE_ADAPTIVE_MISSION_REGISTRY[missionId];
}

export function resolveZekeMissionDescription(missionId: string, gradeBand: ZekeGradeBand): string {
  const file = getZekeAdaptiveMission(missionId);
  if (file) {
    return getZekeDashboardDescription(file, gradeBand);
  }
  return getZekeMissionById(missionId)?.description ?? '';
}

export function resolveZekeMissionConfig(
  missionId: string,
  gradeBand: ZekeGradeBand,
): GameAssessmentConfig | undefined {
  const mission = getZekeMissionById(missionId);
  if (!mission) return undefined;

  const adaptiveFile = getZekeAdaptiveMission(mission.adaptiveMissionId);
  if (adaptiveFile) {
    return buildZekeAdaptiveConfig(adaptiveFile, gradeBand);
  }

  return mission.config;
}

export function isZekeAdaptiveMission(missionId: string): boolean {
  return isZekeAdaptiveMissionId(missionId);
}

export function countAvailableZekeMissions(): number {
  return ZEKE_MISSIONS.length;
}

export {
  ZEKE_ADAPTIVE_MISSION_FILES,
  ZEKE_ADAPTIVE_MISSION_IDS,
  ZEKE_MISSION_1_ID,
  ZEKE_MISSION_2_ID,
  ZEKE_MISSION_3_ID,
  ZEKE_MISSION_4_ID,
  ZEKE_MISSION_5_ID,
  ZEKE_MISSION_6_ID,
  ZEKE_MISSION_7_ID,
  ZEKE_MISSION_8_ID,
} from './zekeAdaptiveMissions';

export {
  buildZekeAdaptiveConfig,
  getZekeMissionForParticipant,
  zekeContentVersionId,
} from './zekeAdaptiveBuilder';

export { ZEKE_HUB, ZEKE_HUB_PATH, ZEKE_AVATAR_SRC } from './sharedAssets';
