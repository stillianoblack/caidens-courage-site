import React from 'react';
import WeeklyAdventureJourneyCard from './WeeklyAdventureJourneyCard';
import type { WeeklyAdventureJourneyCardItem } from '../../lib/weeklyAdventureWeekCards';
import './weekly-adventure-journey.css';

type WeeklyAdventureRecentlyCompletedProps = {
  cards: WeeklyAdventureJourneyCardItem[];
  className?: string;
};

export default function WeeklyAdventureRecentlyCompleted({
  cards,
  className = '',
}: WeeklyAdventureRecentlyCompletedProps) {
  if (cards.length === 0) return null;

  return (
    <section
      className={['weeklyJourneyRecentlyCompleted', className].filter(Boolean).join(' ')}
      aria-labelledby="weekly-journey-recently-completed"
    >
      <h3 id="weekly-journey-recently-completed" className="weeklyJourneyRecentlyCompletedTitle">
        Recently Completed
      </h3>
      <div className="weeklyJourneyRecentlyCompletedGrid">
        {cards.map((card) => (
          <WeeklyAdventureJourneyCard key={card.id} {...card} />
        ))}
      </div>
    </section>
  );
}
