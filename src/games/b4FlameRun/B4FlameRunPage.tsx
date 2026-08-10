import React, { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import B4FlameRunGame, { type B4FlameRunGameHandle } from './B4FlameRunGame';
import { createFlameRunState } from './state';
import type { FlameRunHud, FlameRunResult } from './types';
import './b4-flame-run.css';
import './b4-flame-run-progress.css';

const initialHud: FlameRunHud = { ...createFlameRunState(), focusMode: false, message: 'B-4: Ready to run!', progress: 0, zone: 'Focus Flame Forest' };

export default function B4FlameRunPage() {
  const gameRef = useRef<B4FlameRunGameHandle>(null);
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [hud, setHud] = useState(initialHud);
  const [result, setResult] = useState<FlameRunResult | null>(null);
  const handleReady = useCallback(() => setReady(true), []);
  const handleHud = useCallback((next: FlameRunHud) => setHud(next), []);
  const handleResult = useCallback((next: FlameRunResult) => setResult(next), []);
  const handlePauseChange = useCallback((next: boolean) => setPaused(next), []);

  const start = useCallback(() => {
    if (!ready || countdown) return;
    setStarted(true);
    setCountdown('3');
    window.setTimeout(() => setCountdown('2'), 500);
    window.setTimeout(() => setCountdown('1'), 1000);
    window.setTimeout(() => setCountdown('GO!'), 1500);
    window.setTimeout(() => { setCountdown(null); gameRef.current?.start(); }, 1900);
  }, [countdown, ready]);

  const restart = useCallback(() => {
    setResult(null);
    setStarted(false);
    setCountdown(null);
    setPaused(false);
    setHud(initialHud);
    gameRef.current?.restart();
  }, []);

  return (
    <main className="b4run-page">
      <header className="b4run-header">
        <div><span>New prototype</span><h1>B-4 Flame Run</h1></div>
        <Link to="/preview/arcade">Back to Arcade</Link>
      </header>

      <section className={`b4run-stage${hud.focusMode ? ' is-focus-mode' : ''}`} aria-label="B-4 Flame Run prototype">
        <div className="b4run-progress" aria-label={`${hud.progress}% to Dragon Nest`}><i style={{ width: `${hud.progress}%` }} /><strong>{hud.progress}%</strong></div>
        <div className="b4run-hud b4run-hud--courage"><span>COURAGE</span><strong>{'🔥'.repeat(hud.courage)}{'◇'.repeat(3 - hud.courage)}</strong></div>
        <div className="b4run-hud b4run-hud--score"><span>SCORE</span><strong>{Math.round(hud.score).toLocaleString()}</strong></div>
        <div className="b4run-hud b4run-hud--flames"><span>FOCUS FLAMES</span><strong>{hud.flames}</strong></div>
        <div className="b4run-streak"><span>STREAK</span><strong>x{hud.multiplier}</strong></div>
        {started && !result ? <button type="button" className="b4run-pauseButton" style={{ right: 154, top: 17 }} aria-label="Pause run" onClick={() => gameRef.current?.pause()}>Ⅱ</button> : null}
        {hud.focusMode ? <div className="b4run-focusMode">FOCUS MODE</div> : null}
        <div className="b4run-message" aria-live="polite">{hud.message}</div>

        <B4FlameRunGame ref={gameRef} onReady={handleReady} onHud={handleHud} onResult={handleResult} onPauseChange={handlePauseChange} />

        {!started ? (
          <div className="b4run-intro">
            <img src="/images/B-4FlightGame/Idle/Idle@2x-transparent.png" alt="B-4" />
            <p>New prototype</p>
            <h2>B-4 FLAME RUN</h2>
            <p>Help B-4 race through Caiden Vale and collect as many Focus Flames as you can.</p>
            <div className="b4run-introControls"><span><kbd>SPACE</kbd> JUMP</span><span><kbd>↓</kbd> SLIDE</span></div>
            <button type="button" onClick={start} disabled={!ready}>{ready ? 'START RUN' : 'IGNITING THE TRAIL…'}</button>
          </div>
        ) : null}

        {countdown ? <div className="b4run-countdown" aria-live="assertive">{countdown}</div> : null}

        {paused ? (
          <div className="b4run-pauseOverlay" role="dialog" aria-modal="true" aria-labelledby="b4run-pause-title">
            <div><p>Brave pause</p><h2 id="b4run-pause-title">PAUSED</h2><button type="button" onClick={() => gameRef.current?.resume()}>Resume</button><button type="button" onClick={restart}>Restart Run</button><Link to="/preview/arcade">Back to Arcade</Link></div>
          </div>
        ) : null}

        {started && !result ? (
          <div className="b4run-mobileControls" aria-label="Touch controls">
            <button type="button" onPointerDown={() => gameRef.current?.jump()} onPointerUp={() => gameRef.current?.releaseJump()} onPointerCancel={() => gameRef.current?.releaseJump()} onPointerLeave={() => gameRef.current?.releaseJump()}>↑<span>JUMP / HOLD</span></button>
            <button type="button" onPointerDown={() => gameRef.current?.slide()}>↓<span>SLIDE</span></button>
          </div>
        ) : null}

        {result ? (
          <div className="b4run-result" role="dialog" aria-modal="true" aria-labelledby="b4run-result-title">
            <div>
              <p>Take a brave pause</p>
              <h2 id="b4run-result-title">YOUR FOCUS FLAME<br />NEEDS A RECHARGE</h2>
              <dl>
                <div><dt>Distance</dt><dd>{result.distance}m</dd></div>
                <div><dt>Focus Flames</dt><dd>{result.flames}</dd></div>
                <div><dt>Best Streak</dt><dd>{result.bestStreak}</dd></div>
                <div><dt>Score</dt><dd>{result.score.toLocaleString()}</dd></div>
                <div><dt>Best Score</dt><dd>{result.bestScore.toLocaleString()}</dd></div>
              </dl>
              <div><button type="button" onClick={restart}>TRY AGAIN</button><Link to="/preview/arcade">BACK TO ARCADE</Link></div>
            </div>
          </div>
        ) : null}
      </section>
      <footer className="b4run-help"><span>Jump: Space, ↑, or W</span><span>Slide: ↓ or S</span><span>Touch controls available on mobile</span></footer>
    </main>
  );
}
