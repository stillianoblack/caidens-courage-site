import React from 'react';
import B4BaselineTopBar from '../../b4-baseline-check/B4BaselineTopBar';

type GameHeaderProps = {
  progressPct: number;
  onExit: () => void;
  flames?: number;
  showProgress?: boolean;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
};

/** Thin wrapper around B4BaselineTopBar for shared game/assessment headers. */
export default function GameHeader(props: GameHeaderProps) {
  return <B4BaselineTopBar {...props} />;
}
