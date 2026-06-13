import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { B4_AVATAR_SRC } from '../../data/b4/avatar';
import { familyPortalPath } from '../../lib/familyPortalPaths';

export default function FamilyWeeklyAdventureCtaBanner() {
  const location = useLocation();
  const adventuresPath = familyPortalPath('weekly-adventures', location.pathname);

  return (
    <section className="family-weeklyAdventureCta" aria-labelledby="family-weekly-adventure-cta-title">
      <div className="family-weeklyAdventureCtaInner">
        <div className="family-weeklyAdventureCtaCopy">
          <h2 id="family-weekly-adventure-cta-title" className="family-weeklyAdventureCtaTitle">
            Play This Week&apos;s Challenge
          </h2>
          <p className="family-weeklyAdventureCtaText">
            Start your Focus Flame adventure and earn rewards.
          </p>
          <Link to={adventuresPath} className="family-weeklyAdventureCtaBtn">
            Go to Weekly Adventures
          </Link>
        </div>
        <div className="family-weeklyAdventureCtaArt" aria-hidden="true">
          <img
            src={B4_AVATAR_SRC}
            alt=""
            width={88}
            height={88}
            loading="lazy"
            decoding="async"
            className="family-weeklyAdventureCtaAvatar"
          />
        </div>
      </div>
    </section>
  );
}
