import React from 'react';
import { resolveAdventureThumbnailUrl } from '../../lib/adventureThumbnail';
import { formatWeekHeader } from '../../lib/gameDisplayTitles';
import TrailConnector from './TrailConnector';
import TrailNode from './TrailNode';
import type { AdventureTrailWeekView } from '../../types/adventureTrail';

export type TrailWeekSectionProps = {
  week: AdventureTrailWeekView;
  baselineLockedLabel?: string;
  baselineLocked?: boolean;
  pilotStartDate: Date | string | null;
};

export default function TrailWeekSection({
  week,
  baselineLockedLabel = 'Complete B-4 Check-In to unlock',
  baselineLocked = false,
}: TrailWeekSectionProps) {
  const isWeekLocked = week.weekStatus === 'locked';
  const thumbnailSrc = week.thumbnailUrl ?? resolveAdventureThumbnailUrl(null, week.week);

  return (
    <section
      id={`week-${week.week}`}
      className={`trailWeekSection${isWeekLocked ? ' trailWeekSection--locked' : ''}`}
      aria-labelledby={`trail-week-${week.week}-title`}
    >
      <header className="trailWeekSectionHead">
        <div className="trailWeekSectionThumbWrap">
          {thumbnailSrc ? (
            <img
              src={thumbnailSrc}
              alt=""
              className="trailWeekSectionThumb trailWeekSectionThumb--art"
              width={115}
              height={131}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="trailWeekSectionThumb trailWeekSectionThumb--placeholder" aria-hidden="true">
              <span className="trailWeekSectionThumbLabel">W{week.week}</span>
            </div>
          )}
        </div>

        <div className="trailWeekSectionHeadText">
          <h2 id={`trail-week-${week.week}-title`} className="trailWeekSectionTitle">
            {formatWeekHeader(week.week, week.title)}
          </h2>
          <p className="trailWeekSectionSubtitle">SEL Focus: {week.selFocus}</p>
        </div>

        <span
          className={`trailWeekSectionStatus trailWeekSectionStatus--${week.weekStatus}`}
          role="status"
        >
          {week.unlockStatus}
        </span>
      </header>

      {isWeekLocked ? (
        <div className="trailWeekSectionPreview">
          <p className="trailWeekSectionPreviewLabel">Preview</p>
          <ul className="trailWeekSectionPreviewList">
            {week.previewActivities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : (
        <ol className="trailWeekSectionPath">
          {week.nodes.map((node, index) => (
            <li key={node.id} className="trailWeekSectionPathItem">
              <TrailNode
                node={node}
                lockedHelperText={
                  node.state === 'locked' && baselineLocked
                    ? baselineLockedLabel
                    : undefined
                }
              />
              {index < week.nodes.length - 1 ? (
                <TrailConnector active={node.state === 'complete'} />
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
