import type { AdventureModuleRecord } from '../types/adventureModule';
import type { AdventureTrailWeekView } from '../types/adventureTrail';
import type { WeeklyAdventureWeekRowItem } from '../design-system/components/WeeklyAdventureWeekRow';
import { resolveAdventureComicThumbnailUrl, resolveWeeklyCardSelFocus } from './adventureThumbnail';
import { isUnlockDatePassed, isPublishedAdventure } from './adventureVisibility';
import { familyPortalPath } from './familyPortalPaths';
import {
  WEEKLY_VIEW_EXPLORE_VALUE,
  WEEKLY_VIEW_PARAM,
  WEEKLY_WEEK_PARAM,
  weeklyAdventureWeekAnchor,
} from './weeklyAdventureRouteContext';

function resolveWeekTileVariant(
  week: AdventureTrailWeekView,
  isHeroWeek: boolean,
  isCompleted: boolean,
  adminPreview: boolean,
): WeeklyAdventureWeekRowItem['variant'] {
  if (adminPreview) return 'adminPreview';
  if (isCompleted) return 'complete';
  if (isHeroWeek && week.weekStatus === 'available') return 'inProgress';
  if (week.weekStatus === 'locked') return 'locked';
  return 'available';
}

function resolveWeekStatusLabel(
  week: AdventureTrailWeekView,
  isHeroWeek: boolean,
  isCompleted: boolean,
  cmsModule: AdventureModuleRecord | null,
): string {
  if (isCompleted) return 'Complete';
  if (isHeroWeek && week.weekStatus === 'available') return 'In Progress';
  if (week.weekStatus === 'available') return 'Available';
  if (week.weekStatus === 'locked' && cmsModule && isPublishedAdventure(cmsModule)) {
    if (
      cmsModule.status === 'scheduled' &&
      cmsModule.unlock_date &&
      !isUnlockDatePassed(cmsModule.unlock_date)
    ) {
      return 'Available soon in your journey';
    }
    return 'Complete earlier adventures first';
  }
  return week.unlockStatus || 'Locked';
}

function resolveWeekCtaLabel(
  variant: WeeklyAdventureWeekRowItem['variant'],
): string {
  if (variant === 'complete') return 'Review';
  if (variant === 'locked') return 'Locked';
  if (variant === 'adminPreview') return 'Preview';
  if (variant === 'inProgress') return 'Continue';
  return 'Start';
}

export function buildUpcomingWeeklyAdventureCards(input: {
  weeks: AdventureTrailWeekView[];
  heroWeekNumber: number;
  completedWeekNumbers: number[];
  cmsModules: AdventureModuleRecord[];
  pathname: string;
  adminPreview?: boolean;
}): WeeklyAdventureWeekRowItem[] {
  return input.weeks
    .filter(
      (week) =>
        !input.completedWeekNumbers.includes(week.week) && week.week !== input.heroWeekNumber,
    )
    .map((week) => {
      const cmsModule = input.cmsModules.find((row) => row.week_number === week.week) ?? null;
      const isHeroWeek = week.week === input.heroWeekNumber;
      const variant = resolveWeekTileVariant(week, isHeroWeek, false, Boolean(input.adminPreview));
      const thumbnailUrl = resolveAdventureComicThumbnailUrl(cmsModule, week.week);
      const params = new URLSearchParams();
      params.set(WEEKLY_VIEW_PARAM, WEEKLY_VIEW_EXPLORE_VALUE);
      params.set(WEEKLY_WEEK_PARAM, String(week.week));
      const href = `${familyPortalPath('continue-learning', input.pathname)}?${params.toString()}#${weeklyAdventureWeekAnchor(week.week)}`;

      return {
        id: week.week,
        weekNumber: week.week,
        title: cmsModule?.title || week.title,
        selFocus: resolveWeeklyCardSelFocus(cmsModule, week.selFocus),
        thumbnailUrl,
        statusLabel: resolveWeekStatusLabel(week, isHeroWeek, false, cmsModule),
        variant,
        ctaLabel: resolveWeekCtaLabel(variant),
        href: variant === 'locked' ? undefined : href,
        disabled: variant === 'locked',
      };
    });
}

export function buildCompletedWeeklyAdventureCards(input: {
  weeks: AdventureTrailWeekView[];
  completedWeekNumbers: number[];
  cmsModules: AdventureModuleRecord[];
  pathname: string;
  participantId?: string | null;
  onReviewWeek?: (weekNumber: number) => void;
}): WeeklyAdventureWeekRowItem[] {
  const cards: WeeklyAdventureWeekRowItem[] = [];

  for (const weekNumber of input.completedWeekNumbers) {
    const week = input.weeks.find((row) => row.week === weekNumber);
    if (!week) continue;
    const cmsModule = input.cmsModules.find((row) => row.week_number === weekNumber) ?? null;
    const thumbnailUrl = resolveAdventureComicThumbnailUrl(cmsModule, weekNumber);

    cards.push({
      id: weekNumber,
      weekNumber,
      title: cmsModule?.title || week.title,
      selFocus: resolveWeeklyCardSelFocus(cmsModule, week.selFocus),
      thumbnailUrl,
      statusLabel: 'Complete',
      variant: 'complete',
      ctaLabel: 'Review',
      onAction: input.onReviewWeek ? () => input.onReviewWeek?.(weekNumber) : undefined,
    });
  }

  return cards;
}
