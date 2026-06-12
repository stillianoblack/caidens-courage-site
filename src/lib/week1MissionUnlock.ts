/** Set CAMP_PILOT_UNLOCK_ALL to false after pilot if we want progressive unlocking. */
export const CAMP_PILOT_UNLOCK_ALL = true;

export type Week1MissionUnlockState = {
  unlocked: boolean;
  reason: string;
};

const WEEK1_STARTER_MISSION_IDS = [
  'caiden-courage-in-the-dark',
  'miranda-mystery',
  'b4-self-check-in',
] as const;

export const WEEK1_MISSION_IDS = [
  ...WEEK1_STARTER_MISSION_IDS,
  'zeke-bridge-challenge',
  'charlie-discovery-zone',
] as const;

export function getWeek1MissionUnlockState(
  missionId: string,
  completedMissionIds: readonly string[],
): Week1MissionUnlockState {
  if (CAMP_PILOT_UNLOCK_ALL) {
    return { unlocked: true, reason: 'Available now' };
  }

  const completed = new Set(completedMissionIds);
  const completedCount = completed.size;
  const starterCompletedCount = WEEK1_STARTER_MISSION_IDS.filter((id) => completed.has(id)).length;

  if (WEEK1_STARTER_MISSION_IDS.includes(missionId as (typeof WEEK1_STARTER_MISSION_IDS)[number])) {
    return { unlocked: true, reason: 'Available now' };
  }

  if (missionId === 'zeke-bridge-challenge') {
    return {
      unlocked: starterCompletedCount >= 2,
      reason:
        starterCompletedCount >= 2
          ? 'Unlocked'
          : 'Complete 2 starter missions to unlock Zeke',
    };
  }

  if (missionId === 'charlie-discovery-zone') {
    return {
      unlocked: completedCount >= 3,
      reason:
        completedCount >= 3
          ? 'Unlocked'
          : 'Complete 3 missions to unlock Charlie Perk',
    };
  }

  return { unlocked: true, reason: 'Available now' };
}

export function getWeek1UnlockedMissionIds(completedMissionIds: readonly string[]): string[] {
  return WEEK1_MISSION_IDS.filter(
    (missionId) => getWeek1MissionUnlockState(missionId, completedMissionIds).unlocked,
  );
}

export function detectNewlyUnlockedWeek1Missions(
  previousCompletedIds: readonly string[],
  currentCompletedIds: readonly string[],
): string[] {
  const previouslyUnlocked = new Set(getWeek1UnlockedMissionIds(previousCompletedIds));
  return getWeek1UnlockedMissionIds(currentCompletedIds).filter(
    (missionId) => !previouslyUnlocked.has(missionId),
  );
}
