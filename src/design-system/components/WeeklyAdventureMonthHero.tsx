import React from 'react';
import type { AdventureMonthRecord } from '../../types/adventureMonth';
import type { MonthlyChallengeProgress } from '../../lib/monthlyChallengeProgress';
import './weekly-adventure-month-hero.css';

type WeeklyAdventureMonthHeroProps = {
  month: AdventureMonthRecord;
  progress?: MonthlyChallengeProgress | null;
};

export default function WeeklyAdventureMonthHero({ month, progress }: WeeklyAdventureMonthHeroProps) {
  const certificateLabel = month.certificate_title || month.certificate_reward_name;
  const weeksCompleted = progress?.weeksCompleted ?? 0;
  const weeksTotal = progress?.weeksTotal ?? month.certificate_required_weeks;
  const progressPercent = weeksTotal > 0 ? Math.round((weeksCompleted / weeksTotal) * 100) : 0;

  return (
    <aside
      className="weeklyExploreMonthHero"
      aria-labelledby={`weekly-explore-month-${month.month_number}`}
    >
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
        <div className="weeklyExploreMonthHeroProgress">
          <span>{weeksCompleted}/{weeksTotal} weeks complete</span>
          <span>{progress?.certificateEarned ? 'Certificate earned' : 'Certificate journey'}</span>
          <div
            className="weeklyExploreMonthHeroProgressTrack"
            role="progressbar"
            aria-label={`${month.month_title} progress`}
            aria-valuemin={0}
            aria-valuemax={weeksTotal}
            aria-valuenow={weeksCompleted}
          >
            <span style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
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
    </aside>
  );
}
