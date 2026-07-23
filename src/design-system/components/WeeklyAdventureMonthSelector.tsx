import React from 'react';
import type { AdventureJourneyMonthView } from '../../lib/weeklyAdventureJourneyMonths';
import './weekly-adventure-month-selector.css';

export type WeeklyAdventureMonthSelectorItem = {
  month: AdventureJourneyMonthView;
  locked: boolean;
};

type Props = {
  months: WeeklyAdventureMonthSelectorItem[];
  selectedMonthNumber: number;
  currentMonthNumber: number;
  onSelectMonth: (monthNumber: number) => void;
};

export default function WeeklyAdventureMonthSelector({
  months,
  selectedMonthNumber,
  currentMonthNumber,
  onSelectMonth,
}: Props) {
  if (months.length < 2) return null;

  return (
    <nav className="weeklyMonthSelector" aria-label="Choose an adventure month">
      <p className="weeklyMonthSelector__label">Focus Flame Journey</p>
      <div className="weeklyMonthSelector__track">
        {months.map(({ month, locked }) => {
          const selected = month.monthNumber === selectedMonthNumber;
          const current = month.monthNumber === currentMonthNumber;
          const subtitle = month.cmsMonth?.month_subtitle?.trim();
          return (
            <button
              key={month.monthNumber}
              type="button"
              className={[
                'weeklyMonthSelector__option',
                selected ? 'weeklyMonthSelector__option--selected' : '',
                current ? 'weeklyMonthSelector__option--current' : '',
              ].filter(Boolean).join(' ')}
              aria-current={selected ? 'page' : undefined}
              aria-label={`${month.title}${locked ? ', locked' : ''}`}
              disabled={locked}
              onClick={() => onSelectMonth(month.monthNumber)}
            >
              <span className="weeklyMonthSelector__number">Month {month.monthNumber}</span>
              <span className="weeklyMonthSelector__title">
                {month.cmsMonth?.month_title?.trim() || month.title.replace(/^Month \d+:?\s*/i, '')}
              </span>
              {subtitle ? <span className="weeklyMonthSelector__subtitle">{subtitle}</span> : null}
              <span className="weeklyMonthSelector__status">
                {locked
                  ? 'Locked'
                  : current
                    ? 'Current month'
                    : `${month.progress.weeksCompleted}/${month.progress.weeksTotal} complete`}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
