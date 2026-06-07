import React from 'react';
import { Link } from 'react-router-dom';
import type { MissionBoardItem } from '../../types/missionBoard';
import FolderTab from './FolderTab';
import MissionPreviewGraphic from './MissionPreviewGraphic';

type MissionFolderCardProps = {
  mission: MissionBoardItem;
  onSelect?: () => void;
  className?: string;
  layout?: 'board' | 'stack';
};

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="mission-folderLockIcon" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function MissionFolderCard({
  mission,
  onSelect,
  className = '',
  layout = 'board',
}: MissionFolderCardProps) {
  const isLocked = mission.status === 'locked';
  const isCompleted = mission.status === 'completed';
  const isActive = mission.status === 'active';

  const cardClass = [
    'mission-folderCard',
    `mission-folderCard--${mission.status}`,
    `mission-folderCard--${mission.artworkType}`,
    layout === 'stack' ? 'mission-folderCard--stacked' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <FolderTab label={mission.folderLabel} completed={isCompleted} locked={isLocked} />
      {isLocked ? (
        <span className="mission-folderLockWrap" aria-hidden="true">
          <LockIcon />
        </span>
      ) : null}

      <div className="mission-folderPaper">
        <span className="mission-folderFileNum">
          {mission.artworkType === 'focus-quest' || mission.artworkType === 'focus-locked'
            ? `Quest #${mission.fileNumber}`
            : `File #${mission.fileNumber}`}
        </span>
        <MissionPreviewGraphic artworkType={mission.artworkType} />
        <div className="mission-folderBody">
          <span className="mission-folderTitle">{mission.title}</span>
          <span className="mission-folderDesc">{mission.description}</span>
        </div>
        {!isLocked ? (
          <span className="mission-folderCta">
            <span className="mission-folderCtaText">
              {mission.artworkType === 'focus-quest' ? 'Start Quest' : 'Open Case'}
            </span>
            <span className="mission-folderCtaArrow">→</span>
          </span>
        ) : (
          <span className="mission-folderComingNext">Coming Next</span>
        )}
      </div>
    </>
  );

  if (isLocked) {
    return (
      <div
        className={cardClass}
        role="listitem"
        aria-label={`File ${mission.fileNumber}: ${mission.title}. Locked.`}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      to={mission.route}
      className={cardClass}
      role="listitem"
      onClick={onSelect}
      aria-label={`File ${mission.fileNumber}: ${mission.title}. Open case.`}
      aria-current={isActive ? 'step' : undefined}
    >
      {content}
    </Link>
  );
}
