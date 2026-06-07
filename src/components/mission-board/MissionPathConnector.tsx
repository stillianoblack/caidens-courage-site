import React from 'react';
import type { MissionBoardItem } from '../../types/missionBoard';

type MissionPathConnectorProps = {
  className?: string;
  variant?: 'miranda' | 'caiden';
};

function ClueNode({ cx, cy, kind }: { cx: number; cy: number; kind: 'glass' | 'dot' | 'tag' }) {
  if (kind === 'dot') {
    return <circle cx={cx} cy={cy} r="2.2" fill="#e5c06a" opacity="0.85" />;
  }
  if (kind === 'tag') {
    return (
      <g transform={`translate(${cx - 4} ${cy - 3})`} opacity="0.55">
        <rect x="0" y="0" width="8" height="5" rx="0.5" fill="#faf5ff" stroke="#7c5cbf" strokeWidth="0.6" />
        <text x="4" y="3.5" textAnchor="middle" fill="#7c5cbf" fontSize="2.5" fontWeight="700">
          ?
        </text>
      </g>
    );
  }
  return (
    <g transform={`translate(${cx - 3} ${cy - 3})`} opacity="0.45">
      <circle cx="3" cy="3" r="2.5" fill="none" stroke="#7c5cbf" strokeWidth="0.8" />
      <line x1="5" y1="5" x2="7.5" y2="7.5" stroke="#7c5cbf" strokeWidth="0.8" strokeLinecap="round" />
    </g>
  );
}

export default function MissionPathConnector({
  className = '',
  variant = 'miranda',
}: MissionPathConnectorProps) {
  if (variant === 'caiden') {
    return (
      <svg
        className={['mission-pathConnector', 'mission-pathConnector--caiden', className]
          .filter(Boolean)
          .join(' ')}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="caidenPathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e5c06a" stopOpacity="0.65" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#243e70" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <path
          d="M 12 22 H 88 M 12 22 V 50 H 88 V 78 H 12"
          fill="none"
          stroke="url(#caidenPathGradient)"
          strokeWidth="1.4"
          strokeDasharray="3 3"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  return (
    <svg
      className={['mission-pathConnector', className].filter(Boolean).join(' ')}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="missionPathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c5cbf" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#9b7fd4" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#c9a44a" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <path
        d="M 18 16 L 82 16 L 50 48 L 18 84 L 82 84"
        fill="none"
        stroke="url(#missionPathGradient)"
        strokeWidth="1.6"
        strokeDasharray="3.5 3"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <ClueNode cx={50} cy={16} kind="glass" />
      <ClueNode cx={66} cy={32} kind="dot" />
      <ClueNode cx={34} cy={66} kind="tag" />
      <ClueNode cx={50} cy={84} kind="dot" />
    </svg>
  );
}

export function MissionStackConnector() {
  return <span className="mission-stackConnector" aria-hidden="true" />;
}

export function positionClass(position: MissionBoardItem['desktopPosition']): string {
  return `mission-pathNode--${position}`;
}
