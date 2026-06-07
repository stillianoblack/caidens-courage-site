import React from 'react';

type DetectiveRankPillProps = {
  rankTitle: string;
  statusLine: string;
  className?: string;
};

export default function DetectiveRankPill({ rankTitle, statusLine, className = '' }: DetectiveRankPillProps) {
  return (
    <div className={['detective-rankPill', className].filter(Boolean).join(' ')}>
      <span className="detective-rankPillStar" aria-hidden="true">
        ★
      </span>
      <span className="detective-rankPillText">
        <span className="detective-rankPillTitle">{rankTitle}</span>
        <span className="detective-rankPillStatus">{statusLine}</span>
      </span>
    </div>
  );
}
