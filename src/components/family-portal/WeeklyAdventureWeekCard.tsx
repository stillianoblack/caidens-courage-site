import React from 'react';
import { Link } from 'react-router-dom';
import CharacterAdventureCard from './CharacterAdventureCard';
import type { WeeklyAdventureActivity } from '../../data/familyWeeklyAdventures';
import type { FamilyCharacterId } from '../../data/familyPortalContent';
import { CHARACTER_ASSETS } from '../../data/familyPortalContent';
import { formatWeekUnlockStatus } from '../../lib/pilotWeekUnlock';
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

function ActivityIcon({ characterId, kind }: { characterId?: FamilyCharacterId; kind: WeeklyAdventureActivity['kind'] }) {
  const asset = characterId ? CHARACTER_ASSETS[characterId] : null;

  if (asset?.imageSrc) {
    return (
      <img
        src={asset.imageSrc}
        alt=""
        className="weeklyActivityCardAvatar"
        width={56}
        height={56}
        loading="lazy"
      />
    );
  }

  return (
    <div className={`weeklyActivityCardAvatar weeklyActivityCardAvatar--${kind}`} aria-hidden="true">
      {kind === 'download' ? '↓' : kind === 'activity' ? '★' : '•'}
    </div>
  );
}

function ActivityLink({
  activity,
  locked = false,
  lockedLabel = 'Complete B-4 Check-In to unlock',
}: {
  activity: WeeklyAdventureActivity;
  locked?: boolean;
  lockedLabel?: string;
}) {
  const content = (
    <>
      <div className="weeklyActivityCardStrip" aria-hidden="true" />
      <div className="weeklyActivityCardBody">
        <ActivityIcon characterId={activity.characterId} kind={activity.kind} />
        <div className="weeklyActivityCardText">
          <h3 className="weeklyActivityCardTitle">{activity.title}</h3>
          <p className="weeklyActivityCardDesc">{activity.description}</p>
        </div>
      </div>
      <div className="weeklyActivityCardFoot">
        <span />
        <span className="weeklyActivityCardCta">
          {locked ? lockedLabel : activity.cta}
          {!locked ? <span aria-hidden="true">→</span> : null}
        </span>
      </div>
    </>
  );

  if (locked) {
    return (
      <div className="weeklyActivityCard weeklyActivityCard--locked" aria-disabled="true">
        {content}
      </div>
    );
  }

  const isExternal = activity.href.startsWith('/downloads') || activity.href.startsWith('http');

  if (isExternal) {
    return (
      <a href={activity.href} className="weeklyActivityCard weeklyActivityCard--link">
        {content}
      </a>
    );
  }

  return (
    <Link to={activity.href} className="weeklyActivityCard weeklyActivityCard--link">
      {content}
    </Link>
  );
}

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
  const isBaselineGated = baselineLocked && weekNumber === 1;
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
        <div className="family-dash-grid family-dash-grid--2 weeklyAdventureWeekGrid">
          {activities.map((activity) =>
            activity.characterId ? (
              <CharacterAdventureCard
                key={activity.id}
                characterId={activity.characterId}
                title={activity.title}
                description={activity.description}
                cta={activity.cta}
                href={activity.href}
                status={activity.kind === 'game' ? 'Week 1' : undefined}
                locked={isBaselineGated}
                lockedLabel={baselineLockedLabel}
              />
            ) : (
              <ActivityLink
                key={activity.id}
                activity={activity}
                locked={isBaselineGated}
                lockedLabel={baselineLockedLabel}
              />
            ),
          )}
        </div>
      )}
    </section>
  );
}
