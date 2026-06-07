import React from 'react';

type Week0ProgressBarProps = {
  current: number;
  total: number;
  label?: string;
};

export default function Week0ProgressBar({ current, total, label }: Week0ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="ffl-week0-progress" role="group" aria-label={label ?? 'Question progress'}>
      <div className="ffl-week0-progress-label">
        <span>{label ?? `Question ${current} of ${total}`}</span>
        <span aria-hidden="true">{pct}%</span>
      </div>
      <div
        className="ffl-week0-progress-track"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
      >
        <div className="ffl-week0-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
