import React, { useState } from 'react';

export type HudSceneThumbScene = {
  id: string;
  cardImageSrc: string;
  videoSrc?: string;
  thumbnail?: string;
};

export default function HudSceneThumb({
  scene,
  reduceMotion,
  variant = 'hud',
}: {
  scene: HudSceneThumbScene;
  reduceMotion: boolean;
  variant?: 'hud' | 'mobile';
}) {
  const [videoFailed, setVideoFailed] = useState(false);
  const poster = scene.thumbnail || scene.cardImageSrc;
  const showVideo = !reduceMotion && Boolean(scene.videoSrc) && !videoFailed;
  const wrapClass =
    variant === 'mobile'
      ? 'ffl-mobileSceneStatus-thumbWrap'
      : 'ffl-hud-scene-thumbWrap ffl-hud-scene-thumbWrap--inCard';
  const thumbClass = variant === 'mobile' ? 'ffl-mobileSceneStatus-thumb' : 'ffl-hud-scene-thumb';

  return (
    <div className={wrapClass}>
      {showVideo ? (
        <video
          className={`${thumbClass} ffl-hud-scene-thumb--video`}
          src={scene.videoSrc}
          poster={poster}
          muted
          autoPlay
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          data-ffl-scene={scene.id}
          onError={() => setVideoFailed(true)}
        />
      ) : (
        <img
          className={thumbClass}
          src={poster}
          alt=""
          loading="lazy"
          decoding="async"
          data-ffl-scene={scene.id}
        />
      )}
    </div>
  );
}
