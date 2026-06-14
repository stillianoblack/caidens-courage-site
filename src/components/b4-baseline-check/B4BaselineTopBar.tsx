import React from 'react';
import GameplayTopBar from '../../design-system/game/GameplayTopBar';
import { B4_AVATAR_SRC } from '../../data/b4/avatar';

const B4_IMG = B4_AVATAR_SRC;
const FLAME_SRC = '/images/icons/focus-flame-mark.svg';

type B4BaselineTopBarProps = {
  progressPct: number;
  onExit: () => void;
  flames?: number;
  showProgress?: boolean;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  playerName?: string;
  playerIndex?: number;
  hubName?: string;
  backHref?: string;
};

export default function B4BaselineTopBar({
  progressPct,
  onExit,
  flames = 5,
  showProgress = true,
  soundEnabled = true,
  onToggleSound,
  playerName,
  playerIndex = 1,
  hubName,
  backHref,
}: B4BaselineTopBarProps) {
  return (
    <GameplayTopBar
      variant="b4"
      hubName={hubName}
      backHref={backHref}
      onBack={hubName && !backHref ? onExit : undefined}
      progressPercent={progressPct}
      showProgress={showProgress}
      playerName={playerName}
      playerIndex={playerIndex}
      showFlameStatus
      flameDisplay="multi"
      flamesLit={flames}
      soundEnabled={soundEnabled}
      onToggleSound={onToggleSound}
    />
  );
}

export function B4Avatar({ size = 'hero', src }: { size?: 'hero' | 'hub' | 'quiz' | 'large'; src?: string }) {
  const className =
    size === 'quiz' || size === 'large'
      ? 'bbc-quizB4'
      : size === 'hub'
        ? 'bbc-hubB4'
        : 'bbc-b4Avatar';

  const avatar = (
    <div className={className} aria-hidden={size !== 'hero'}>
      <img src={src ?? B4_IMG} alt="" decoding="async" />
    </div>
  );

  if (size === 'hero') {
    return <div className="bbc-b4Hero">{avatar}</div>;
  }

  return avatar;
}

export function B4BaselineDecor() {
  return (
    <>
      <div className="bbc-deco bbc-deco--flame bbc-deco--tl" aria-hidden="true">
        <img src={FLAME_SRC} alt="" />
      </div>
      <div className="bbc-deco bbc-deco--circle bbc-deco--tr" aria-hidden="true" />
      <div className="bbc-deco bbc-deco--dots bbc-deco--bl" aria-hidden="true" />
      <div className="bbc-deco bbc-deco--arc bbc-deco--br" aria-hidden="true" />
    </>
  );
}
