import React, { useEffect } from 'react';
import MirandaMysteryFilesHub from '../components/miranda/MirandaMysteryFilesHub';
import '../components/mission-board/mission-board.css';
import '../components/miranda/miranda-portal-hub.css';
import '../components/game-assessment/miranda-game.css';
import { MIRANDA_HUB } from '../data/miranda';

export default function MirandaPortalHubPage() {
  useEffect(() => {
    document.title = `${MIRANDA_HUB.title} | Caiden's Courage`;
  }, []);

  return <MirandaMysteryFilesHub />;
}
