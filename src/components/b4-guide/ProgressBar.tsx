import React from 'react';

type ProgressBarProps = {
  current: number;
  total: number;
  label?: string;
};

export default function ProgressBar({ current, total, label }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="b4g-progress" role="group" aria-label={label ?? 'Progress'}>
      <div className="b4g-progress-meta">
        <span>{label ?? `Step ${current} of ${total}`}</span>
        <span aria-hidden="true">{pct}%</span>
      </div>
      <div
        className="b4g-progress-track"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={label ?? `Step ${current} of ${total}`}
      >
        <div className="b4g-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
