import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { familyPortalPath } from '../../lib/familyPortalPaths';
import B4CircleAvatar from '../b4/B4CircleAvatar';

export default function FamilyWeeklyAdventureCtaBanner({ childName }: { childName?: string | null }) {
  const location = useLocation();
  const adventuresPath = familyPortalPath('weekly-adventures', location.pathname);

  return (
    <section className="family-weeklyAdventureCta" aria-labelledby="family-weekly-adventure-cta-title">
      <div className="family-weeklyAdventureCtaInner">
        <div className="family-weeklyAdventureCtaCopy">
          <h2 id="family-weekly-adventure-cta-title" className="family-weeklyAdventureCtaTitle">
            READY FOR AN ADVENTURE?
          </h2>
          <p className="family-weeklyAdventureCtaText">
            Continue {childName?.trim() || 'your child'}&apos;s Focus Flame journey.
          </p>
          <Link to={adventuresPath} className="family-weeklyAdventureCtaBtn">
            Play Adventures
          </Link>
        </div>
        <div className="family-weeklyAdventureCtaArt" aria-hidden="true">
          <B4CircleAvatar
            variant="courage"
            size="medium"
            alt=""
            className="family-weeklyAdventureCtaAvatar"
          />
        </div>
      </div>
    </section>
  );
}
