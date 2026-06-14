import type { Week1ExtrasPaths } from '../components/courage-in-the-dark/Week1ExtrasCards';
import type { CourageInTheDarkMission } from '../data/courageInTheDarkMap';
import { resolveCourageMissionReward } from '../data/courageMissionRewards';
import type { AdventureModuleRecord } from '../types/adventureModule';
import type { AdventureTrailWeekView } from '../types/adventureTrail';
import type { CourageInTheDarkProgressSnapshot } from '../types/courageMissionProgress';
import { resolveAdventureHeroMapSrc } from './adventureMapMissions';
import { formatSelFocusLine, normalizeSelFocusLabel } from './adventureSelFocus';
import { resolveAdventureComicThumbnailUrl } from './adventureThumbnail';
import {
  buildCmsActivityAssets,
  resolveWeekExtrasPaths,
  resolveWeeklyQuestReward,
  type WeeklyQuestRewardConfig,
} from './adventureWeekAssets';
import {
  countCompletedMapMissions,
  isMapMissionCompleteForWeek,
} from './adventureWeekCompletion';
import { familyPortalPath } from './familyPortalPaths';
import {
  WEEKLY_VIEW_EXPLORE_VALUE,
  WEEKLY_VIEW_PARAM,
  WEEKLY_WEEK_PARAM,
  weeklyAdventureWeekAnchor,
} from './weeklyAdventureRouteContext';

export type WeekReviewMissionRow = {
  id: string;
  title: string;
  characterName: string;
  complete: boolean;
};

export type WeekReviewActivityRow = {
  id: string;
  title: string;
  href?: string;
  status: 'available' | 'comingSoon';
};

export type WeekReviewRewardView = {
  name: string;
  imageUrl: string | null;
  coins: number;
  storedInInventory: boolean;
};

export type WeekReviewViewModel = {
  weekNumber: number;
  title: string;
  selFocusLine: string | null;
  description: string | null;
  childName: string;
  coverImageSrc: string;
  hasCoverImage: boolean;
  thumbnailUrl: string | null;
  progressPct: number;
  completedCount: number;
  totalMissions: number;
  coinsEarned: number;
  badges: string[];
  missions: WeekReviewMissionRow[];
  activities: WeekReviewActivityRow[];
  b4Insights: string[];
  weeklyReward: WeekReviewRewardView | null;
  certificateHref?: string;
  activityKitHref?: string;
  continueHref: string;
  inventoryHref: string;
};

function resolveWeekCoinsEarned(
  completedMissionIds: readonly string[],
  weeklyQuestReward: WeeklyQuestRewardConfig | null,
  weekFullyComplete: boolean,
): number {
  let total = 0;
  for (const missionId of completedMissionIds) {
    const reward = resolveCourageMissionReward(missionId);
    if (reward?.coins_earned) total += reward.coins_earned;
  }
  if (weekFullyComplete && weeklyQuestReward?.coinsAwarded) {
    total += weeklyQuestReward.coinsAwarded;
  }
  return total;
}

function resolveWeekBadges(
  completedMissionIds: readonly string[],
  progressBadges: readonly string[],
  weeklyQuestReward: WeeklyQuestRewardConfig | null,
  weekFullyComplete: boolean,
): string[] {
  const badges = new Set<string>(progressBadges);
  for (const missionId of completedMissionIds) {
    const reward = resolveCourageMissionReward(missionId);
    if (reward?.badge_unlocked) badges.add(reward.badge_unlocked);
  }
  if (weekFullyComplete && weeklyQuestReward?.rewardName) {
    badges.add(weeklyQuestReward.rewardName);
  }
  return Array.from(badges);
}

function buildB4Insights(input: {
  completedCount: number;
  selFocusLabel: string;
  weeklyReward: WeekReviewRewardView | null;
  weekFullyComplete: boolean;
}): string[] {
  const insights: string[] = [];
  if (input.completedCount > 0) {
    insights.push(
      `You finished ${input.completedCount} mission${input.completedCount === 1 ? '' : 's'}.`,
    );
  }
  if (input.selFocusLabel) {
    insights.push(`You practiced ${input.selFocusLabel.toLowerCase()}.`);
  }
  if (input.weekFullyComplete && input.weeklyReward) {
    insights.push('You earned your weekly badge.');
  }
  return insights.slice(0, 3);
}

function resolveWeekActivities(
  cmsModule: AdventureModuleRecord | null,
  weekExtrasPaths: Week1ExtrasPaths,
): WeekReviewActivityRow[] {
  const rows: WeekReviewActivityRow[] = [];

  if (cmsModule) {
    for (const asset of buildCmsActivityAssets([cmsModule])) {
      if (asset.status !== 'available' || !asset.href) continue;
      rows.push({
        id: asset.id,
        title: asset.title,
        href: asset.href,
        status: 'available',
      });
    }
  }

  if (rows.length === 0 && weekExtrasPaths.week1DiscussionHref) {
    rows.push({
      id: `week-${weekExtrasPaths.weekNumber ?? 1}-module`,
      title: `Week ${weekExtrasPaths.weekNumber ?? 1} Activity Module`,
      href: weekExtrasPaths.week1DiscussionHref,
      status: 'available',
    });
  }

  return rows;
}

