import React, { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FOCUS_FLAME_ACADEMY_MARK_SRC } from '../../design-system/brand/brandLogos';
import DragonNestRescueGame, { type DragonNestRescueGameHandle } from './DragonNestRescueGame';
import type { DragonNestHud, DragonNestResult } from './types';
import './dragon-nest-rescue.css';

const initialHud: DragonNestHud = {
  courage: 3,
  flames: 0,
  totalFlames: 12,
  objective: 'FOLLOW THE FLAME TRAIL',
  message: 'B-4: Follow the glowing trail.',
};

export default function DragonNestRescuePage() {
  const gameRef = useRef<DragonNestRescueGameHandle>(null);
  const [ready, setReady] = useState(false);
  const [hud, setHud] = useState(initialHud);
  const [result, setResult] = useState<DragonNestResult | null>(null);

  const restart = useCallback(() => {
    setResult(null);
    setHud(initialHud);
    gameRef.current?.restart();
  }, []);

  const setDirection = (x: number, y: number) => gameRef.current?.direction(x, y);
  const releaseDirection = () => setDirection(0, 0);

  return (
    <main className="dnr-page">
      <header className="dnr-header">
        <div><span>New prototype</span><h1>Dragon Nest Rescue</h1></div>
        <Link to="/preview/arcade">Back to Arcade</Link>
      </header>

      <section className="dnr-stage" aria-label="Dragon Nest Rescue prototype">
        <div className="dnr-hud dnr-hud--courage" aria-label={`${hud.courage} Courage Hearts`}>
          <span>COURAGE</span><strong>{'♥'.repeat(hud.courage)}{'♡'.repeat(3 - hud.courage)}</strong>
        </div>
        <div className="dnr-hud dnr-hud--flames"><span>FOCUS FLAMES</span><strong>{hud.flames} / {hud.totalFlames}</strong></div>
        <div className="dnr-objective"><span>OBJECTIVE</span><strong>{hud.objective}</strong></div>
        <div className="dnr-guidance" role="status" aria-live="polite">{hud.message}</div>

        <DragonNestRescueGame ref={gameRef} onReady={() => setReady(true)} onHud={setHud} onResult={setResult} />

        {!ready ? (
          <div className="dnr-loader" aria-busy="true" aria-live="polite">
            <span className="dnr-loaderGlow" /><img src={FOCUS_FLAME_ACADEMY_MARK_SRC} alt="" /><p>Igniting the Focus Flame…</p>
          </div>
        ) : null}

        <div className="dnr-mobileControls" aria-label="Touch controls">
          <div className="dnr-dpad">
            <button type="button" aria-label="Move up" onPointerDown={() => setDirection(0, -1)} onPointerUp={releaseDirection} onPointerLeave={releaseDirection}>↑</button>
            <button type="button" aria-label="Move left" onPointerDown={() => setDirection(-1, 0)} onPointerUp={releaseDirection} onPointerLeave={releaseDirection}>←</button>
            <button type="button" aria-label="Move down" onPointerDown={() => setDirection(0, 1)} onPointerUp={releaseDirection} onPointerLeave={releaseDirection}>↓</button>
            <button type="button" aria-label="Move right" onPointerDown={() => setDirection(1, 0)} onPointerUp={releaseDirection} onPointerLeave={releaseDirection}>→</button>
          </div>
          <button type="button" className="dnr-inspect" onClick={() => gameRef.current?.inspect()}>Inspect</button>
        </div>

        {result ? (
          <div className="dnr-result" role="dialog" aria-modal="true" aria-labelledby="dnr-result-title">
            <div>
              <p>{result.complete ? 'Adventure complete' : 'Take a brave pause'}</p>
              <h2 id="dnr-result-title">{result.complete ? 'DRAGON RESCUED' : 'Your courage needs a reset.'}</h2>
              <dl><div><dt>Focus Flames</dt><dd>{result.flames} / {result.totalFlames}</dd></div><div><dt>Courage Remaining</dt><dd>{result.courage} / 3</dd></div></dl>
              {result.complete && result.flames === result.totalFlames ? <strong className="dnr-bonus">All Flames Found!</strong> : null}
              <p>{result.complete ? 'B-4: You followed the clues, stayed focused, and brought the dragon home.' : 'B-4: Reset, breathe, and try the trail again.'}</p>
              <div className="dnr-resultActions"><button type="button" onClick={restart}>{result.complete ? 'Play Again' : 'Try Again'}</button><Link to="/preview/arcade">Back to Arcade</Link></div>
            </div>
          </div>
        ) : null}
      </section>
      <footer className="dnr-help"><span>Move: Arrow Keys or WASD</span><span>Inspect: E or Space</span><span>Touch controls available on mobile</span></footer>
    </main>
  );
}
