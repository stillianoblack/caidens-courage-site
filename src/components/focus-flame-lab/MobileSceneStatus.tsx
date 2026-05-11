import React from 'react';

export type MobileSceneStatusScene = {
  id: string;
  title: string;
  cardImageSrc: string;
};

export default function MobileSceneStatus({
  scene,
  progressPercent,
}: {
  scene: MobileSceneStatusScene;
  progressPercent: number;
}) {
  const pct = Math.max(0, Math.min(100, progressPercent));
  const progressLine =
    pct >= 100 ? 'Focus Flame steady' : `${pct}% steady`;

  return (
    <div className="ffl-mobileSceneStatus" role="status" aria-live="polite">
      <div className="ffl-mobileSceneStatus-thumbWrap">
        <img
          className="ffl-mobileSceneStatus-thumb"
          src={scene.cardImageSrc}
          alt=""
          loading="lazy"
          decoding="async"
          data-ffl-scene={scene.id}
        />
      </div>
      <div className="ffl-mobileSceneStatus-text">
        <div className="ffl-mobileSceneStatus-title">{scene.title}</div>
        <div className="ffl-mobileSceneStatus-progress">{progressLine}</div>
      </div>
    </div>
  );
}
