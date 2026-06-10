import React from 'react';

export type BaselineBarTone = 'feelings' | 'reading' | 'focus' | 'overall' | 'story' | 'creative';

export type BaselineBarRow = {
  key: string;
  label: string;
  pct: number;
  tone: BaselineBarTone;
  labelDetail?: string;
};

type BaselineOverviewBarsProps = {
  rows: BaselineBarRow[];
  className?: string;
  emptyMessage?: string;
};

export default function BaselineOverviewBars({
  rows,
  className = '',
  emptyMessage,
}: BaselineOverviewBarsProps) {
  if (rows.length === 0) {
    return emptyMessage ? <p className="ds-baselineBarsEmpty">{emptyMessage}</p> : null;
  }

  return (
    <div className={`ds-baselineBars${className ? ` ${className}` : ''}`}>
      {rows.map((row) => (
        <div key={row.key} className="ds-baselineBarRow">
          <div className="ds-baselineBarMeta">
            <span className="ds-baselineBarLabel">{row.label}</span>
            <span className="ds-baselineBarPct">{row.pct}%</span>
          </div>
          {row.labelDetail ? <p className="ds-baselineBarDetail">{row.labelDetail}</p> : null}
          <div className="ds-baselineBarTrack" aria-hidden="true">
            <div
              className={`ds-baselineBarFill ds-baselineBarFill--${row.tone}`}
              style={{ width: `${Math.min(100, Math.max(0, row.pct))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
