import React from 'react';
import type { DetectiveRankConfig, MissionDashboardHeaderConfig } from '../../types/missionBoard';
import DetectiveRankPill from './DetectiveRankPill';

type MissionDashboardHeaderProps = MissionDashboardHeaderConfig & {
  avatar?: React.ReactNode;
  rank?: DetectiveRankConfig;
  statusPill?: string;
  className?: string;
};

export default function MissionDashboardHeader({
  avatar,
  rank,
  statusPill,
  eyebrow,
  title,
  subtitle,
  intro,
  className = '',
}: MissionDashboardHeaderProps) {
  return (
    <header className={['mission-boardHeader', className].filter(Boolean).join(' ')}>
      {statusPill ? <span className="mission-boardStatusPill">{statusPill}</span> : null}
      {avatar ? (
        <div className="mission-boardHeaderAvatar">
          {avatar}
          {rank ? <DetectiveRankPill rankTitle={rank.rankTitle} statusLine={rank.statusLine} /> : null}
        </div>
      ) : null}
      <p className="mission-boardEyebrow">{eyebrow}</p>
      <h1 className="mission-boardTitle">{title}</h1>
      <p className="mission-boardSubtitle">{subtitle}</p>
      <p className="mission-boardIntro">{intro}</p>
    </header>
  );
}
