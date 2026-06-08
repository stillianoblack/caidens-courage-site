import React from 'react';
import { Link } from 'react-router-dom';
import type { DetectiveRankConfig, MissionBoardItem, MissionDashboardHeaderConfig } from '../../types/missionBoard';
import MissionDashboardHeader from './MissionDashboardHeader';
import MissionPath from './MissionPath';
import PortalBackButton from '../portal/PortalBackButton';
import { getPortalRoute } from '../../lib/portalGamePaths';
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
      {smartBack ? (
        <div className="mission-boardTopBack">
          <PortalBackButton hubName="Character Hub" to={getPortalRoute('characters')} />
        </div>
      ) : null}

      <MissionDashboardHeader {...header} avatar={avatar} rank={rank} statusPill={statusPill} />

      {progressionHint ? <p className="mission-boardProgressHint">{progressionHint}</p> : null}

      <MissionPath missions={missions} onSelectMission={onSelectMission} pathVariant={pathVariant} />

      {backLink ? (
        <div className="mission-boardFoot">
          <Link to={backLink.to} className="mission-boardBackBtn">
            {backLink.label}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
