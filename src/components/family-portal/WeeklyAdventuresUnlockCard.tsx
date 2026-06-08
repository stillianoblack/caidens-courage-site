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
          Unlock Your Weekly Adventures
        </h2>
        <p className="weeklyAdventuresUnlockCardCopy">
          Complete a quick B-4 Check-In to unlock games, coloring pages, and weekly activities. This
          helps B-4 understand how you focus, read, and grow.
        </p>
        <Link to={baselinePath} className="weeklyAdventuresUnlockCardBtn">
          Start B-4 Check-In
        </Link>
        <p className="weeklyAdventuresUnlockCardNote">Takes about 5 minutes. No bad answers.</p>
      </div>
    </section>
  );
}
