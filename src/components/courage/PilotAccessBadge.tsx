import React from 'react';
import './pilot-access.css';

type PilotAccessBadgeProps = {
  className?: string;
  overlay?: boolean;
};

export default function PilotAccessBadge({ className = '', overlay = false }: PilotAccessBadgeProps) {
  return (
    <span
      className={[
        'pilotAccessBadge',
        overlay ? 'pilotAccessBadge--overlay' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      PILOT ACCESS
    </span>
  );
}
