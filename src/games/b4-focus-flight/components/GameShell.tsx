import React, { useCallback, useEffect, useRef, useState } from 'react';
import B4FocusFlightGame, { type B4FocusFlightGameHandle } from '../B4FocusFlightGame';
import {
  type B4FocusFlightHudState,
  type B4FocusFlightResult,
} from '../phaser/types';
import { playB4ButtonSound } from '../uiAudio';
import GameHud from './GameHud';
import GameResults from './GameResults';

const initialHud: B4FocusFlightHudState = {
  score: 0,
  hearts: 3,
  timeLeft: 120,
  combo: 0,
  levelName: 'Level 1: Spark Run',
  objectiveText: 'Collect 25 Spark Flames',
  sparkCollected: 0,
  sparkGoal: 25,
  muted: false,
  paused: false,
};

interface GameShellProps {
  missionKey: number;
  bestScore: number;
  onResult: (result: B4FocusFlightResult) => void;
  onRestart: () => void;
  onExit: () => void;
  exitLabel?: string;
}

const GameShell: React.FC<GameShellProps> = ({
  missionKey,
  bestScore,
  onResult,
  onRestart,
  onExit,
  exitLabel = 'Portal',
}) => {
  const gameRef = useRef<B4FocusFlightGameHandle>(null);
  const [hud, setHud] = useState(initialHud);
  const [result, setResult] = useState<B4FocusFlightResult | null>(null);

  useEffect(() => {
    setHud(initialHud);
    setResult(null);
  }, [missionKey]);

  useEffect(() => {
    document.body.classList.add('b4ff-bodyLock');
    return () => {
      document.body.classList.remove('b4ff-bodyLock');
    };
  }, []);

  const handleResult = useCallback(
    (nextResult: B4FocusFlightResult) => {
      setResult(nextResult);
      onResult(nextResult);
    },
    [onResult],
  );

  const handleRestart = useCallback(() => {
    playB4ButtonSound(hud.muted);
    setResult(null);
    setHud(initialHud);
    onRestart();
  }, [hud.muted, onRestart]);

  const handleExit = useCallback(() => {
    playB4ButtonSound(hud.muted);
    onExit();
  }, [hud.muted, onExit]);

  return (
    <div className="b4ff-gameFrame">
      {!result && (
        <GameHud
          hud={hud}
          onPause={() => gameRef.current?.togglePause()}
          onMute={() => gameRef.current?.toggleMute()}
          onRestart={() => gameRef.current?.restart()}
          onExit={handleExit}
          exitLabel={exitLabel}
        />
      )}

      <B4FocusFlightGame
        key={missionKey}
        ref={gameRef}
        onHud={setHud}
        onResult={handleResult}
      />

      <div className="b4ff-rotatePrompt" role="status" aria-live="polite">
        <div className="b4ff-rotateIcon" aria-hidden="true">
          <span />
        </div>
        <p>Turn your device sideways to play B-4 Focus Flight.</p>
      </div>

      {result && (
        <div className="b4ff-resultsOverlay">
          <GameResults
            result={result}
            bestScore={bestScore}
            onPlayAgain={handleRestart}
            onExit={handleExit}
            exitLabel={exitLabel === 'Portal' ? 'Return to Kid Portal' : exitLabel}
          />
        </div>
      )}
    </div>
  );
};

export default GameShell;
