import type { FocusFlameSceneId } from './FocusFlameGame';

export const MISSION_TITLE = 'Focus Flame Mission';

export const MISSION_GOAL_COPY = 'Complete all 3 adventures to unlock your certificate.';

export const MISSION_INTRO_B4 =
  'Welcome to the Focus Flame Mission. Help Caiden through all three adventures to unlock your certificate.';

export const SCENE_MISSION_ORDER: readonly FocusFlameSceneId[] = ['move', 'ceremony', 'cave'];

const LEVEL_BY_SCENE: Record<FocusFlameSceneId, number> = {
  move: 1,
  ceremony: 2,
  cave: 3,
};

export function sceneLevelNumber(sceneId: FocusFlameSceneId): number {
  return LEVEL_BY_SCENE[sceneId];
}

export function missionProgressCount(completedSceneIds: ReadonlySet<FocusFlameSceneId>): number {
  return completedSceneIds.size;
}

export function isMissionComplete(
  completedSceneIds: ReadonlySet<FocusFlameSceneId>,
  totalScenes: number
): boolean {
  return completedSceneIds.size >= totalScenes;
}

export type AdventureLevelStatus = 'completed' | 'current' | 'available';

export function adventureLevelStatus(
  sceneId: FocusFlameSceneId,
  completedSceneIds: ReadonlySet<FocusFlameSceneId>,
  inProgressSceneId: FocusFlameSceneId | null
): AdventureLevelStatus {
  if (completedSceneIds.has(sceneId)) return 'completed';
  if (inProgressSceneId === sceneId) return 'current';
  return 'available';
}

export type JourneyMissionStatus = 'Completed' | 'In progress' | 'Not started';

export function journeyMissionStatus(
  sceneId: FocusFlameSceneId,
  completedSceneIds: ReadonlySet<FocusFlameSceneId>,
  activeSceneId: FocusFlameSceneId | null
): JourneyMissionStatus {
  if (completedSceneIds.has(sceneId)) return 'Completed';
  if (activeSceneId === sceneId) return 'In progress';
  return 'Not started';
}
