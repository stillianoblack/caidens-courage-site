import React from 'react';

type GamePlayerPillProps = {
  displayName?: string;
  playerIndex?: number;
};

export default function GamePlayerPill({ displayName, playerIndex = 1 }: GamePlayerPillProps) {
  const name = displayName?.trim();
  if (!name) return null;

  return (
    <span className="bbc-playerPill" aria-label={`Playing as ${name}`}>
      {name} · Player {playerIndex}
    </span>
  );
}
