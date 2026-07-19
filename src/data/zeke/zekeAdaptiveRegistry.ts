import type { ZekeAdaptiveMissionFile } from '../../types/zekeAdaptiveQuest';

/** Dependency-neutral registry used by both runtime builders and audit tooling. */
export const ZEKE_ADAPTIVE_MISSION_REGISTRY: Record<string, ZekeAdaptiveMissionFile> = {};

export function registerZekeAdaptiveMission(mission: ZekeAdaptiveMissionFile): void {
  ZEKE_ADAPTIVE_MISSION_REGISTRY[mission.id] = mission;
}

export function isZekeAdaptiveMissionId(missionId: string): boolean {
  return missionId in ZEKE_ADAPTIVE_MISSION_REGISTRY;
}
