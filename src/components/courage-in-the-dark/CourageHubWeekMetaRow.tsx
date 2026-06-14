import React from 'react';
import { formatSelFocusLine } from '../../lib/adventureSelFocus';
import './courage-hub-week-meta-row.css';

type CourageHubWeekMetaRowProps = {
  week: number;
  weekTitle: string;
  selFocus?: string;
  comicThumbnailUrl?: string | null;
  headerTrailing?: React.ReactNode;
  subtitle?: string;
};

export default function CourageHubWeekMetaRow({
  week,
  weekTitle,
  selFocus,
  comicThumbnailUrl,
  headerTrailing,
  subtitle,
}: CourageHubWeekMetaRowProps) {
  const selFocusLine = selFocus ? formatSelFocusLine(selFocus) ?? selFocus : null;

  return (
    <div className="courageHubWeekMetaRow">
      {comicThumbnailUrl ? (
        <img
          src={comicThumbnailUrl}
          alt=""
          className="courageHubWeekMetaRowThumb"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="courageHubWeekMetaRowThumb courageHubWeekMetaRowThumb--fallback" aria-hidden="true">
          W{week}
        </div>
      )}
      <div className="courageHubWeekMetaRowCopy">
        <p className="courageHubWeekMetaRowEyebrow">Week {week}</p>
        <h2 className="courageHubWeekMetaRowTitle">{weekTitle}</h2>
        {subtitle ? <p className="courageHubWeekMetaRowSubtitle">{subtitle}</p> : null}
        {selFocusLine ? <p className="courageHubWeekMetaRowSel">{selFocusLine}</p> : null}
      </div>
      {headerTrailing ? (
        <div className="courageHubWeekMetaRowTrailing">{headerTrailing}</div>
      ) : null}
    </div>
  );
}
