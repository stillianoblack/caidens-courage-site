import React from 'react';
import { Link } from 'react-router-dom';
import type { FamilyRecommendedNext } from '../../lib/familyOverviewRecommendations';

const B4_AVATAR_SRC = '/images/icons/B4_Chat_Icon.webp';

type FamilyRecommendedNextCardProps = {
  recommendation: FamilyRecommendedNext;
  fromPath?: string;
  className?: string;
};

export default function FamilyRecommendedNextCard({
  recommendation,
  fromPath,
  className = '',
}: FamilyRecommendedNextCardProps) {
  return (
    <section className={`family-panelBlock family-nextStepCard family-recommendedNext${className ? ` ${className}` : ''}`}>
      <div className="family-charCardStrip" aria-hidden="true" />
      <div className="family-panelBlockHead">
        <h2 className="family-panelBlockTitle">Recommended Next Step</h2>
      </div>
      <div className="family-nextCard">
        <div className="family-nextStepHero">
          <img
            src={B4_AVATAR_SRC}
            alt=""
            className="family-charCardAvatar family-charCardAvatar--sm family-recommendedNextB4"
            width={72}
            height={72}
            loading="lazy"
            decoding="async"
          />
          <div>
            <h3 className="family-nextTitle">{recommendation.headline}</h3>
            <p className="family-nextCopy">{recommendation.body}</p>
          </div>
        </div>
        <Link
          to={recommendation.href}
          state={fromPath ? { from: fromPath } : undefined}
          className="family-nextCta"
        >
          {recommendation.cta}
        </Link>
      </div>
    </section>
  );
}
