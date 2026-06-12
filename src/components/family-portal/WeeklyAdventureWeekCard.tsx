import React from 'react';
import WeeklyAdventureCard from '../../design-system/components/WeeklyAdventureCard';
import type { WeeklyAdventureActivity } from '../../data/familyWeeklyAdventures';
import { formatWeekUnlockStatus } from '../../lib/pilotWeekUnlock';
import '../../design-system/components/weekly-adventure-card.css';
import './weekly-adventure-week-card.css';

type WeeklyAdventureWeekCardProps = {
  weekNumber: number;
  title: string;
  selFocus: string;
  status: 'available' | 'locked';
  unlockStatus: string;
  activities?: WeeklyAdventureActivity[];
  previewActivities?: string[];
  pilotStartDate: Date | string | null;
  baselineLocked?: boolean;
  baselineLockedLabel?: string;
};

export default function WeeklyAdventureWeekCard({
  weekNumber,
  title,
  selFocus,
  status,
  unlockStatus,
  activities = [],
  previewActivities = [],
  pilotStartDate,
  baselineLocked = false,
  baselineLockedLabel = 'Complete B-4 Check-In to unlock',
}: WeeklyAdventureWeekCardProps) {
  const isTimeLocked = status === 'locked';
  const isBaselineGated = baselineLocked;
  const isLocked = isTimeLocked || isBaselineGated;
  const statusLabel = isBaselineGated
    ? baselineLockedLabel
    : isTimeLocked
      ? formatWeekUnlockStatus(weekNumber, pilotStartDate)
      : unlockStatus;

  return (
    <section
      className={`weeklyAdventureWeek${isLocked ? ' weeklyAdventureWeek--locked' : ''}`}
      aria-labelledby={`week-${weekNumber}-title`}
    >
      <header className="weeklyAdventureWeekHead">
        <div>
          <p className="weeklyAdventureWeekNum">Week {weekNumber}</p>
          <h2 id={`week-${weekNumber}-title`} className="weeklyAdventureWeekTitle">
            {title}
          </h2>
          <p className="weeklyAdventureWeekSel">SEL Focus: {selFocus}</p>
        </div>
        <span
          className={`weeklyAdventureWeekStatus weeklyAdventureWeekStatus--${status}`}
          role="status"
        >
          {statusLabel}
        </span>
      </header>

      {isTimeLocked ? (
        <div className="weeklyAdventureWeekPreview">
          <p className="weeklyAdventureWeekPreviewLabel">Preview</p>
          <ul className="weeklyAdventureWeekPreviewList">
            {previewActivities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="weeklyAdventureCardGrid weeklyAdventureWeekGrid">
          {activities.map((activity) => (
            <WeeklyAdventureCard
              key={activity.id}
              character={activity.characterId}
              title={activity.title}
              description={activity.description}
              weekLabel={activity.weekLabel}
              skillTags={activity.skillTags}
              cta={activity.cta}
              href={activity.href}
              kind={activity.kind}
              locked={isBaselineGated}
              lockedLabel={baselineLockedLabel}
            />
          ))}
        </div>
      )}
    </section>
  );
}
