import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import GameShell from './components/GameShell';
import type { B4FocusFlightResult } from './phaser/types';
import { playB4ButtonSound } from './uiAudio';
import { getKidPlayShellRoute, parseKidPlayShellPath } from '../../lib/kidPlayShellRoutes';
import { readLocalKidPlaySessionId } from '../../lib/kidPlaySessionService';
import { getParticipantB4FlightStorageKey, markB4FocusFlightPlayed } from '../../lib/b4FocusFlightUnlock';
import './b4-focus-flight.css';
import { useActiveParticipant } from '../../hooks/useActiveParticipant';
import { useB4Variant } from '../../hooks/useB4Variant';
import { getB4Asset } from '../../data/b4/variantManifest';
import { kidPlayShellNavigate } from '../../lib/kidShellNav';

const BEST_SCORE_KEY = 'b4-focus-flight:best-score';
const LEVEL_1_COMPLETE_KEY = 'b4-focus-flight:level-1-complete';

const readBestScore = (participantId?: string | null): number => {
  if (typeof window === 'undefined') return 0;
  const stored = window.localStorage.getItem(getParticipantB4FlightStorageKey(BEST_SCORE_KEY, participantId));
  return stored ? Number.parseInt(stored, 10) || 0 : 0;
};

const B4FocusFlightPage: React.FC = () => {
  const { participantId } = useActiveParticipant();
  const { variant } = useB4Variant(participantId);
  const navigate = useNavigate();
  const location = useLocation();
  const [started, setStarted] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [missionKey, setMissionKey] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    setBestScore(readBestScore(participantId));
    setStarted(false);
  }, [participantId]);

  const arcadeContext = parseKidPlayShellPath(location.pathname);
  const isArcadeLaunch = Boolean(arcadeContext && location.pathname.includes('/arcade/'));
  const showDeepLinkShell = !arcadeContext;
  const exitPath = arcadeContext
    ? getKidPlayShellRoute(arcadeContext.sessionId, 'arcade')
    : '/kids';
  const exitLabel = isArcadeLaunch || showDeepLinkShell ? 'Back to Arcade' : 'Portal';
  const exitButtonLabel = isArcadeLaunch || showDeepLinkShell ? 'Back to Arcade' : 'Back to Kid Portal';

  useEffect(() => {
    if (arcadeContext || !location.pathname.startsWith('/kids/games/b4-focus-flight')) return;
    const sessionId = readLocalKidPlaySessionId();
    if (!sessionId) return;
    navigate(`${getKidPlayShellRoute(sessionId, 'arcade')}/b4-focus-flight`, { replace: true });
  }, [arcadeContext, location.pathname, navigate]);

  const returnToPortal = useCallback(() => {
    playB4ButtonSound();
    kidPlayShellNavigate(navigate, exitPath);
  }, [exitPath, navigate]);

  const handleResult = useCallback((result: B4FocusFlightResult) => {
    setBestScore((previousBest) => {
      const nextBest = Math.max(previousBest, result.score);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(getParticipantB4FlightStorageKey(BEST_SCORE_KEY, participantId), String(nextBest));
        if (result.objectiveComplete) {
          window.localStorage.setItem(getParticipantB4FlightStorageKey(LEVEL_1_COMPLETE_KEY, participantId), 'true');
        }
      }
      markB4FocusFlightPlayed(participantId);

      // TODO(progress): Replace localStorage with kid progress when Week 1 completion,
      // Level 2 unlocks, and Dragon Flight after Week 3 are backed by the real profile store.
      return nextBest;
    });
  }, [participantId]);

  const restartMission = useCallback(() => {
    markB4FocusFlightPlayed(participantId);
    setMissionKey((key) => key + 1);
    setStarted(true);
  }, [participantId]);

  const pageClassName = [
    'b4ff-page',
    started ? 'b4ff-page--playing' : '',
    showDeepLinkShell ? 'b4ff-page--deepLinkShell' : '',
  ].filter(Boolean).join(' ');

  const page = (
    <main className={pageClassName}>
      <div className="b4ff-skyGlow" aria-hidden="true" />
      <section className="b4ff-stage" aria-label="B-4 Focus Flight">
        {!started ? (
          <div className="b4ff-landing">
            <div className="b4ff-robotBadge" aria-hidden="true">
              <img src={getB4Asset(variant, 'idle')} alt="" />
            </div>
            <p className="b4ff-kicker">Courage in the Dark Arcade</p>
            <h1>B-4 Focus Flight</h1>
            <p className="b4ff-subtitle">
              Help B-4 collect Focus Flames and stay steady through the storm.
            </p>
            {bestScore > 0 && (
              <p className="b4ff-bestScore">Best score: {bestScore}</p>
            )}
            <div className="b4ff-landingActions">
              <button
                type="button"
                className="b4ff-primaryButton"
                onClick={() => {
                  playB4ButtonSound();
                  markB4FocusFlightPlayed(participantId);
                  setStarted(true);
                }}
              >
                Start Mission
              </button>
              <button
                type="button"
                className="b4ff-secondaryButton"
                onClick={() => {
                  playB4ButtonSound();
                  setShowHowTo(true);
                }}
              >
                How to Play
              </button>
              <Link className="b4ff-secondaryButton" to={exitPath} onClick={() => playB4ButtonSound()}>
                {exitButtonLabel}
              </Link>
            </div>
          </div>
        ) : (
          <GameShell
            missionKey={missionKey}
            bestScore={bestScore}
            onResult={handleResult}
            onRestart={restartMission}
            onExit={returnToPortal}
            exitLabel={exitLabel}
            variant={variant}
          />
        )}
      </section>

      {showHowTo && (
        <div className="b4ff-modalBackdrop" role="presentation" onClick={() => setShowHowTo(false)}>
          <div
            className="b4ff-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="b4ff-how-to-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="b4ff-how-to-title">How to Play</h2>
            <p>
              Drag, tap, or use arrow keys to guide B-4. Collect Focus Flames. Avoid storm
              clouds and branches. Finish Spark Run by collecting 25 Spark Flames.
            </p>
            <button
              type="button"
              className="b4ff-primaryButton"
              onClick={() => {
                playB4ButtonSound();
                setShowHowTo(false);
              }}
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </main>
  );

  if (showDeepLinkShell) {
    return (
      <div className="kid-play-shell b4ff-deepLinkShell">
        <header className="kidPlayShellNavBar">
          <nav className="kidPlayShellNav" aria-label="Kid play modules">
            <ul className="kidPlayShellNavList">
              {['Weekly Adventures', 'Collections', 'Characters', 'Arcade', 'Rewards'].map((label) => (
                <li key={label}>
                  <button
                    type="button"
                    className={[
                      'kidPlayShellNavBtn',
                      label === 'Arcade' ? 'kidPlayShellNavBtn--active' : '',
                    ].filter(Boolean).join(' ')}
                    disabled={label !== 'Arcade'}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        {page}
      </div>
    );
  }

  return page;
};

export default B4FocusFlightPage;
