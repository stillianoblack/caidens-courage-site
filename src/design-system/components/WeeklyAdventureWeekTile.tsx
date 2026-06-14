import React from 'react';
import { Link } from 'react-router-dom';
import { formatSelFocusLine } from '../../lib/adventureSelFocus';
import './weekly-adventure-week-tile.css';

export type WeeklyAdventureWeekTileVariant =
  | 'available'
  | 'locked'
  | 'inProgress'
  | 'complete'
  | 'adminPreview';

export type WeeklyAdventureWeekTileProps = {
  weekNumber: number;
  title: string;
  selFocus: string;
  thumbnailUrl?: string | null;
  backgroundUrl?: string | null;
  statusLabel: string;
  variant: WeeklyAdventureWeekTileVariant;
  ctaLabel: string;
  href?: string;
  onAction?: () => void;
  disabled?: boolean;
  className?: string;
};

export default function WeeklyAdventureWeekTile({
  weekNumber,
  title,
  selFocus,
  thumbnailUrl,
  statusLabel,
  variant,
  ctaLabel,
  href,
  onAction,
  disabled = false,
  className = '',
}: WeeklyAdventureWeekTileProps) {
  const selFocusLine = formatSelFocusLine(selFocus) ?? selFocus;

  const body = (
    <>
      <div className="weeklyWeekTileBody">
        <div className="weeklyWeekTileHead">
          <p className="weeklyWeekTileEyebrow">Week {weekNumber}</p>
          <span className={`weeklyWeekTilePill weeklyWeekTilePill--${variant}`}>{statusLabel}</span>
        </div>
        <div className="weeklyWeekTileTitleRow">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt=""
              className="weeklyWeekTileThumb"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="weeklyWeekTileThumb weeklyWeekTileThumb--fallback" aria-hidden="true">
              W{weekNumber}
            </div>
          )}
          <div className="weeklyWeekTileTitleBlock">
            <h3 className="weeklyWeekTileTitle">{title}</h3>
            {selFocusLine ? <p className="weeklyWeekTileSel">{selFocusLine}</p> : null}
          </div>
        </div>
        <span className="weeklyWeekTileCta">{ctaLabel}</span>
      </div>
    </>
  );

  const cardClass = [
    'weeklyWeekTile',
    `weeklyWeekTile--${variant}`,
    disabled ? 'weeklyWeekTile--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (disabled || variant === 'locked') {
    return <div className={cardClass}>{body}</div>;
  }

  if (onAction) {
    return (
      <button type="button" className={cardClass} onClick={onAction}>
        {body}
      </button>
    );
  }

  if (href) {
    return (
      <Link to={href} className={cardClass}>
        {body}
      </Link>
    );
  }

  return <article className={cardClass}>{body}</article>;
}
