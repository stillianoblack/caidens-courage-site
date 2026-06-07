import React from 'react';
import { Link } from 'react-router-dom';
import type { MissionBoardItem } from '../../types/missionBoard';

type MissionNodeCardProps = {
  mission: MissionBoardItem;
  icon?: React.ReactNode;
  onSelect?: () => void;
  className?: string;
};

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="mission-nodeLockIcon" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function MissionNodeCard({
  mission,
  icon,
  onSelect,
  className = '',
}: MissionNodeCardProps) {
  const isLocked = mission.status === 'locked';
  const isCompleted = mission.status === 'completed';
  const isActive = mission.status === 'active';

  const cardClass = [
    'mission-nodeCard',
    `mission-nodeCard--${mission.status}`,
    `mission-nodeCard--${mission.artworkType}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <span className="mission-nodeBadge">File #{mission.fileNumber}</span>
      {isCompleted ? (
        <span className="mission-nodeCompleteBadge" aria-label="Completed">
          ✓
        </span>
      ) : null}
      {isLocked ? (
        <span className="mission-nodeLockWrap" aria-hidden="true">
          <LockIcon />
        </span>
      ) : null}

      <span
        className={['mission-nodeIconWrap', `mission-nodeIconWrap--${mission.artworkType}`]
          .filter(Boolean)
          .join(' ')}
        aria-hidden="true"
      >
        {icon}
        <span className="mission-nodeArtworkAccent" aria-hidden="true" />
      </span>

      <span className="mission-nodeBody">
        <span className="mission-nodeTitle">{mission.title}</span>
        <span className="mission-nodeDesc">{mission.description}</span>
      </span>

      <span className="mission-nodeCta" aria-hidden={isLocked}>
        <span className="mission-nodeCtaText">Open Case</span>
        <span className="mission-nodeCtaArrow">→</span>
      </span>
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
