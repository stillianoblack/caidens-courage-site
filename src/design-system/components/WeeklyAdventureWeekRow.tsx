import React, { useCallback, useRef } from 'react';
import WeeklyAdventureWeekTile, {
  type WeeklyAdventureWeekTileProps,
} from './WeeklyAdventureWeekTile';
import './weekly-adventure-week-row.css';

export type WeeklyAdventureWeekRowItem = Omit<
  WeeklyAdventureWeekTileProps,
  'className'
> & { id: string | number };

type WeeklyAdventureWeekRowProps = {
  title: string;
  items: WeeklyAdventureWeekRowItem[];
  emptyMessage?: string;
  className?: string;
};

export default function WeeklyAdventureWeekRow({
  title,
  items,
  emptyMessage,
  className = '',
}: WeeklyAdventureWeekRowProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollTrack = useCallback((direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('.weeklyWeekRowItem') as HTMLElement | null;
    const delta = card ? card.offsetWidth + 12 : 280;
    track.scrollBy({ left: direction * delta, behavior: 'smooth' });
  }, []);

  if (items.length === 0) {
    if (!emptyMessage) return null;
    return (
      <section className={`weeklyWeekRow${className ? ` ${className}` : ''}`} aria-labelledby={`${title}-title`}>
        <h2 id={`${title}-title`} className="weeklyWeekRowTitle">
          {title}
        </h2>
        <p className="weeklyWeekRowEmpty">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section className={`weeklyWeekRow${className ? ` ${className}` : ''}`} aria-labelledby={`weekly-week-row-${title}`}>
      <div className="weeklyWeekRowHead">
        <h2 id={`weekly-week-row-${title}`} className="weeklyWeekRowTitle">
          {title}
        </h2>
        <div className="weeklyWeekRowNav" aria-hidden={items.length <= 1}>
          <button type="button" className="weeklyWeekRowNavBtn" onClick={() => scrollTrack(-1)} aria-label="Scroll left">
            ‹
          </button>
          <button type="button" className="weeklyWeekRowNavBtn" onClick={() => scrollTrack(1)} aria-label="Scroll right">
            ›
          </button>
        </div>
      </div>
      <div ref={trackRef} className="weeklyWeekRowTrack" role="list">
        {items.map((item) => (
          <div key={item.id} className="weeklyWeekRowItem" role="listitem">
            <WeeklyAdventureWeekTile {...item} />
          </div>
        ))}
      </div>
    </section>
  );
}
