import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatSelFocusLine } from '../../lib/adventureSelFocus';
import { isKidShellDisplayImageUrl } from '../../lib/kidShellDisplayImages';
import { resolveWeeklyAdventureWeekAccent } from '../../lib/weeklyAdventureWeekAccent';
import type { WeeklyAdventureWeekTileVariant } from './WeeklyAdventureWeekTile';
import './weekly-adventure-journey.css';

export type WeeklyAdventureJourneyCardProps = {
  weekNumber: number;
  title: string;
  selFocus: string;
  thumbnailUrl?: string | null;
  statusLabel: string;
  variant: WeeklyAdventureWeekTileVariant;
  ctaLabel: string;
  rewardPreview: string;
  rewardImageUrl?: string | null;
  journeyState: 'completed' | 'current' | 'locked';
  href?: string;
  onAction?: () => void;
  disabled?: boolean;
  isSelected?: boolean;
  className?: string;
};

function JourneyCardThumb({ src }: { src?: string | null }) {
  const [failed, setFailed] = useState(false);
  if (!isKidShellDisplayImageUrl(src) || failed) return null;
  return (
    <img
      src={src}
      alt=""
      className="weeklyJourneyCardThumb"
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

export default function WeeklyAdventureJourneyCard({
  weekNumber,
  title,
  selFocus,
  thumbnailUrl,
  statusLabel,
  variant,
  ctaLabel,
  rewardPreview,
  rewardImageUrl,
  journeyState,
  href,
  onAction,
  disabled = false,
  isSelected = false,
  className = '',
}: WeeklyAdventureJourneyCardProps) {
  const selFocusLine = formatSelFocusLine(selFocus) ?? selFocus;
  const weekAccent = resolveWeeklyAdventureWeekAccent(weekNumber);
  const pillVariant =
    isSelected && variant === 'available' ? 'selected' : variant;

  const cardClass = [
    'weeklyJourneyCard',
    `weeklyJourneyCard--${variant}`,
    `weeklyJourneyCard--${journeyState}`,
    isSelected ? 'weeklyJourneyCard--selected' : '',
    disabled ? 'weeklyJourneyCard--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const body = (
    <>
      <div className="weeklyJourneyCardMedia">
        <JourneyCardThumb src={thumbnailUrl} />
        <span className={`weeklyJourneyCardPill weeklyJourneyCardPill--${pillVariant}`}>
          {statusLabel}
        </span>
      </div>

      <div className="weeklyJourneyCardBody">
        <p className="weeklyJourneyCardEyebrow">Week {weekNumber}</p>
        <h3 className="weeklyJourneyCardTitle">{title}</h3>
        {selFocusLine ? <p className="weeklyJourneyCardSel">{selFocusLine}</p> : null}

        <div className="weeklyJourneyCardReward" aria-label={rewardPreview}>
          {rewardImageUrl ? (
            <img src={rewardImageUrl} alt="" className="weeklyJourneyCardRewardIcon" loading="lazy" />
          ) : (
            <span className="weeklyJourneyCardRewardDot" aria-hidden="true" />
          )}
          <span className="weeklyJourneyCardRewardText">{rewardPreview}</span>
        </div>

        <span className="weeklyJourneyCardCta">{ctaLabel}</span>
      </div>
    </>
  );

  if (disabled || variant === 'locked') {
    return (
      <article
        className={cardClass}
        id={`journey-week-${weekNumber}`}
        data-week-accent={weekAccent}
      >
        {body}
      </article>
    );
  }

  if (onAction) {
    return (
      <button
        type="button"
        className={cardClass}
        id={`journey-week-${weekNumber}`}
        data-week-accent={weekAccent}
        onClick={onAction}
        aria-current={isSelected ? 'true' : undefined}
      >
        {body}
      </button>
    );
  }

  if (href) {
    return (
      <Link
        to={href}
        className={cardClass}
        id={`journey-week-${weekNumber}`}
        data-week-accent={weekAccent}
        aria-current={isSelected ? 'true' : undefined}
      >
        {body}
      </Link>
    );
  }

  return (
    <article
      className={cardClass}
      id={`journey-week-${weekNumber}`}
      data-week-accent={weekAccent}
    >
      {body}
    </article>
  );
}
