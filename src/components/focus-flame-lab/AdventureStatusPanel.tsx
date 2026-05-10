import React, { useEffect, useRef, useState } from 'react';

export type AdventureStatusPanelScene = {
  id: 'move' | 'ceremony' | 'cave';
  title: string;
  cardImageSrc: string;
};

export function adventureReminderCopy(id: AdventureStatusPanelScene['id']): string {
  if (id === 'move') return 'Caiden just stepped into a new place.';
  if (id === 'ceremony') return 'Caiden feels everyone watching him at camp.';
  return 'Caiden is listening to what his body is telling him.';
}

export type AdventureStatusPanelProps = {
  scene: AdventureStatusPanelScene;
  progressPercent: number;
  markSrc: string;
  reduceMotion: boolean;
};

export default function AdventureStatusPanel({ scene, progressPercent, markSrc, reduceMotion }: AdventureStatusPanelProps) {
  const prevPctRef = useRef(progressPercent);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (reduceMotion) {
      prevPctRef.current = progressPercent;
      return;
    }
    if (progressPercent > prevPctRef.current) {
      setPulse(true);
    }
    prevPctRef.current = progressPercent;
  }, [progressPercent, reduceMotion]);

  useEffect(() => {
    if (!pulse || reduceMotion) return;
    const t = window.setTimeout(() => setPulse(false), 680);
    return () => window.clearTimeout(t);
  }, [pulse, reduceMotion]);

  const fillPct = Math.max(0, Math.min(100, progressPercent));
  const transitionMs = reduceMotion ? 0 : 640;

  return (
    <aside
      className={['ffl-adventureStatusPanel', pulse ? 'ffl-adventureStatusPanel--pulse' : ''].filter(Boolean).join(' ')}
      aria-label="Adventure status"
    >
      <div className="ffl-advStatusThumbWrap">
        <img className="ffl-advStatusThumb" src={scene.cardImageSrc} alt="" loading="lazy" decoding="async" />
      </div>
      <div className="ffl-advStatusBody">
        <div className="ffl-advStatusTitle">{scene.title}</div>
        <p className="ffl-advStatusReminder">{adventureReminderCopy(scene.id)}</p>
        <div className="ffl-advStatusDivider" aria-hidden="true" />

        <div className="ffl-advStatusMeterBlock">
          <div className="ffl-advFlameMeter" aria-hidden="true">
            <div className="ffl-advFlameMeterFrame">
              <img className="ffl-advFlameMeterBase" src={markSrc} alt="" decoding="async" />
              <div
                className="ffl-advFlameMeterFillClip"
                style={
                  {
                    height: `${fillPct}%`,
                    transition: reduceMotion ? 'none' : `height ${transitionMs}ms ease-out`,
                  } as React.CSSProperties
                }
              >
                <div className="ffl-advFlameMeterGoldSizer">
                  <img className="ffl-advFlameMeterGold" src={markSrc} alt="" decoding="async" />
                </div>
              </div>
            </div>
          </div>
          {progressPercent >= 100 ? (
            <p className="ffl-advStatusFlameComplete">Focus Flame steady</p>
          ) : (
            <div className="ffl-advStatusFlameText">
              <span className="ffl-advStatusFlameLabel">Focus Flame</span>
              <span className="ffl-advStatusFlamePct">{progressPercent}% steady</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
