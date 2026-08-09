import React from 'react';
import type { AdventureMonthRecord } from '../../types/adventureMonth';
import './weekly-adventure-month-hero.css';

type WeeklyAdventureMonthHeroProps = {
  month: AdventureMonthRecord;
};

export default function WeeklyAdventureMonthHero({ month }: WeeklyAdventureMonthHeroProps) {
  const certificateLabel = month.certificate_title || month.certificate_reward_name;

  return (
    <section
      className="weeklyExploreMonthHero"
      aria-labelledby={`weekly-explore-month-${month.month_number}`}
    >
      {month.month_hero_image_url ? (
        <img
          className="weeklyExploreMonthHeroImage"
          src={month.month_hero_image_url}
          alt=""
          loading="eager"
          decoding="async"
        />
      ) : null}
      <div className="weeklyExploreMonthHeroScrim" aria-hidden="true" />
      <div className="weeklyExploreMonthHeroContent">
        <p className="weeklyExploreMonthHeroEyebrow">Month {month.month_number}</p>
        <h1 id={`weekly-explore-month-${month.month_number}`} className="weeklyExploreMonthHeroTitle">
          {month.month_title}
        </h1>
        {month.month_subtitle ? (
          <p className="weeklyExploreMonthHeroSubtitle">{month.month_subtitle}</p>
        ) : null}
        {month.month_description ? (
          <p className="weeklyExploreMonthHeroDescription">{month.month_description}</p>
        ) : null}
        <div className="weeklyExploreMonthHeroCertificate" aria-label="Monthly certificate goal">
          <span className="weeklyExploreMonthHeroCertificateIcon" aria-hidden="true">🏅</span>
          <span>
            {certificateLabel ? <strong>{certificateLabel}</strong> : <strong>Monthly certificate</strong>}
            <small>
              Complete {month.certificate_required_weeks} required week
              {month.certificate_required_weeks === 1 ? '' : 's'}
              {month.certificate_reward_name && month.certificate_reward_name !== certificateLabel
                ? ` to earn ${month.certificate_reward_name}`
                : ''}
              .
            </small>
          </span>
        </div>
      </div>
    </section>
  );
}
