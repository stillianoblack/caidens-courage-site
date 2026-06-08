import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { buildFamilyValueCards } from '../../data/familyPortalContent';
import { resolvePortalKidsBasePath } from '../../lib/portalGamePaths';

export default function FamilyValueCards() {
  const location = useLocation();
  const kidsBase = resolvePortalKidsBasePath(location.pathname);
  const cards = useMemo(() => buildFamilyValueCards(kidsBase), [kidsBase]);

  return (
    <section className="family-valueCards" aria-label="Start learning">
      {cards.map((card) => (
        <Link
          key={card.id}
          to={card.href}
          state={{ from: location.pathname }}
          className={`family-valueCard family-valueCard--${card.characterId}`}
        >
          <span className="family-valueCardStrip" aria-hidden="true" />
          <div className="family-valueCardHero">
            <img
              src={card.imageSrc}
              alt=""
              className="family-valueCardAvatar"
              width={88}
              height={88}
            />
          </div>
          <div className="family-valueCardBody">
            <h3 className="family-valueCardTitle">{card.title}</h3>
            <p className="family-valueCardDesc">{card.body}</p>
          </div>
          <span className="family-valueCardCta">
            {card.cta}
            <span aria-hidden="true">→</span>
          </span>
        </Link>
      ))}
    </section>
  );
}
