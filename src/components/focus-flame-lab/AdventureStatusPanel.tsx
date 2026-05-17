import React, { useEffect, useRef, useState } from 'react';
import HudSceneThumb from './HudSceneThumb';

export type AdventureStatusPanelScene = {
  id: 'move' | 'ceremony' | 'cave';
  title: string;
  cardImageSrc: string;
  videoSrc?: string;
  thumbnail?: string;
};

export type AdventureStatusMode = 'mission' | 'story';

export type AdventureStatusVariant = 'sidebar' | 'bar';

export function adventureReminderCopy(id: AdventureStatusPanelScene['id']): string {
  if (id === 'move') return 'Caiden just stepped into a new place.';
  if (id === 'ceremony') return 'Caiden feels everyone watching him at camp.';
  return 'Caiden is listening to what his body is telling him.';
}

export type AdventureStatusPanelProps = {
  mode: AdventureStatusMode;
  variant: AdventureStatusVariant;
  scene: AdventureStatusPanelScene;
  progressPercent: number;
  markSrc: string;
  reduceMotion: boolean;
  missionCompleted: number;
  missionTotal: number;
};

function steadyLine(progressPercent: number): string {
  return progressPercent >= 100 ? 'Focus Flame steady' : `${progressPercent}% steady`;
}

function MissionPanelContent({
  variant,
  scene,
  progressPercent,
  markSrc,
  missionCompleted,
  missionTotal,
}: Pick<
  AdventureStatusPanelProps,
  'variant' | 'scene' | 'progressPercent' | 'markSrc' | 'missionCompleted' | 'missionTotal'
>) {
  const missionMeta = `${missionCompleted} of ${missionTotal} adventures`;

  if (variant === 'bar') {
    return (
      <div className="ffl-mobileSceneStatus ffl-adventureStatusPanel-mission" role="presentation">
        <div className="ffl-adventureStatusPanel-emblemWrap ffl-adventureStatusPanel-emblemWrap--bar">
          <img className="ffl-adventureStatusPanel-emblem" src={markSrc} alt="" decoding="async" />
        </div>
        <div className="ffl-mobileSceneStatus-text">
          <div className="ffl-adventureStatusPanel-kicker">Focus Flame Mission</div>
          <div className="ffl-mobileSceneStatus-title">{scene.title}</div>
          <div className="ffl-mobileSceneStatus-progress">{steadyLine(progressPercent)}</div>
          <div className="ffl-adventureStatusPanel-missionMeta">{missionMeta}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ffl-hud-card ffl-hud-card--adventure ffl-hud-adventure-card ffl-adventureStatusPanel-mission">
      <p className="ffl-adventureStatusPanel-kicker">Focus Flame Mission</p>
      <div className="ffl-adventureStatusPanel-missionRow">
        <div className="ffl-adventureStatusPanel-emblemWrap ffl-adventureStatusPanel-emblemWrap--sidebar">
          <img className="ffl-adventureStatusPanel-emblem" src={markSrc} alt="" decoding="async" />
        </div>
        <div className="ffl-adventureStatusPanel-missionText">
          <div className="ffl-hud-scene-title">{scene.title}</div>
          <p className="ffl-adventureStatusPanel-steady">{steadyLine(progressPercent)}</p>
          <p className="ffl-adventureStatusPanel-missionMeta">{missionMeta}</p>
        </div>
      </div>
    </div>
  );
}

function StoryPanelContent({
  variant,
  scene,
  reduceMotion,
}: Pick<AdventureStatusPanelProps, 'variant' | 'scene' | 'reduceMotion'>) {
  if (variant === 'bar') {
    return (
      <div className="ffl-mobileSceneStatus ffl-adventureStatusPanel-story" role="presentation">
        <HudSceneThumb scene={scene} reduceMotion={reduceMotion} variant="mobile" />
        <div className="ffl-mobileSceneStatus-text">
          <div className="ffl-mobileSceneStatus-title">{scene.title}</div>
          <div className="ffl-adventureStatusPanel-storyClue">{adventureReminderCopy(scene.id)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ffl-hud-card ffl-hud-card--adventure ffl-hud-adventure-card ffl-adventureStatusPanel-story">
      <HudSceneThumb scene={scene} reduceMotion={reduceMotion} />
      <div className="ffl-hud-scene-title">{scene.title}</div>
      <p className="ffl-hud-scene-reminder">{adventureReminderCopy(scene.id)}</p>
    </div>
  );
}

export default function AdventureStatusPanel({
  mode,
  variant,
  scene,
  progressPercent,
  markSrc,
  reduceMotion,
  missionCompleted,
  missionTotal,
}: AdventureStatusPanelProps) {
  const prevPctRef = useRef(progressPercent);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (reduceMotion || mode !== 'story') {
      prevPctRef.current = progressPercent;
      return;
    }
    if (progressPercent > prevPctRef.current) {
      setPulse(true);
    }
    prevPctRef.current = progressPercent;
  }, [progressPercent, reduceMotion, mode]);

  useEffect(() => {
    if (!pulse || reduceMotion) return;
    const t = window.setTimeout(() => setPulse(false), 680);
    return () => window.clearTimeout(t);
  }, [pulse, reduceMotion]);

  const rootClass = [
    'ffl-adventureStatusPanel-root',
    `ffl-adventureStatusPanel-root--${variant}`,
    `ffl-adventureStatusPanel-root--${mode}`,
    pulse ? 'ffl-adventureStatusPanel-root--pulse' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const swapClass = [
    'ffl-adventureStatusPanel-swap',
    reduceMotion ? 'ffl-adventureStatusPanel-swap--reduced' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const content =
    mode === 'mission' ? (
      <MissionPanelContent
        variant={variant}
        scene={scene}
        progressPercent={progressPercent}
        markSrc={markSrc}
        missionCompleted={missionCompleted}
        missionTotal={missionTotal}
      />
    ) : (
      <StoryPanelContent variant={variant} scene={scene} reduceMotion={reduceMotion} />
    );

  if (variant === 'bar') {
    return (
      <div className={rootClass} role="status" aria-live="polite">
        <div key={mode} className={swapClass}>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={rootClass} aria-label="Adventure status">
      <div key={mode} className={swapClass}>
        {content}
      </div>
    </div>
  );
}
