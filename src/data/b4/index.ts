import type { GameAssessmentConfig } from '../../types/gameAssessment';
import type { B4GradeBand } from '../../types/b4AdaptiveQuest';
import {
  buildB4AdaptiveConfig,
  B4_ADAPTIVE_MISSION_REGISTRY,
  getB4DashboardDescription,
  isB4AdaptiveMissionId,
} from './b4AdaptiveBuilder';
import { B4_ADAPTIVE_MISSION_FILES } from './b4AdaptiveMissions';
import './b4AdaptiveMissions';

export type B4MissionMeta = {
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

export const B4_MISSIONS: B4MissionMeta[] = B4_ADAPTIVE_MISSION_FILES.map((file) => ({
  id: file.id,
  missionNumber: file.missionNumber,
  title: file.title,
  subtitle: file.subtitle,
  description: file.gradeContent['2-3']?.dashboardDescription ?? file.storySetup,
  skills: file.skillFocus,
  skillArea: file.skillArea,
  reward: file.complete.badges?.[0] ?? 'Focus Flame Badge',
  adaptiveMissionId: file.id,
  config: buildB4AdaptiveConfig(file, '2-3'),
}));

export function getB4MissionById(id: string | undefined): B4MissionMeta | undefined {
  if (!id) return undefined;
  return B4_MISSIONS.find((mission) => mission.id === id);
}

export function getB4AdaptiveMission(missionId: string) {
  return B4_ADAPTIVE_MISSION_REGISTRY[missionId];
}

export function resolveB4MissionDescription(missionId: string, gradeBand: B4GradeBand): string {
  const file = getB4AdaptiveMission(missionId);
  if (file) {
    return getB4DashboardDescription(file, gradeBand);
  }
  return getB4MissionById(missionId)?.description ?? '';
}

export function resolveB4MissionConfig(
  missionId: string,
  gradeBand: B4GradeBand,
): GameAssessmentConfig | undefined {
  const mission = getB4MissionById(missionId);
  if (!mission) return undefined;

  const adaptiveFile = getB4AdaptiveMission(mission.adaptiveMissionId);
  if (adaptiveFile) {
    return buildB4AdaptiveConfig(adaptiveFile, gradeBand);
  }

  return mission.config;
}

export function isB4AdaptiveMission(missionId: string): boolean {
  return isB4AdaptiveMissionId(missionId);
}

export function countAvailableB4Missions(): number {
  return B4_MISSIONS.length;
}

export {
  B4_ADAPTIVE_MISSION_FILES,
  B4_ADAPTIVE_MISSION_IDS,
  B4_RESERVED_MISSION_ROUTES,
  B4_MISSION_1_ID,
  B4_MISSION_2_ID,
  B4_MISSION_3_ID,
  B4_MISSION_4_ID,
  B4_MISSION_5_ID,
  B4_MISSION_6_ID,
  B4_MISSION_7_ID,
  B4_MISSION_8_ID,
} from './b4AdaptiveMissions';

export {
  buildB4AdaptiveConfig,
  getB4MissionForParticipant,
  b4ContentVersionId,
} from './b4AdaptiveBuilder';

export { B4_HUB, B4_HUB_PATH, B4_GAME_AVATAR_SRC } from './sharedAssets';

/** @deprecated Legacy static feeling finder — kept for old route/completions */
export { B4_FEELING_FINDER_ID, B4_FEELING_FINDER_CONFIG } from './b4FeelingFinder';
