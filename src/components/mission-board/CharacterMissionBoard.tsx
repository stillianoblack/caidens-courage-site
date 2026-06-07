import React from 'react';
import { Link } from 'react-router-dom';
import type { DetectiveRankConfig, MissionBoardItem, MissionDashboardHeaderConfig } from '../../types/missionBoard';
import MissionDashboardHeader from './MissionDashboardHeader';
import MissionPath from './MissionPath';
import PortalSmartBackButton from '../family-portal/PortalSmartBackButton';
import './mission-board.css';

type CharacterMissionBoardProps = {
  header: MissionDashboardHeaderConfig;
  missions: MissionBoardItem[];
  avatar?: React.ReactNode;
  rank?: DetectiveRankConfig;
  backLink?: { to: string; label: string };
  smartBack?: boolean;
  onSelectMission?: (mission: MissionBoardItem) => void;
  className?: string;
  pathVariant?: 'miranda' | 'caiden';
  statusPill?: string;
  progressionHint?: string;
};

export default function CharacterMissionBoard({
  header,
  missions,
  avatar,
  rank,
  backLink,
  smartBack = false,
  onSelectMission,
  className = '',
  pathVariant = 'miranda',
  statusPill,
  progressionHint,
}: CharacterMissionBoardProps) {
  return (
    <div className={['characterMissionBoard', className].filter(Boolean).join(' ')}>
      <MissionDashboardHeader {...header} avatar={avatar} rank={rank} statusPill={statusPill} />

      {progressionHint ? <p className="mission-boardProgressHint">{progressionHint}</p> : null}

      <MissionPath missions={missions} onSelectMission={onSelectMission} pathVariant={pathVariant} />

      {smartBack ? (
        <div className="mission-boardFoot">
          <PortalSmartBackButton />
        </div>
      ) : backLink ? (
        <div className="mission-boardFoot">
          <Link to={backLink.to} className="mission-boardBackBtn">
            {backLink.label}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