export function buildWeekReviewViewModel(input: {
  weekNumber: number;
  trailWeek: AdventureTrailWeekView | null;
  cmsModule: AdventureModuleRecord | null;
  mapMissions: CourageInTheDarkMission[];
  completedMissionIds: readonly string[];
  progress: CourageInTheDarkProgressSnapshot;
  childDisplayName: string;
  pathname: string;
  weekExtrasPaths: Week1ExtrasPaths;
  weeklyQuestReward: WeeklyQuestRewardConfig | null;
  weeklyRewardClaimed?: boolean;
  inventoryHref: string;
}): WeekReviewViewModel {
  const completedMissionIds =
    input.completedMissionIds.length > 0
      ? input.completedMissionIds
      : input.progress.completedMissionIds;

  const characterMissions = input.mapMissions.filter((mission) =>
    ['caiden', 'miranda', 'zeke', 'charlie', 'b4'].includes(mission.id),
  );
  const totalMissions =
    characterMissions.length > 0 ? characterMissions.length : input.mapMissions.length;
  const completedCount = countCompletedMapMissions(input.mapMissions, completedMissionIds);
  const progressPct =
    totalMissions > 0 ? Math.min(100, Math.round((completedCount / totalMissions) * 100)) : 0;
  const weekFullyComplete = totalMissions > 0 && completedCount >= totalMissions;

  const title =
    input.cmsModule?.title?.trim() ||
    input.trailWeek?.title?.trim() ||
    `Week ${input.weekNumber} Adventure`;
  const selFocusRaw =
    normalizeSelFocusLabel(input.cmsModule?.subtitle) ||
    normalizeSelFocusLabel(input.trailWeek?.selFocus);
  const selFocusLine = formatSelFocusLine(selFocusRaw);
  const description =
    input.cmsModule?.description?.trim() ||
    input.cmsModule?.weekly_reward_description?.trim() ||
    null;

  const coverImageSrc = resolveAdventureHeroMapSrc(input.cmsModule, input.weekNumber);
  const hasCoverImage = Boolean(coverImageSrc);
  const thumbnailUrl = resolveAdventureComicThumbnailUrl(input.cmsModule, input.weekNumber);

  const coinsEarned = resolveWeekCoinsEarned(
    completedMissionIds,
    input.weeklyQuestReward,
    weekFullyComplete,
  );
  const badges = resolveWeekBadges(
    completedMissionIds,
    input.progress.unlockedBadges,
    input.weeklyQuestReward,
    weekFullyComplete,
  );

  const missions = input.mapMissions.map((mission) => ({
    id: mission.id,
    title: mission.label,
    characterName: mission.characterName,
    complete: isMapMissionCompleteForWeek(mission, completedMissionIds),
  }));

  const weeklyReward = input.weeklyQuestReward
    ? {
        name: input.weeklyQuestReward.rewardName,
        imageUrl:
          input.weeklyQuestReward.rewardSvgUrl ||
          input.weeklyQuestReward.rewardImageUrl ||
          null,
        coins: input.weeklyQuestReward.coinsAwarded ?? 0,
        storedInInventory: Boolean(input.weeklyRewardClaimed || weekFullyComplete),
      }
    : null;

  const b4Insights = buildB4Insights({
    completedCount,
    selFocusLabel: selFocusRaw,
    weeklyReward,
    weekFullyComplete,
  });

  const params = new URLSearchParams();
  params.set(WEEKLY_VIEW_PARAM, WEEKLY_VIEW_EXPLORE_VALUE);
  params.set(WEEKLY_WEEK_PARAM, String(input.weekNumber));
  const continueHref = `${familyPortalPath('continue-learning', input.pathname)}?${params.toString()}#${weeklyAdventureWeekAnchor(input.weekNumber)}`;

  const activityKitHref =
    input.cmsModule?.weekly_module_pdf_url?.trim() ||
    input.cmsModule?.facilitator_kit_pdf_url?.trim() ||
    input.weekExtrasPaths.week1DiscussionHref ||
    undefined;
  const certificateHref = input.weekExtrasPaths.week1CertificateHref || undefined;

  return {
    weekNumber: input.weekNumber,
    title,
    selFocusLine,
    description,
    childName: input.childDisplayName,
    coverImageSrc,
    hasCoverImage,
    thumbnailUrl,
    progressPct,
    completedCount,
    totalMissions,
    coinsEarned,
    badges,
    missions,
    activities: resolveWeekActivities(input.cmsModule, input.weekExtrasPaths),
    b4Insights,
    weeklyReward,
    certificateHref,
    activityKitHref,
    continueHref,
    inventoryHref: input.inventoryHref,
  };
}

export function resolveReviewWeekContext(input: {
  weekNumber: number;
  trailWeeks: AdventureTrailWeekView[];
  cmsModules: AdventureModuleRecord[];
  paths: Pick<Week1ExtrasPaths, 'downloadsPath' | 'certificatesPath'>;
}) {
  const trailWeek = input.trailWeeks.find((row) => row.week === input.weekNumber) ?? null;
  const cmsModule = input.cmsModules.find((row) => row.week_number === input.weekNumber) ?? null;
  const weekExtrasPaths = resolveWeekExtrasPaths(cmsModule, input.paths);
  const weeklyQuestReward = resolveWeeklyQuestReward(cmsModule);
  return { trailWeek, cmsModule, weekExtrasPaths, weeklyQuestReward };
}
