import type { FocusFlameSceneId } from './FocusFlameGame';

export const MISSION_TITLE = 'Focus Flame Mission';

export const MISSION_GOAL_COPY = 'Complete all 3 adventures to unlock your certificate.';

export const MISSION_INTRO_B4 =
  'Welcome to the Focus Flame Mission. Help Caiden through all three adventures to unlock your certificate.';

export const SCENE_SELECT_B4_WELCOME =
  'Welcome to the Focus Flame Mission. Choose an adventure to help Caiden steady his flame.';

export const SCENE_SELECT_B4_CONTINUE =
  'Nice work. Choose another adventure to continue the mission.';

export const SCENE_SELECT_B4_MOBILE = 'Pick a mission to help Caiden.';

export const SCENE_SELECT_MOBILE_TITLE = 'Choose a mission';

/** Shorter scene-intro copy for mobile scene moment card. */
export const SCENE_MOMENT_MOBILE_COPY: Record<FocusFlameSceneId, string> = {
  move: 'Caiden steps into a new place. Everything feels different.',
  ceremony: 'Everyone is watching. Caiden’s flame starts to flicker.',
  cave: 'The cave is quiet. Caiden has to listen closely.',
};

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
