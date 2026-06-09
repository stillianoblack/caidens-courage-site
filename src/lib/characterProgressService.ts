import { listTrackedStudentModules } from '../data/moduleTrackingRegistry';
import type { MissionBoardItem } from '../types/missionBoard';
import type { LocalModuleResultRecord } from './pilotTrackingLocalStorage';
import { getProgressPercent, formatProgressLabel } from './familyProgressHelpers';

export type CharacterProgressSummary = {
  character: string;
  completedCount: number;
  totalCount: number;
  completedModuleIds: Set<string>;
  percent: number;
  statusLine: string;
  statusTone: 'available' | 'locked' | 'complete' | 'review';
};

function normalizeProgramCode(programCode?: string): string {
  return programCode?.trim().toUpperCase() ?? '';
}

export function filterModulesForActiveChild(
  modules: LocalModuleResultRecord[],
  participantId: string,
  programCode: string,
): LocalModuleResultRecord[] {
  const code = normalizeProgramCode(programCode);
  const id = participantId.trim();
  if (!id || !code) return [];

  return modules.filter(
    (row) =>
      row.participant_id?.trim() === id &&
      normalizeProgramCode(row.program_code) === code &&
      row.role === 'student',
  );
}

export function getCompletedModuleIds(
  modules: LocalModuleResultRecord[],
  character?: string,
): Set<string> {
  const ids = new Set<string>();
  modules.forEach((row) => {
    const rowCharacter = row.character?.trim().toLowerCase() ?? '';
    if (character && rowCharacter !== character.trim().toLowerCase()) return;
    if (row.module_id?.trim()) ids.add(row.module_id.trim());
  });
  return ids;
}

export function getCharacterProgress(
  character: string,
  modules: LocalModuleResultRecord[],
): CharacterProgressSummary {
  const tracked = listTrackedStudentModules().filter(
    (row) => row.character?.trim().toLowerCase() === character.trim().toLowerCase(),
  );
  const completedModuleIds = getCompletedModuleIds(modules, character);
  const completedCount = tracked.filter((row) => completedModuleIds.has(row.moduleId)).length;
  const totalCount = tracked.length;
  const percent = getProgressPercent(completedCount, totalCount);

  let statusLine = `${totalCount} Missions Available`;
  let statusTone: CharacterProgressSummary['statusTone'] = 'available';

  if (totalCount > 0 && completedCount >= totalCount) {
    statusLine = 'All missions complete';
    statusTone = 'complete';
  } else if (completedCount > 0) {
    statusLine = formatProgressLabel(completedCount, totalCount);
    statusTone = 'review';
  }

  console.info('[CHARACTER_PROGRESS]', {
    character,
    participant_modules: modules.length,
    completed_count: completedCount,
    total_count: totalCount,
    percent,
    completed_module_ids: Array.from(completedModuleIds),
  });

  return {
    character,
    completedCount,
    totalCount,
    completedModuleIds,
    percent,
    statusLine,
    statusTone,
  };
}

export function applyMissionBoardProgress(
  missions: MissionBoardItem[],
  completedModuleIds: Set<string>,
): MissionBoardItem[] {
  let foundActive = false;

  return missions.map((mission) => {
    if (completedModuleIds.has(mission.id)) {
      return { ...mission, status: 'completed' as const };
    }

    if (!foundActive) {
      foundActive = true;
      return { ...mission, status: 'active' as const };
    }

    return { ...mission, status: 'locked' as const };
  });
}

export function buildMirandaRank(completedCount: number, totalCount: number) {
  if (completedCount >= totalCount && totalCount > 0) {
    return { rankTitle: 'Master Detective', statusLine: 'All cases solved!' };
  }
  if (completedCount > 0) {
    return {
      rankTitle: 'Junior Detective',
      statusLine: `${completedCount} of ${totalCount} cases complete`,
    };
  }
  return { rankTitle: 'Junior Detective', statusLine: 'Start with File #1' };
}
