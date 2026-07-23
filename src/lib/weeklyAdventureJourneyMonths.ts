import type { AdventureModuleRecord } from '../types/adventureModule';
import type { AdventureMonthRecord } from '../types/adventureMonth';
import type { AdventureTrailWeekView } from '../types/adventureTrail';
import {
  deriveMonthlyChallengeProgress,
  resolveMonthChallengeConfig,
  type MonthlyChallengeProgress,
} from './monthlyChallengeProgress';
import { isPublishedAdventure } from './adventureVisibility';
import { formatAdventureMonthLabel, resolveDefaultMonthNumber } from './adventureMonthService';
import { isWeekFullyComplete } from './weekBadgeProgression';

export type AdventureJourneyMonthDefinition = {
  monthNumber: number;
  title: string;
  weekNumbers: readonly number[];
  cmsMonth?: AdventureMonthRecord | null;
  certificateRequiredWeeks: number;
};

export const ADVENTURE_JOURNEY_MONTH_DEFINITIONS: AdventureJourneyMonthDefinition[] = [
  {
    monthNumber: 1,
    title: 'Month 1: The Genesis',
    weekNumbers: [1, 2, 3, 4],
    certificateRequiredWeeks: 4,
  },
  {
    monthNumber: 2,
    title: 'Month 2: The Leader',
    weekNumbers: [5, 6, 7, 8],
    certificateRequiredWeeks: 4,
  },
];

const WEEKS_PER_MONTH = 4;

function resolveWeekNumbersForMonth(
  monthNumber: number,
  cmsModules: AdventureModuleRecord[],
  trailWeeks: AdventureTrailWeekView[],
  certificateRequiredWeeks: number,
): number[] {
  const fromModules = cmsModules
    .filter((module) => (module.month_number ?? resolveDefaultMonthNumber(module.week_number)) === monthNumber)
    .map((module) => module.week_number);

  const fromTrail = trailWeeks
    .filter((week) => resolveDefaultMonthNumber(week.week) === monthNumber)
    .map((week) => week.week);

  const merged = Array.from(new Set([...fromModules, ...fromTrail])).sort((a, b) => a - b);

  if (merged.length > 0) return merged;

  const startWeek = (monthNumber - 1) * WEEKS_PER_MONTH + 1;
  return Array.from({ length: certificateRequiredWeeks }, (_, index) => startWeek + index);
}

export function resolveAdventureJourneyMonthDefinitions(input: {
  trailWeeks: AdventureTrailWeekView[];
  cmsModules: AdventureModuleRecord[];
  cmsMonths?: AdventureMonthRecord[];
}): AdventureJourneyMonthDefinition[] {
  const cmsMonths = input.cmsMonths?.length
    ? [...input.cmsMonths].sort((a, b) => a.sort_order - b.sort_order || a.month_number - b.month_number)
    : null;

  if (cmsMonths?.length) {
    const maxMonthFromData = Math.max(
      ...cmsMonths.map((month) => month.month_number),
      ...input.cmsModules.map((module) => module.month_number ?? resolveDefaultMonthNumber(module.week_number)),
      ...input.trailWeeks.map((week) => resolveDefaultMonthNumber(week.week)),
      2,
    );

    const monthNumbers = Array.from(
      new Set([
        ...cmsMonths.map((month) => month.month_number),
        ...Array.from({ length: maxMonthFromData }, (_, index) => index + 1),
      ]),
    ).sort((a, b) => a - b);

    return monthNumbers.map((monthNumber) => {
      const cmsMonth = cmsMonths.find((month) => month.month_number === monthNumber) ?? null;
      const requiredWeeks = cmsMonth?.certificate_required_weeks ?? WEEKS_PER_MONTH;
      const weekNumbers = resolveWeekNumbersForMonth(
        monthNumber,
        input.cmsModules,
        input.trailWeeks,
        requiredWeeks,
      );
      const fallback = ADVENTURE_JOURNEY_MONTH_DEFINITIONS.find((row) => row.monthNumber === monthNumber);

      return {
        monthNumber,
        title: cmsMonth ? formatAdventureMonthLabel(cmsMonth) : fallback?.title ?? `Month ${monthNumber}`,
        weekNumbers,
        cmsMonth,
        certificateRequiredWeeks: requiredWeeks,
      };
    });
  }

  const months = [...ADVENTURE_JOURNEY_MONTH_DEFINITIONS];
  const maxWeek = Math.max(...input.trailWeeks.map((week) => week.week), 8);

  if (maxWeek <= 8) return months;

  for (let startWeek = 9; startWeek <= maxWeek; startWeek += WEEKS_PER_MONTH) {
    const monthNumber = Math.ceil(startWeek / WEEKS_PER_MONTH);
    const weekNumbers = Array.from({ length: WEEKS_PER_MONTH }, (_, index) => startWeek + index).filter(
      (week) => week <= maxWeek,
    );
    if (weekNumbers.length === 0) continue;

    months.push({
      monthNumber,
      title: `Month ${monthNumber}`,
      weekNumbers,
      certificateRequiredWeeks: WEEKS_PER_MONTH,
    });
  }

  return months;
}

