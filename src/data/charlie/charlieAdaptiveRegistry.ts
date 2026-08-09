import type { CharlieAdaptiveMissionFile } from '../../types/charlieAdaptiveQuest';

/** Dependency-neutral registry used by both runtime builders and audit tooling. */
export const CHARLIE_ADAPTIVE_MISSION_REGISTRY: Record<string, CharlieAdaptiveMissionFile> = {};

export function registerCharlieAdaptiveMission(mission: CharlieAdaptiveMissionFile): void {
  CHARLIE_ADAPTIVE_MISSION_REGISTRY[mission.id] = mission;
}

export function isCharlieAdaptiveMissionId(missionId: string): boolean {
  return missionId in CHARLIE_ADAPTIVE_MISSION_REGISTRY;
}
