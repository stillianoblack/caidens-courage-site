import React, { useEffect, useRef, useState } from 'react';

const HERO_POSTER = '/images/caidenscourage/caidenscourage_header_home.webp';
const HERO_VIDEO = '/videos/focus-flame/the-cave.mp4';

export default function HeroBackgroundVideo() {
  const primaryRef = useRef<HTMLVideoElement>(null);
  const secondaryRef = useRef<HTMLVideoElement>(null);
  const [activeLayer, setActiveLayer] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const primary = primaryRef.current;
    const secondary = secondaryRef.current;
    if (!primary || !secondary) return;

    const markStarted = () => setHasStarted(true);
    primary.addEventListener('playing', markStarted, { once: true });

    const swapLayers = () => {
      setActiveLayer((layer) => {
        const next = layer === 0 ? secondary : primary;
        next.currentTime = 0;
        next.play().catch(() => {
          /* autoplay quirks */
        });
        return layer === 0 ? 1 : 0;
      });
    };

    primary.addEventListener('ended', swapLayers);
    secondary.addEventListener('ended', swapLayers);

    return () => {
      primary.removeEventListener('playing', markStarted);
      primary.removeEventListener('ended', swapLayers);
      secondary.removeEventListener('ended', swapLayers);
    };
  }, []);

  const layerClass =
    'absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500 ease-in-out';

  return (
    <>
      {!hasStarted ? (
        <img src={HERO_POSTER} alt="" className={layerClass} decoding="async" aria-hidden="true" />
      ) : null}

      <video
        ref={primaryRef}
        className={`${layerClass} ${activeLayer === 0 ? 'opacity-100' : 'opacity-0'}`}
        src={HERO_VIDEO}
        autoPlay
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
      <video
        ref={secondaryRef}
        className={`${layerClass} ${activeLayer === 1 ? 'opacity-100' : 'opacity-0'}`}
        src={HERO_VIDEO}
        muted
        playsInline
        preload="none"
        aria-hidden="true"
      />
    </>
  );
}
