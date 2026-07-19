import type { B4AdaptiveMissionFile } from '../../types/b4AdaptiveQuest';

/** Dependency-neutral registry used by both runtime builders and audit tooling. */
export const B4_ADAPTIVE_MISSION_REGISTRY: Record<string, B4AdaptiveMissionFile> = {};

export function registerB4AdaptiveMission(mission: B4AdaptiveMissionFile): void {
  B4_ADAPTIVE_MISSION_REGISTRY[mission.id] = mission;
}

export function isB4AdaptiveMissionId(missionId: string): boolean {
  return missionId in B4_ADAPTIVE_MISSION_REGISTRY;
}
