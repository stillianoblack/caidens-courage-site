import type { AdventureMonthInput } from '../types/adventureMonth';

/** In-app defaults when adventure_months table is empty or migration not run. */
export const DEFAULT_ADVENTURE_MONTH_SEEDS: AdventureMonthInput[] = [
  {
    month_number: 1,
    month_title: 'The Genesis',
    month_subtitle: 'Month 1',
    month_description:
      'Complete all weekly adventures to earn your Focus Flame Champion Certificate.',
    certificate_title: 'Focus Flame Champion Certificate',
    certificate_reward_name: 'Focus Flame Champion Badge',
    certificate_required_weeks: 4,
    is_published: true,
    sort_order: 1,
  },
  {
    month_number: 2,
    month_title: 'The Leader',
    month_subtitle: 'Month 2',
    month_description: 'Complete all weekly adventures to earn your monthly certificate.',
    certificate_title: 'Month 2 Champion Certificate',
    certificate_reward_name: 'Month 2 Champion Badge',
    certificate_required_weeks: 4,
    is_published: false,
    sort_order: 2,
  },
];
