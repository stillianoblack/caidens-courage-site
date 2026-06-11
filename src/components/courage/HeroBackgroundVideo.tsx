import React, { useEffect, useRef, useState } from 'react';

const HERO_POSTER = '/images/hero/hero-desktop.webp';
const HERO_VIDEO = '/videos/focus-flame/the-cave.mp4';

export default function HeroBackgroundVideo() {
  const primaryRef = useRef<HTMLVideoElement>(null);
  const secondaryRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [activeLayer, setActiveLayer] = useState(0);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoadVideo(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' },
    );

    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoadVideo) return;

    const primary = primaryRef.current;
    const secondary = secondaryRef.current;
    if (!primary || !secondary) return;

    primary.play().catch(() => {
      /* autoplay quirks */
    });

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
  }, [shouldLoadVideo]);

  const layerClass =
    'absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500 ease-in-out';

  return (
    <div ref={wrapperRef} className="absolute inset-0">
      {!hasStarted ? (
        <img src={HERO_POSTER} alt="" className={layerClass} loading="lazy" decoding="async" aria-hidden="true" />
      ) : null}

      {shouldLoadVideo ? (
        <>
          <video
            ref={primaryRef}
            className={`${layerClass} ${activeLayer === 0 ? 'opacity-100' : 'opacity-0'}`}
            src={HERO_VIDEO}
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
      ) : null}
    </div>
  );
}
