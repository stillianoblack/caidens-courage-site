import React from 'react';

export type CoachProgressBarProps = {
  label: string;
  percent: number;
  className?: string;
};

export default function CoachProgressBar({ label, percent, className = '' }: CoachProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className={['pilot-coachProgress', className].filter(Boolean).join(' ')}>
      <div className="pilot-coachProgressHead">
        <span className="pilot-coachProgressLabel">{label}</span>
        <span className="pilot-coachProgressValue">{Math.round(clamped)}%</span>
      </div>
      <div
        className="pilot-coachProgressTrack"
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <span className="pilot-coachProgressFill" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
