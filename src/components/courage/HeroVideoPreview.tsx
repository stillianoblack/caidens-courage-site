import React, { useCallback, useEffect, useRef, useState } from 'react';

const HERO_VIDEO_SRC = '/images/caidenscourage/Videos/hero_video_cc.mp4';
const HERO_VIDEO_POSTER = '/images/caidenscourage/backgrounds/caidens_thumbnail.webp';
const PIP_VISIBILITY_THRESHOLD = 0.375;

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.14v13.72L19 12 8 5.14z" />
    </svg>
  );
}

function canUsePictureInPicture(video: HTMLVideoElement): boolean {
  return (
    typeof document !== 'undefined' &&
    'pictureInPictureEnabled' in document &&
    Boolean(document.pictureInPictureEnabled) &&
    !video.disablePictureInPicture &&
    'requestPictureInPicture' in video
  );
}

export default function HeroVideoPreview() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pipRequestedRef = useRef(false);
  const [showPreviewChrome, setShowPreviewChrome] = useState(true);

  const resetPipSession = useCallback(() => {
    pipRequestedRef.current = false;
  }, []);

  const exitPictureInPictureIfActive = useCallback(async (video: HTMLVideoElement) => {
    if (typeof document === 'undefined' || document.pictureInPictureElement !== video) return;
    try {
      await document.exitPictureInPicture();
    } catch {
      /* ignore */
    }
  }, []);

  const resetPreview = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    await exitPictureInPictureIfActive(video);
    video.pause();
    video.currentTime = 0;
    video.controls = false;
    video.removeAttribute('controls');
    resetPipSession();
    setShowPreviewChrome(true);
  }, [exitPictureInPictureIfActive, resetPipSession]);

  const attemptScrollTriggeredPip = useCallback(async (video: HTMLVideoElement) => {
    if (pipRequestedRef.current || video.paused) return;
    if (typeof document !== 'undefined' && document.pictureInPictureElement === video) return;
    if (!canUsePictureInPicture(video)) return;

    pipRequestedRef.current = true;
    try {
      await video.requestPictureInPicture();
    } catch {
      /* silent — keep inline playback */
    }
  }, []);

  const handlePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    resetPipSession();
    video.controls = true;
    setShowPreviewChrome(false);

    try {
      await video.play();
    } catch {
      await resetPreview();
    }
  }, [resetPreview, resetPipSession]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onEnded = () => {
      void resetPreview();
    };

    const onPause = () => {
      resetPipSession();
    };

    const onLeavePip = () => {
      resetPipSession();
    };

    video.addEventListener('ended', onEnded);
    video.addEventListener('pause', onPause);
    video.addEventListener('leavepictureinpicture', onLeavePip);

    return () => {
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('leavepictureinpicture', onLeavePip);
    };
  }, [resetPreview, resetPipSession]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry || video.paused || pipRequestedRef.current) return;
        if (typeof document !== 'undefined' && document.pictureInPictureElement === video) return;
        if (entry.intersectionRatio >= PIP_VISIBILITY_THRESHOLD) return;

        void attemptScrollTriggeredPip(video);
      },
      { threshold: [0, 0.25, 0.375, 0.5, 0.625, 0.75, 1] }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [attemptScrollTriggeredPip]);

  return (
    <div className="cc-hero-video-card">
      <div className="cc-hero-video-frame">
        <video
          ref={videoRef}
          className="cc-hero-video"
          src={HERO_VIDEO_SRC}
          poster={HERO_VIDEO_POSTER}
          preload="metadata"
          playsInline
          aria-label="Caiden's Courage introduction video preview"
        />
        {showPreviewChrome ? (
          <>
            <img
              src={HERO_VIDEO_POSTER}
              alt=""
              className="cc-hero-video-poster"
              loading="eager"
              decoding="async"
              aria-hidden
            />
            <div className="cc-hero-video-overlay" aria-hidden />
            <button
              type="button"
              className="cc-hero-video-play"
              aria-label="Play Caiden's Courage video"
              onClick={handlePlay}
            >
              <PlayIcon className="cc-hero-video-play-icon" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
