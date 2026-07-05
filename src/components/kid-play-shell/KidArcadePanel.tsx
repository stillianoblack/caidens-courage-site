import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GameCard from './GameCard';
import { getKidPlayShellRoute, parseKidPlayShellPath } from '../../lib/kidPlayShellRoutes';
import {
  clearB4FocusFlightHighlight,
  getB4FocusFlightUnlockState,
  markB4FocusFlightArcadeVisited,
} from '../../lib/b4FocusFlightUnlock';
import './kid-arcade.css';

const B4_BEST_SCORE_KEY = 'b4-focus-flight:best-score';
const B4_LEVEL_1_COMPLETE_KEY = 'b4-focus-flight:level-1-complete';

const readNumber = (key: string): number => {
  if (typeof window === 'undefined') return 0;
  const stored = window.localStorage.getItem(key);
  return stored ? Number.parseInt(stored, 10) || 0 : 0;
};

const readFlag = (key: string): boolean => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(key) === 'true';
};

export default function KidArcadePanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const shellContext = parseKidPlayShellPath(location.pathname);
  const [bestScore, setBestScore] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);
  const [highlightB4Card, setHighlightB4Card] = useState(false);
  const [showB4NewPill, setShowB4NewPill] = useState(false);
  const launchB4FromUnlock = new URLSearchParams(location.search).get('launch') === 'b4-focus-flight';

  const b4GamePath = useMemo(() => {
    if (!shellContext) return '/kids/games/b4-focus-flight';
    return `${getKidPlayShellRoute(shellContext.sessionId, 'arcade')}/b4-focus-flight`;
  }, [shellContext]);

  useEffect(() => {
    setBestScore(readNumber(B4_BEST_SCORE_KEY));
    setLevelComplete(readFlag(B4_LEVEL_1_COMPLETE_KEY));
    const unlockState = getB4FocusFlightUnlockState();
    setHighlightB4Card(unlockState.shouldHighlightCard || launchB4FromUnlock);
    setShowB4NewPill(unlockState.unlocked && !unlockState.played);
    markB4FocusFlightArcadeVisited();

    if (launchB4FromUnlock) {
      const launchTimer = window.setTimeout(() => navigate(b4GamePath, { replace: true }), 1250);
      return () => window.clearTimeout(launchTimer);
    }

    if (unlockState.shouldHighlightCard) {
      const timer = window.setTimeout(() => {
        setHighlightB4Card(false);
        clearB4FocusFlightHighlight();
      }, 4200);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [b4GamePath, launchB4FromUnlock, navigate]);

  // TODO(progress): Unlock B-4 after Week 1 completion, unlock Level 2 after
  // Level 1 completion, and unlock Dragon Flight after Week 3 once profile
  // progress is available in the kid shell.
  return (
    <section className="kidArcadePanel" aria-labelledby="kid-arcade-title">
      <header className="kidArcadeHeader">
        <h1 className="kidPlayShellPageTitle" id="kid-arcade-title">Kid Arcade</h1>
        <p className="kidArcadeSubtitle">Choose your courage game</p>
      </header>

      <div className="kidArcadeGrid" role="list">
        <GameCard
          title="B-4 Focus Flight"
          description="Help B-4 collect Focus Flames and stay steady through the storm."
          statusLabel={levelComplete ? 'Level 1 Complete' : 'Level 1: Spark Run'}
          bestScore={bestScore}
          ctaLabel="Play"
          variant="blue"
          thumbnailSrc="/images/B-4FlightGame/Idle/Idle@2x-transparent.png"
          newTraining={showB4NewPill}
          highlight={highlightB4Card}
          onPlay={() => navigate(b4GamePath)}
        />
        <GameCard
          title="Dragon Flight"
          description="Soar with courage through windy skies."
          statusLabel="Unlocks after Week 3"
          starsLabel="0 stars"
          ctaLabel="Play"
          variant="dragon"
          locked
          artLabel="DF"
          unlockText="Unlocks after Week 3"
        />
        <GameCard
          title="Memory Match"
          description="Match courage tools and grow your focus."
          statusLabel="Coming Soon"
          starsLabel="0 stars"
          ctaLabel="Play"
          variant="memory"
          locked
          artLabel="MM"
          unlockText="Coming soon"
        />
        <GameCard
          title="Focus Builder"
          description="Practice steady choices in quick mini-challenges."
          statusLabel="Coming Soon"
          starsLabel="0 stars"
          ctaLabel="Play"
          variant="focus"
          locked
          artLabel="FB"
          unlockText="Coming soon"
        />
        {Array.from({ length: 5 }).map((_, index) => (
          <GameCard
            key={`future-${index}`}
            title="Mystery Game"
            description="A new courage challenge will land here soon."
            statusLabel="Coming Soon"
            starsLabel="0 stars"
            ctaLabel="Play"
            variant="empty"
            locked
            artLabel="?"
            unlockText="Coming soon"
          />
        ))}
      </div>
    </section>
  );
}

export { B4_LEVEL_1_COMPLETE_KEY };
