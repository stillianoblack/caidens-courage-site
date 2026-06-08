import React from 'react';
import { Link } from 'react-router-dom';
import type { AdultTrainingCard as AdultTrainingCardData } from '../../data/pilotDashboardContent';
import './adult-training-card.css';

type AdultTrainingCardProps = {
  card: AdultTrainingCardData;
  lockedCta?: string;
};

export default function AdultTrainingCard({ card, lockedCta = 'Coming Soon' }: AdultTrainingCardProps) {
  const content = (
    <>
      <div className="adultTraining-cardMedia">
        <img src={card.imageSrc} alt="" className="adultTraining-cardAvatar" loading="lazy" decoding="async" />
      </div>
      <div className="adultTraining-cardBody">
        <p className="adultTraining-cardEyebrow">{card.mission}</p>
        <h3 className="adultTraining-cardTitle">{card.title}</h3>
        {card.description ? (
          <p className="adultTraining-cardDescription">{card.description}</p>
        ) : null}
        <p className="adultTraining-cardAudience">{card.audience}</p>
        <div className="adultTraining-cardFooter">
          <span className="adultTraining-cardBadge">{card.badge}</span>
          <span className={`adultTraining-cardCta${card.available ? '' : ' adultTraining-cardCta--disabled'}`}>
            {card.available ? card.cta : lockedCta}
          </span>
        </div>
      </div>
    </>
  );

  const themeClass = card.theme ? ` adultTraining-card--${card.theme}` : '';

  if (!card.available) {
    return (
      <div className={`adultTraining-card adultTraining-card--locked${themeClass}`} aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <Link to={card.href} className={`adultTraining-card${themeClass}`}>
      {content}
    </Link>
  );
}