export type AdventureJourneyMonthView = AdventureJourneyMonthDefinition & {
  comingSoon: boolean;
  progress: MonthlyChallengeProgress;
  completedWeekNumbers: number[];
};

export function isAdventureJourneyMonthLocked(
  month: AdventureJourneyMonthView,
  trailWeeks: AdventureTrailWeekView[],
): boolean {
  if (
    month.progress.certificateEarned ||
    (month.progress.weeksTotal > 0 &&
      month.progress.weeksCompleted >= month.progress.weeksTotal)
  ) {
    return false;
  }

  return month.weekNumbers.every((weekNumber) => {
    const week = trailWeeks.find((item) => item.week === weekNumber);
    return !week || week.weekStatus === 'locked';
  });
}

function flattenCompletedMissionIds(completedByWeek: Record<number, string[]>): string[] {
  return Object.values(completedByWeek).flat();
}

export function buildAdventureJourneyMonthViews(input: {
  trailWeeks: AdventureTrailWeekView[];
  completedByWeek: Record<number, string[]>;
  mapCompletedWeekNumbers: number[];
  cmsModules: AdventureModuleRecord[];
  cmsMonths?: AdventureMonthRecord[];
}): AdventureJourneyMonthView[] {
  const completedMissionIds = flattenCompletedMissionIds(input.completedByWeek);
  const definitions = resolveAdventureJourneyMonthDefinitions({
    trailWeeks: input.trailWeeks,
    cmsModules: input.cmsModules,
    cmsMonths: input.cmsMonths,
  });

  return definitions.map((definition) => {
    const monthConfig = {
      ...resolveMonthChallengeConfig(definition.monthNumber, definition.cmsMonth),
      weekNumbers: definition.weekNumbers,
    };
    const completedWeekNumbers = definition.weekNumbers.filter((week) =>
      input.mapCompletedWeekNumbers.includes(week),
    );
    const progress = deriveMonthlyChallengeProgress(
      monthConfig,
      completedMissionIds,
      new Set(),
      {},
      completedWeekNumbers,
    );

    const hasPublishedCms = definition.weekNumbers.some((week) =>
      input.cmsModules.some(
        (module) => module.week_number === week && isPublishedAdventure(module),
      ),
    );

    const anyWeekActivity = definition.weekNumbers.some((week) =>
      isWeekFullyComplete(week, completedMissionIds),
    );

    const allWeeksLocked = definition.weekNumbers.every((week) => {
      const trailWeek = input.trailWeeks.find((row) => row.week === week);
      return !trailWeek || trailWeek.weekStatus === 'locked';
    });

    const comingSoon =
      definition.monthNumber > 1 &&
      allWeeksLocked &&
      !hasPublishedCms &&
      !anyWeekActivity &&
      completedWeekNumbers.length === 0 &&
      !definition.cmsMonth?.is_published;

    return {
      ...definition,
      comingSoon,
      progress: {
        ...progress,
        weeksCompleted: completedWeekNumbers.length,
        weeksTotal: definition.weekNumbers.length,
        description:
          definition.cmsMonth?.month_description ||
          progress.description ||
          `Complete all ${definition.weekNumbers.length} weeks to earn your monthly certificate.`,
      },
      completedWeekNumbers,
    };
  });
}
