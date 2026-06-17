import React from 'react';
import { formatSelFocusLine } from '../../lib/adventureSelFocus';
import { resolveWeeklyAdventureWeekAccent } from '../../lib/weeklyAdventureWeekAccent';
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
  const weekAccent = resolveWeeklyAdventureWeekAccent(week);

  return (
    <div className="courageHubWeekMetaRow" data-week-accent={weekAccent}>
      <div className="courageHubWeekMetaRowCover" aria-hidden={comicThumbnailUrl ? undefined : true}>
        {comicThumbnailUrl ? (
          <img
            src={comicThumbnailUrl}
            alt=""
            className="courageHubWeekMetaRowCoverArt"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="courageHubWeekMetaRowCoverArt courageHubWeekMetaRowCoverArt--fallback">
            <span className="courageHubWeekMetaRowCoverFallbackLabel">Week {week}</span>
          </div>
        )}
      </div>
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
