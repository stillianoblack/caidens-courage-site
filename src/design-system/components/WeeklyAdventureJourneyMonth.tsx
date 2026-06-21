import React from 'react';
import WeeklyAdventureJourneyCard from './WeeklyAdventureJourneyCard';
import WeeklyAdventureRecentlyCompleted from './WeeklyAdventureRecentlyCompleted';
import type { WeeklyAdventureJourneyCardItem } from '../../lib/weeklyAdventureWeekCards';
import type { AdventureJourneyMonthView } from '../../lib/weeklyAdventureJourneyMonths';
import './weekly-adventure-journey.css';
import './weekly-adventure-journey-dark.css';

type WeeklyAdventureJourneyMonthProps = {
  month: AdventureJourneyMonthView;
  cards: WeeklyAdventureJourneyCardItem[];
  className?: string;
  hideWeekSelectorGrid?: boolean;
  recentlyCompletedCards?: WeeklyAdventureJourneyCardItem[];
  darkGlass?: boolean;
};

function JourneyProgressLine({ cards }: { cards: WeeklyAdventureJourneyCardItem[] }) {
  return (
    <ol className="weeklyJourneyProgressLine" aria-label="Weekly adventure progress">
      {cards.map((card, index) => (
        <li
          key={card.weekNumber}
          className={[
            'weeklyJourneyProgressStep',
            `weeklyJourneyProgressStep--${card.journeyState}`,
          ].join(' ')}
        >
          <span className="weeklyJourneyProgressMarker" aria-hidden="true">
            {card.journeyState === 'completed' ? '✓' : card.journeyState === 'locked' ? '🔒' : '★'}
          </span>
          <span className="weeklyJourneyProgressLabel">Week {card.weekNumber}</span>
          {index < cards.length - 1 ? (
            <span className="weeklyJourneyProgressConnector" aria-hidden="true" />
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export default function WeeklyAdventureJourneyMonth({
  month,
  cards,
  className = '',
  hideWeekSelectorGrid = false,
  recentlyCompletedCards = [],
  darkGlass = false,
}: WeeklyAdventureJourneyMonthProps) {
  const progressPercent =
    month.progress.weeksTotal > 0
      ? Math.round((month.progress.weeksCompleted / month.progress.weeksTotal) * 100)
      : 0;

  const progressCopy = month.progress.certificateEarned
    ? 'Month Challenge Complete — Certificate earned'
    : month.progress.description ||
      'Complete all 4 weeks to earn your monthly certificate.';

  return (
    <section
      className={[
        'weeklyJourneyMonth',
        month.comingSoon ? 'weeklyJourneyMonth--comingSoon' : '',
        darkGlass ? 'weeklyJourneyMonth--darkGlass' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-labelledby={`journey-month-${month.monthNumber}`}
    >
      <header className="weeklyJourneyMonthHeader">
        <div className="weeklyJourneyMonthTitleRow">
          <h2 id={`journey-month-${month.monthNumber}`} className="weeklyJourneyMonthTitle">
            {month.title}
          </h2>
          {month.comingSoon ? (
            <span className="weeklyJourneyMonthSoonPill">Coming soon…</span>
          ) : (
            <span className="weeklyJourneyMonthCount">
              {month.progress.weeksCompleted}/{month.progress.weeksTotal} complete
            </span>
          )}
        </div>

        {!month.comingSoon ? (
          <>
            <div
              className="weeklyJourneyMonthProgressTrack"
              role="progressbar"
              aria-valuenow={month.progress.weeksCompleted}
              aria-valuemin={0}
              aria-valuemax={month.progress.weeksTotal}
              aria-label={`${month.title} progress`}
            >
              <span
                className="weeklyJourneyMonthProgressFill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="weeklyJourneyMonthProgressCopy">{progressCopy}</p>
            <JourneyProgressLine cards={cards} />
          </>
        ) : (
          <p className="weeklyJourneyMonthProgressCopy weeklyJourneyMonthProgressCopy--muted">
            More adventures are on the way. Check back soon!
          </p>
        )}
      </header>

      {hideWeekSelectorGrid && recentlyCompletedCards.length > 0 ? (
        <WeeklyAdventureRecentlyCompleted cards={recentlyCompletedCards} />
      ) : null}

      {!hideWeekSelectorGrid ? (
        <div className="weeklyJourneyMonthGrid">
          {cards.map((card) => (
            <WeeklyAdventureJourneyCard key={card.id} {...card} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
