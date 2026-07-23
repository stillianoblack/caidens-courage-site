import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import WeeklyAdventureMonthHero from '../../design-system/components/WeeklyAdventureMonthHero';
import WeeklyAdventureMonthSelector from '../../design-system/components/WeeklyAdventureMonthSelector';
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
    render(
      <WeeklyAdventureMonthHero
        month={monthTwo}
        progress={{
          monthNumber: 2,
          title: 'Month 2 Challenge',
          tagline: 'Lead with courage',
          description: monthTwo.month_description!,
          monthlyBadgeName: 'Leadership Badge',
          certificateName: 'Leadership Certificate',
          weeksCompleted: 1,
          weeksTotal: 4,
          monthChallengeStarted: true,
          monthChallengeCompleted: false,
          certificateEarned: false,
          monthlyBadgeEarned: false,
          completedWeekNumbers: [5],
        }}
      />,
    );

    expect(screen.getByText('Month 2')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Find Your Voice' })).toBeInTheDocument();
    expect(screen.getByText('Lead with courage')).toBeInTheDocument();
    expect(screen.getByText(monthTwo.month_description!)).toBeInTheDocument();
    expect(screen.getByText('1/4 weeks complete')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    expect(screen.getByText('Leadership Certificate')).toBeInTheDocument();
    expect(screen.getByText(/Complete 4 required weeks to earn Leadership Badge/)).toBeInTheDocument();
  });

  it('offers previous months while keeping future locked months disabled', () => {
    const monthOne = {
      monthNumber: 1,
      title: 'Month 1: The Genesis',
      weekNumbers: [1, 2, 3, 4],
      certificateRequiredWeeks: 4,
      comingSoon: false,
      completedWeekNumbers: [1, 2, 3, 4],
      progress: {
        monthNumber: 1,
        title: 'Month 1',
        tagline: 'Begin',
        description: 'Begin',
        monthlyBadgeName: 'Badge',
        certificateName: 'Certificate',
        weeksCompleted: 4,
        weeksTotal: 4,
        monthChallengeStarted: true,
        monthChallengeCompleted: true,
        certificateEarned: true,
        monthlyBadgeEarned: true,
        completedWeekNumbers: [1, 2, 3, 4],
      },
    };
    const monthTwoView = {
      ...monthOne,
      monthNumber: 2,
      title: 'Month 2: Find Your Voice',
      weekNumbers: [5, 6, 7, 8],
      completedWeekNumbers: [],
      cmsMonth: monthTwo,
      progress: { ...monthOne.progress, monthNumber: 2, weeksCompleted: 0, completedWeekNumbers: [] },
    };
    const onSelectMonth = jest.fn();
    render(
      <WeeklyAdventureMonthSelector
        months={[
          { month: monthOne, locked: false },
          { month: monthTwoView, locked: true },
        ]}
        selectedMonthNumber={1}
        currentMonthNumber={1}
        onSelectMonth={onSelectMonth}
      />,
    );

    const monthOneButton = screen.getByRole('button', { name: 'Month 1: The Genesis' });
    expect(monthOneButton).toHaveAttribute('aria-current', 'page');
    fireEvent.click(monthOneButton);
    expect(onSelectMonth).toHaveBeenCalledWith(1);
    expect(screen.getByRole('button', { name: 'Month 2: Find Your Voice, locked' })).toBeDisabled();
  });

  it('keeps month deep links independent of the selected Explore, Missions, or Quests view', () => {
    const params = new URLSearchParams('view=missions&month=1&week=2');
    params.set('month', '2');
    params.set('week', '5');
    expect(params.get('view')).toBe('missions');
    expect(params.get('month')).toBe('2');
    expect(params.get('week')).toBe('5');
  });
});
