import React from 'react';
import TrailWeekSection from './TrailWeekSection';
import type { AdventureTrailWeekView } from '../../types/adventureTrail';
import './adventure-trail.css';

export type AdventureTrailProps = {
  weeks: AdventureTrailWeekView[];
  baselineLockedLabel?: string;
  baselineLocked?: boolean;
  pilotStartDate?: Date | string | null;
  className?: string;
};

export default function AdventureTrail({
  weeks,
  baselineLockedLabel,
  baselineLocked = false,
  pilotStartDate = null,
  className,
}: AdventureTrailProps) {
  return (
    <div className={['adventureTrail', className].filter(Boolean).join(' ')}>
      {weeks.map((week) => (
        <TrailWeekSection
          key={week.week}
          week={week}
          baselineLockedLabel={baselineLockedLabel}
          baselineLocked={baselineLocked}
          pilotStartDate={pilotStartDate}
        />
      ))}
    </div>
  );
}
