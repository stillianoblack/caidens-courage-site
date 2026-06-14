import React from 'react';
import { Link } from 'react-router-dom';
import type { AdventureTrailWeekView } from '../../types/adventureTrail';
import { resolveAdventureThumbnailUrl } from '../../lib/adventureThumbnail';
import type { AdventureModuleRecord } from '../../types/adventureModule';
import './completed-weeks-section.css';

export type CompletedWeekCardView = AdventureTrailWeekView & {
  cmsModule?: AdventureModuleRecord | null;
  completionLabel?: string;
};

type CompletedWeeksSectionProps = {
  weeks: CompletedWeekCardView[];
  reviewBasePath: string;
};

export default function CompletedWeeksSection({
  weeks,
  reviewBasePath,
}: CompletedWeeksSectionProps) {
  if (weeks.length === 0) return null;

  return (
    <section className="completedWeeksSection" aria-labelledby="completed-weeks-title">
      <h2 id="completed-weeks-title" className="completedWeeksSectionTitle">
        Completed Weeks
      </h2>
      <div className="completedWeeksGrid" role="list">
        {weeks.map((week) => {
          const thumb = resolveAdventureThumbnailUrl(week.cmsModule, week.week);
          const reviewHref = `${reviewBasePath}#week-${week.week}`;

          return (
            <article key={week.week} className="completedWeekCard" role="listitem">
              <div className="completedWeekCardThumbWrap">
                {thumb ? (
                  <img
                    src={thumb}
                    alt=""
                    className="completedWeekCardThumb"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="completedWeekCardThumb completedWeekCardThumb--placeholder" aria-hidden="true">
                    W{week.week}
                  </div>
                )}
              </div>
              <div className="completedWeekCardBody">
                <p className="completedWeekCardEyebrow">Week {week.week}</p>
                <h3 className="completedWeekCardTitle">{week.title}</h3>
                <p className="completedWeekCardSel">{week.selFocus}</p>
                <p className="completedWeekCardStatus">{week.completionLabel ?? 'Complete'}</p>
                <Link to={reviewHref} className="completedWeekCardReviewBtn">
                  Review
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
