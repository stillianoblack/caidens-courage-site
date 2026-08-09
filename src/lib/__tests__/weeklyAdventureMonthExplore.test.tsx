import React from 'react';
import { render, screen } from '@testing-library/react';
import WeeklyAdventureMonthHero from '../../design-system/components/WeeklyAdventureMonthHero';
import { resolveMonthForWeek } from '../adventureMonthService';
import { resolveHeroWeekNumber } from '../resolveHeroWeekNumber';
import type { AdventureMonthRecord } from '../../types/adventureMonth';
import type { AdventureTrailWeekView } from '../../types/adventureTrail';

const monthTwo: AdventureMonthRecord = {
  id: 'month-two',
  month_number: 2,
  month_title: 'Find Your Voice',
  month_subtitle: 'Lead with courage',
  month_description: 'Practice the skills that help your voice make a difference.',
  month_hero_image_url: '/month-two-hero.jpg',
  certificate_title: 'Leadership Certificate',
  certificate_reward_name: 'Leadership Badge',
  certificate_required_weeks: 4,
  certificate_asset_url: '/month-two-certificate.pdf',
  certificate_asset_type: 'pdf',
  is_published: true,
  release_mode: 'all_available',
  release_interval_days: null,
  release_start_at: null,
  sort_order: 2,
  created_at: '2026-07-01T00:00:00.000Z',
  updated_at: '2026-07-01T00:00:00.000Z',
};

describe('Weekly Adventures month Explore metadata', () => {
  it('resolves Month 2 as soon as Week 5 is the active unlocked week', () => {
    const trailWeeks = Array.from({ length: 8 }, (_, index) => ({
      week: index + 1,
      weekStatus: 'available',
    })) as AdventureTrailWeekView[];

    const activeWeek = resolveHeroWeekNumber({
      trailWeeks,
      completedWeekNumbers: [1, 2, 3, 4],
    });

    expect(activeWeek).toBe(5);
    expect(resolveMonthForWeek(activeWeek, [monthTwo])).toBe(monthTwo);
  });

  it('renders all published month metadata required by Explore', () => {
    render(<WeeklyAdventureMonthHero month={monthTwo} />);

    expect(screen.getByText('Month 2')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Find Your Voice' })).toBeInTheDocument();
    expect(screen.getByText('Lead with courage')).toBeInTheDocument();
    expect(screen.getByText(monthTwo.month_description!)).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', '/month-two-hero.jpg');
    expect(screen.getByText('Leadership Certificate')).toBeInTheDocument();
    expect(screen.getByText(/Complete 4 required weeks to earn Leadership Badge/)).toBeInTheDocument();
  });
});
