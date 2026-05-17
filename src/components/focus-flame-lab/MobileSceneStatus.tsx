import React from 'react';
import HudSceneThumb from './HudSceneThumb';

export type MobileSceneStatusScene = {
  id: string;
  title: string;
  cardImageSrc: string;
  videoSrc?: string;
  thumbnail?: string;
};

export default function MobileSceneStatus({
  scene,
  progressPercent,
  reduceMotion = false,
}: {
  scene: MobileSceneStatusScene;
  progressPercent: number;
  reduceMotion?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, progressPercent));
  const progressLine =
    pct >= 100 ? 'Focus Flame steady' : `${pct}% steady`;

  return (
    <div className="ffl-mobileSceneStatus" role="status" aria-live="polite">
      <HudSceneThumb scene={scene} reduceMotion={reduceMotion} variant="mobile" />
      <div className="ffl-mobileSceneStatus-text">
        <div className="ffl-mobileSceneStatus-title">{scene.title}</div>
        <div className="ffl-mobileSceneStatus-progress">{progressLine}</div>
      </div>
    </div>
  );
}
