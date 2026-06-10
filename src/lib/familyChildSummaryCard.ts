import {
  CHARACTER_IMAGE_PATHS,
  type FamilyCharacterId,
} from '../data/familyPortalContent';
import { listTrackedStudentModules } from '../data/moduleTrackingRegistry';
import type { LocalModuleResultRecord } from './pilotTrackingLocalStorage';

export function formatFamilyRelativeActivityDate(
  isoDate: string | null | undefined,
  now = new Date(),
): string {
  if (!isoDate?.trim()) return 'No activity yet';

  const then = new Date(isoDate);
  if (Number.isNaN(then.getTime())) return 'No activity yet';

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfThen = new Date(then);
  startOfThen.setHours(0, 0, 0, 0);
  const dayDiff = Math.floor((startOfToday.getTime() - startOfThen.getTime()) / 86_400_000);

  if (dayDiff <= 0) return 'Today';
  if (dayDiff === 1) return 'Yesterday';
  if (dayDiff >= 2 && dayDiff <= 6) return `${dayDiff} days ago`;
  if (dayDiff >= 7 && dayDiff <= 13) return 'Last week';
  if (dayDiff <= 27) return `${Math.floor(dayDiff / 7)} weeks ago`;

  return then.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function resolveChildModuleCounts(
  participantId: string | null,
  modules: LocalModuleResultRecord[],
): { completed: number; total: number } {
  const total = listTrackedStudentModules().length;
  if (!participantId) return { completed: 0, total };

  const completed = new Set(
    modules
      .filter((row) => row.participant_id === participantId)
      .map((row) => row.module_id),
  ).size;

  return { completed, total };
}

function normalizeCharacterKey(value?: string | null): FamilyCharacterId | null {
  const key = value?.trim().toLowerCase();
  if (!key) return null;
  if (key in CHARACTER_IMAGE_PATHS) return key as FamilyCharacterId;
  if (key === 'b-4') return 'b4';
  return null;
}

export function resolveFamilyChildAvatarSrc(input: {
  profileImageUrl?: string | null;
  participantId: string | null;
  moduleResults: LocalModuleResultRecord[];
}): string | null {
  if (input.profileImageUrl?.trim()) return input.profileImageUrl.trim();

  if (!input.participantId) return null;

  const latestModule = input.moduleResults
    .filter((row) => row.participant_id === input.participantId)
    .sort(
      (left, right) =>
        new Date(right.completed_at).getTime() - new Date(left.completed_at).getTime(),
    )[0];

  const characterKey = normalizeCharacterKey(latestModule?.character);
  if (characterKey) return CHARACTER_IMAGE_PATHS[characterKey];

  return null;
}

export function resolveChildDisplayInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}
