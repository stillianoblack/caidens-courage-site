import React from 'react';
import KidsAdventureIcon from './KidsAdventureIcon';
import type { MonthlyChallengeProgress } from '../../lib/monthlyChallengeProgress';

type MonthChallengeProgressCardProps = {
  progress: MonthlyChallengeProgress;
};

export default function MonthChallengeProgressCard({ progress }: MonthChallengeProgressCardProps) {
  const progressPct =
    progress.weeksTotal > 0
      ? Math.round((progress.weeksCompleted / progress.weeksTotal) * 100)
      : 0;

  return (
    <section className="inventoryMonthChallenge" aria-labelledby="inventory-month-challenge-title">
      <div className="inventoryMonthChallengeLead">
        <span className="inventoryMonthChallengeIcon" aria-hidden="true">
          <KidsAdventureIcon name="badge" size={28} filled />
        </span>
        <div className="inventoryMonthChallengeHeader">
          <p className="inventoryMonthChallengeEyebrow">{progress.title}</p>
          <h2 id="inventory-month-challenge-title" className="inventoryMonthChallengeTitle">
            {progress.tagline}
          </h2>
          <p className="inventoryMonthChallengeDesc">{progress.description}</p>
          <p className="inventoryMonthChallengeRewardSummary">
            Monthly reward: <strong>{progress.certificateName}</strong>
          </p>
        </div>
      </div>

      <div className="inventoryMonthChallengeProgress">
        <div className="inventoryMonthChallengeProgressMeta">
          <span className="inventoryMonthChallengeProgressLabel">Weekly adventures complete</span>
          <span className="inventoryMonthChallengeProgressCount" aria-live="polite">
            {progress.weeksCompleted}/{progress.weeksTotal}
          </span>
        </div>
        <div
          className="inventoryMonthChallengeProgressTrack"
          role="progressbar"
          aria-valuenow={progress.weeksCompleted}
          aria-valuemin={0}
          aria-valuemax={progress.weeksTotal}
          aria-label={`${progress.weeksCompleted} of ${progress.weeksTotal} weeks complete`}
        >
          <div
            className="inventoryMonthChallengeProgressFill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {progress.monthChallengeCompleted ? (
        <p className="inventoryMonthChallengeComplete" role="status">
          Challenge complete! Your {progress.certificateName} is ready.
        </p>
      ) : null}
    </section>
  );
}
