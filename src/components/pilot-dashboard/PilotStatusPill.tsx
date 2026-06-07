import React from 'react';

type PilotStatusPillProps = {
  status: string;
  tone: 'available' | 'locked' | 'complete' | 'review';
  showLock?: boolean;
};

export default function PilotStatusPill({ status, tone, showLock = false }: PilotStatusPillProps) {
  return (
    <span className={`pilot-dash-pill pilot-dash-pill--${tone}`}>
      {showLock ? (
        <svg className="pilot-dash-lockIcon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
            clipRule="evenodd"
          />
        </svg>
      ) : null}
      {status}
    </span>
  );
}
