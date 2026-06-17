import { useMemo } from 'react';
import { COURAGE_IN_THE_DARK_BG } from '../data/courageInTheDarkMap';
import {
  resolveAdventureMonthHeroSrc,
  type AdventureMonthHeroResolution,
} from '../lib/adventureMonthHero';
import { resolveMonthForWeek } from '../lib/adventureMonthService';
import { useFamilyAdventureModules } from './useAdventureModules';
import { useAdventureMonths } from './useAdventureMonths';

export function useCinematicMissionHeroBackground(weekNumber?: number): AdventureMonthHeroResolution {
  const { months } = useAdventureMonths('family');
  const { modules } = useFamilyAdventureModules();

  return useMemo(() => {
    const week = weekNumber && weekNumber > 0 ? weekNumber : 1;
    const weekModule = modules.find((row) => row.week_number === week) ?? null;
    const month = resolveMonthForWeek(week, months, weekModule?.month_number ?? null);

    const monthSectionWeeks = month
      ? modules
          .filter((row) => (row.month_number ?? Math.ceil(row.week_number / 4)) === month.month_number)
          .sort((a, b) => a.week_number - b.week_number)
      : [];
    const stableWeekModule = monthSectionWeeks[0] ?? weekModule;

    const resolution = resolveAdventureMonthHeroSrc({
      month,
      heroWeekModule: stableWeekModule ?? weekModule,
      weekNumber: stableWeekModule?.week_number ?? week,
    });

    if (resolution.url) {
      return resolution;
    }

    return {
      url: COURAGE_IN_THE_DARK_BG,
      source: 'week1_static' as const,
      fallbackReason: resolution.fallbackReason ?? 'No CMS month hero — using Week 1 static map.',
    };
  }, [modules, months, weekNumber]);
}
