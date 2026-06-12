import React from 'react';
import type { TrailNodeState } from '../../types/adventureTrail';

export type TrailStatusBadgeProps = {
  state: TrailNodeState;
  className?: string;
};

const LABELS: Record<TrailNodeState, string> = {
  complete: 'Complete',
  available: 'Ready',
  locked: 'Locked',
  in_progress: 'Up next',
  coming_soon: 'Coming soon',
};

export default function TrailStatusBadge({ state, className }: TrailStatusBadgeProps) {
  return (
    <span className={['trailStatusBadge', `trailStatusBadge--${state}`, className].filter(Boolean).join(' ')}>
      {LABELS[state]}
    </span>
  );
}
