import React, { useEffect } from 'react';
import GameBackgroundDecor from '../components/game-assessment/shared/GameBackgroundDecor';
import '../components/b4-baseline-check/b4-baseline-check.css';
import '../components/game-assessment/miranda-game.css';
import '../components/mission-board/mission-board.css';
import MirandaMysteryFilesHub from '../components/miranda/MirandaMysteryFilesHub';
import { MIRANDA_HUB } from '../data/miranda';

export default function MirandaMysteryFilesHubPage() {
  useEffect(() => {
    document.title = `${MIRANDA_HUB.title} | Caiden's Courage`;
  }, []);

  return (
    <div className="bbc-app miranda-game">
      <GameBackgroundDecor variant="miranda" />
      <main className="bbc-main bbc-main--landing">
        <div className="miranda-hubShell miranda-hubShell--board">
          <MirandaMysteryFilesHub />
        </div>
      </main>
    </div>
  );
}
