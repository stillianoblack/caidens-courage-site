import { MIRANDA_MYSTERY_FILES_PATH } from '../../config/courageRoutes';
import { MIRANDA_MISSIONS, type MirandaMissionMeta } from './index';

export type MirandaNextCase = {
  mission: MirandaMissionMeta;
  label: string;
  path: string;
};

const NEXT_CASE_ICONS: Record<number, string> = {
  2: '🔍',
  3: '🔤',
  4: '📓',
  5: '👣',
  6: '🔍',
};

export function getMirandaMissionByFileNumber(fileNumber: number): MirandaMissionMeta | undefined {
  return MIRANDA_MISSIONS.find((mission) => mission.fileNumber === fileNumber);
}

export function getNextMirandaMission(currentMissionId: string): MirandaMissionMeta | undefined {
  const index = MIRANDA_MISSIONS.findIndex((mission) => mission.id === currentMissionId);
  if (index === -1 || index >= MIRANDA_MISSIONS.length - 1) return undefined;
  return MIRANDA_MISSIONS[index + 1];
}

export function getMirandaNextCase(currentMissionId: string): MirandaNextCase | null {
  const next = getNextMirandaMission(currentMissionId);
  if (!next) return null;

  const icon = NEXT_CASE_ICONS[next.fileNumber] ?? '🔍';
  return {
    mission: next,
    label: `${icon} Investigate File #${next.fileNumber}`,
    path: `${MIRANDA_MYSTERY_FILES_PATH}/${next.id}`,
  };
}

export const MIRANDA_RETURN_HUB_LABEL = '📂 Return to Mystery Files';

export function mirandaHubPath(): string {
  return MIRANDA_MYSTERY_FILES_PATH;
}
