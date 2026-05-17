import React, { useEffect, useRef, useState } from 'react';
import { adventureReminderCopy, type AdventureStatusPanelScene } from './AdventureStatusPanel';
import CompactB4HudCard from './CompactB4HudCard';
import HudSceneThumb from './HudSceneThumb';
import MobileSceneStatus from './MobileSceneStatus';
import { focusFlameMoveHudShort, type FocusFlameMove } from './focusFlameMoves';
import type { BodySignal, Feeling } from './focusFlameSelTypes';

export type GameHudPanelProps = {
  b4Message: string;
  selectedScene: AdventureStatusPanelScene & {
    videoSrc?: string;
    thumbnail?: string;
  };
  progressPercent: number;
  markSrc: string;
  reduceMotion: boolean;
  feeling: Feeling | null;
  body: BodySignal | null;
  move: FocusFlameMove | null;
  className?: string;
};

type BadgeKey = 'noticing' | 'body' | 'move';

export default function GameHudPanel({
  b4Message,
  selectedScene,
  progressPercent,
  markSrc,
  reduceMotion,
  feeling,
  body,
  move,
  className,
}: GameHudPanelProps) {
  const prevPctRef = useRef(progressPercent);
  const [meterPulse, setMeterPulse] = useState(false);
  const prevFeeling = useRef<Feeling | null>(null);
  const prevBody = useRef<BodySignal | null>(null);
  const prevMove = useRef<FocusFlameMove | null>(null);
  const prevAllChoicesEmpty = useRef(true);
  const [celebrateBadge, setCelebrateBadge] = useState<BadgeKey | null>(null);
  const [floatPoints, setFloatPoints] = useState<{ id: number; text: string; badge: BadgeKey } | null>(null);

  useEffect(() => {
    if (reduceMotion) {
      prevPctRef.current = progressPercent;
      return;
    }
    if (progressPercent > prevPctRef.current) {
      setMeterPulse(true);
    }
    prevPctRef.current = progressPercent;
  }, [progressPercent, reduceMotion]);

  useEffect(() => {
    if (!meterPulse || reduceMotion) return;
    const t = window.setTimeout(() => setMeterPulse(false), 680);
    return () => window.clearTimeout(t);
  }, [meterPulse, reduceMotion]);

  useEffect(() => {
    const allEmpty = feeling == null && body == null && move == null;
    if (allEmpty && !prevAllChoicesEmpty.current) {
      prevFeeling.current = null;
      prevBody.current = null;
      prevMove.current = null;
    }
    prevAllChoicesEmpty.current = allEmpty;
  }, [feeling, body, move]);

  useEffect(() => {
    if (reduceMotion) {
      prevFeeling.current = feeling;
      return;
    }
    const was = prevFeeling.current;
    prevFeeling.current = feeling;
    if (!was && feeling) {
      setCelebrateBadge('noticing');
      setFloatPoints({ id: Date.now(), text: '+10 Focus Points', badge: 'noticing' });
      const t = window.setTimeout(() => setCelebrateBadge(null), 720);
      return () => window.clearTimeout(t);
    }
  }, [feeling, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) {
      prevBody.current = body;
      return;
    }
    const was = prevBody.current;
    prevBody.current = body;
    if (!was && body) {
      setCelebrateBadge('body');
      setFloatPoints({ id: Date.now(), text: '+10 Focus Points', badge: 'body' });
      const t = window.setTimeout(() => setCelebrateBadge(null), 720);
      return () => window.clearTimeout(t);
    }
  }, [body, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) {
      prevMove.current = move;
      return;
    }
    const was = prevMove.current;
    prevMove.current = move;
    if (!was && move) {
      setCelebrateBadge('move');
      setFloatPoints({ id: Date.now(), text: '+20 Focus Points', badge: 'move' });
      const t = window.setTimeout(() => setCelebrateBadge(null), 720);
      return () => window.clearTimeout(t);
    }
  }, [move, reduceMotion]);

  useEffect(() => {
    if (!floatPoints || reduceMotion) return;
    const t = window.setTimeout(() => setFloatPoints(null), 980);
    return () => window.clearTimeout(t);
  }, [floatPoints, reduceMotion]);

  const fillPct = Math.max(0, Math.min(100, progressPercent));
  const transitionMs = reduceMotion ? 0 : 640;
  const earnedNoticing = feeling != null;
  const earnedBody = body != null;
  const earnedMove = move != null;
  const showSteadyHeadline = progressPercent >= 100;

  return (
    <aside
      className={['ffl-hud-panel', meterPulse ? 'ffl-hud-panel--meterPulse' : '', className].filter(Boolean).join(' ')}
      aria-label="B-4 guide and adventure status"
    >
      <div className="ffl-mobileSceneStatusWrap">
        <MobileSceneStatus scene={selectedScene} progressPercent={progressPercent} reduceMotion={reduceMotion} />
      </div>

      <div className="ffl-hud-b4-wrap">
        <CompactB4HudCard message={b4Message} />
      </div>

      <div className="ffl-hud-card ffl-hud-card--adventure ffl-hud-adventure-card">
        <HudSceneThumb scene={selectedScene} reduceMotion={reduceMotion} />
        <div className="ffl-hud-scene-title">{selectedScene.title}</div>
        <p className="ffl-hud-scene-reminder">{adventureReminderCopy(selectedScene.id)}</p>
      </div>

      <div className="ffl-hud-card ffl-hud-card--flame ffl-flame-status-card ffl-hud-flame-card ffl-hud-flame-card--compact">
        <div className="ffl-flame-status-main">
          <div className="ffl-flame-status-icon-wrap" aria-hidden="true">
            {showSteadyHeadline ? (
              <img className="ffl-flame-status-icon" src={markSrc} alt="" decoding="async" />
            ) : (
              <div className="ffl-flame-status-meterMini">
                <div className="ffl-flame-status-meterMiniFrame">
                  <img className="ffl-flame-status-meterMiniBase" src={markSrc} alt="" decoding="async" />
                  <div
                    className="ffl-flame-status-meterMiniFill"
                    style={
                      {
                        height: `${fillPct}%`,
                        transition: reduceMotion ? 'none' : `height ${transitionMs}ms ease-out`,
                      } as React.CSSProperties
                    }
                  >
                    <div className="ffl-flame-status-meterMiniGoldSizer">
                      <img className="ffl-flame-status-meterMiniGold" src={markSrc} alt="" decoding="async" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="ffl-flame-status-text">
            <h4 className="ffl-flame-status-headline">{showSteadyHeadline ? 'Steady' : `${progressPercent}% steady`}</h4>
          </div>
        </div>

        <div className="ffl-badge-pills ffl-badge-pills--compact" role="list" aria-label="Practice badges">
          <span className="ffl-badge-pills-slot" role="listitem">
            {floatPoints?.badge === 'noticing' ? (
              <span key={floatPoints.id} className="ffl-hud-floatPoints ffl-hud-floatPoints--inPills" aria-hidden="true">
                {floatPoints.text}
              </span>
            ) : null}
            <span
              className={[
                'ffl-badge-pill',
                earnedNoticing ? 'ffl-badge-pill--earned' : 'ffl-badge-pill--locked',
                celebrateBadge === 'noticing' && !reduceMotion ? 'ffl-badge-pill--celebrate' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              Notice
            </span>
          </span>
          <span className="ffl-badge-pills-slot" role="listitem">
            {floatPoints?.badge === 'body' ? (
              <span key={floatPoints.id} className="ffl-hud-floatPoints ffl-hud-floatPoints--inPills" aria-hidden="true">
                {floatPoints.text}
              </span>
            ) : null}
            <span
              className={[
                'ffl-badge-pill',
                earnedBody ? 'ffl-badge-pill--earned' : 'ffl-badge-pill--locked',
                celebrateBadge === 'body' && !reduceMotion ? 'ffl-badge-pill--celebrate' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              Body
            </span>
          </span>
          <span className="ffl-badge-pills-slot" role="listitem">
            {floatPoints?.badge === 'move' ? (
              <span key={floatPoints.id} className="ffl-hud-floatPoints ffl-hud-floatPoints--inPills" aria-hidden="true">
                {floatPoints.text}
              </span>
            ) : null}
            <span
              className={[
                'ffl-badge-pill',
                earnedMove ? 'ffl-badge-pill--earned' : 'ffl-badge-pill--locked',
                celebrateBadge === 'move' && !reduceMotion ? 'ffl-badge-pill--celebrate' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {move ? focusFlameMoveHudShort(move) : 'Brave'}
            </span>
          </span>
        </div>
      </div>
    </aside>
  );
}
