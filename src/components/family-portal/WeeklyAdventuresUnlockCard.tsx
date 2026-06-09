import React from 'react';
import { Link } from 'react-router-dom';
import './weekly-adventures-unlock-card.css';

type WeeklyAdventuresUnlockCardProps = {
  baselinePath: string;
};

export default function WeeklyAdventuresUnlockCard({ baselinePath }: WeeklyAdventuresUnlockCardProps) {
  return (
    <section className="weeklyAdventuresUnlockCard" aria-labelledby="weekly-adventures-unlock-title">
      <div className="weeklyAdventuresUnlockCardBody">
        <p className="weeklyAdventuresUnlockCardEyebrow">Focus Flame Starter</p>
        <h2 id="weekly-adventures-unlock-title" className="weeklyAdventuresUnlockCardTitle">
          Start B-4 Baseline First
        </h2>
        <p className="weeklyAdventuresUnlockCardCopy">
          Weekly Adventures stay locked until your child completes the full B-4 Check-In (Feelings,
          Reading, and Focus Moves). Start here to unlock games, coloring pages, and weekly
          activities.
        </p>
        <Link to={baselinePath} className="weeklyAdventuresUnlockCardBtn">
          Start B-4 Baseline First
        </Link>
        <p className="weeklyAdventuresUnlockCardNote">Takes about 5 minutes. No bad answers.</p>
      </div>
    </section>
  );
}
