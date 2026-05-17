import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { B4ClipSlug } from '../../hooks/useFocusFlameAudio';
import type { FocusFlameScene } from './FocusFlameGame';
import { FOCUS_POINT_AWARDS } from './focusFlameRanks';
import { sharedSteadyCompleteVideoCandidates } from './focusFlameTapVideos';

const STEADY_FEEDBACK_MS = 900;
const TOAST_MS = 2200;
const VIDEO_FADE_MS = 320;

const STEADY_TOAST = 'Nice. Caiden’s flame is getting steady.';

export type SceneMomentPhase = 'watch' | 'steady' | 'ready';

type FloatPoints = { id: number; amount: number };

function loadVideoFromCandidates(video: HTMLVideoElement, candidates: string[]): Promise<string | null> {
  if (candidates.length === 0) return Promise.resolve(null);

  const trySrc = (src: string) =>
    new Promise<boolean>((resolve) => {
      const onCanPlay = () => {
        cleanup();
        resolve(true);
      };
      const onError = () => {
        cleanup();
        resolve(false);
      };
      const cleanup = () => {
        video.removeEventListener('canplay', onCanPlay);
        video.removeEventListener('error', onError);
      };

      video.addEventListener('canplay', onCanPlay);
      video.addEventListener('error', onError);
      video.src = src;
      video.load();
    });

  return (async () => {
    for (const src of candidates) {
      const ok = await trySrc(src);
      if (ok) return src;
      console.warn(`[Focus Flame tap video] failed to load: ${src}`);
    }
    return null;
  })();
}

export default function SceneMoment({
  scene,
  markSrc,
  reduceMotion,
  onButtonClick,
  onAwardPoints,
  onComplete,
  onSkip,
  onPhaseChange,
  playFlameSteadySuccess,
  playB4Clip,
}: {
  scene: Pick<FocusFlameScene, 'id' | 'title' | 'momentCopy' | 'videoSrc' | 'thumbnail'>;
  markSrc: string;
  reduceMotion: boolean;
  onButtonClick: () => void;
  onAwardPoints: (amount: number) => void;
  onComplete: () => void;
  onSkip: () => void;
  onPhaseChange: (phase: SceneMomentPhase) => void;
  playFlameSteadySuccess?: () => Promise<void>;
  playB4Clip?: (slug: B4ClipSlug) => void;
}) {
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const hasSteadiedFlameRef = useRef(false);
  const flameSuccessPlayedRef = useRef(false);
  const activeLayerRef = useRef(0);
  const fadeTimerRef = useRef<number | null>(null);
  const readyTimerRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<SceneMomentPhase>('watch');
  const [loading, setLoading] = useState(!reduceMotion);
  const [failed, setFailed] = useState(false);
  const [hasSteadiedFlame, setHasSteadiedFlame] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [floatPoints, setFloatPoints] = useState<FloatPoints | null>(null);
  const [steadiedPop, setSteadiedPop] = useState(false);
  const [interactionLocked, setInteractionLocked] = useState(false);
  const [activeVideoLayer, setActiveVideoLayer] = useState(0);
  const [videoFading, setVideoFading] = useState(false);

  const showVideo = !reduceMotion && !failed && Boolean(scene.videoSrc);
  const useVideoLayers = showVideo;

  const transitionToSteadyCompleteVideo = useCallback(async () => {
    if (!useVideoLayers) return;

    const publicUrl = process.env.PUBLIC_URL || '';
    const candidates = sharedSteadyCompleteVideoCandidates(publicUrl);
    const inactiveLayer = activeLayerRef.current === 0 ? 1 : 0;
    const inactiveEl = inactiveLayer === 0 ? videoARef.current : videoBRef.current;
    const activeEl = inactiveLayer === 0 ? videoBRef.current : videoARef.current;

    if (!inactiveEl) return;

    const loadedSrc = await loadVideoFromCandidates(inactiveEl, candidates);
    if (!loadedSrc) {
      console.warn('[Focus Flame tap video] shared steady-complete clip missing; keeping scene video');
      return;
    }

    try {
      inactiveEl.muted = true;
      inactiveEl.loop = true;
      inactiveEl.playsInline = true;
      await inactiveEl.play();
    } catch {
      /* ignore autoplay quirks */
    }

    setVideoFading(true);
    if (fadeTimerRef.current != null) window.clearTimeout(fadeTimerRef.current);

    fadeTimerRef.current = window.setTimeout(() => {
      activeLayerRef.current = inactiveLayer;
      setActiveVideoLayer(inactiveLayer);
      setVideoFading(false);
      try {
        activeEl?.pause();
      } catch {
        /* ignore */
      }
    }, VIDEO_FADE_MS);
  }, [useVideoLayers]);

  const loadMainSceneVideo = useCallback(async () => {
    const el = videoARef.current;
    if (!el || !scene.videoSrc) {
      setFailed(true);
      setLoading(false);
      return;
    }

    activeLayerRef.current = 0;
    setActiveVideoLayer(0);

    const loaded = await loadVideoFromCandidates(el, [scene.videoSrc]);
    if (!loaded) {
      setFailed(true);
      setLoading(false);
      return;
    }

    el.muted = true;
    el.loop = true;
    el.playsInline = true;
    try {
      await el.play();
      setLoading(false);
    } catch {
      setFailed(true);
      setLoading(false);
    }
  }, [scene.videoSrc]);

  useEffect(() => {
    onPhaseChange(phase);
  }, [phase, onPhaseChange]);

  useEffect(() => {
    setLoading(!reduceMotion);
    setFailed(false);
    hasSteadiedFlameRef.current = false;
    flameSuccessPlayedRef.current = false;
    setHasSteadiedFlame(false);
    setShowToast(false);
    setInteractionLocked(false);
    activeLayerRef.current = 0;
    setActiveVideoLayer(0);
    setVideoFading(false);
    setPhase('watch');

    if (fadeTimerRef.current != null) {
      window.clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    if (readyTimerRef.current != null) {
      window.clearTimeout(readyTimerRef.current);
      readyTimerRef.current = null;
    }

    if (reduceMotion) return;

    void loadMainSceneVideo();

    return () => {
      if (fadeTimerRef.current != null) window.clearTimeout(fadeTimerRef.current);
      if (readyTimerRef.current != null) window.clearTimeout(readyTimerRef.current);
    };
  }, [loadMainSceneVideo, reduceMotion, scene.id]);

  useEffect(() => {
    if (!showToast) return;
    const t = window.setTimeout(() => setShowToast(false), TOAST_MS);
    return () => window.clearTimeout(t);
  }, [showToast]);

  useEffect(() => {
    if (!floatPoints) return;
    const t = window.setTimeout(() => setFloatPoints(null), 980);
    return () => window.clearTimeout(t);
  }, [floatPoints]);

  useEffect(() => {
    if (!steadiedPop || reduceMotion) return;
    const t = window.setTimeout(() => setSteadiedPop(false), 520);
    return () => window.clearTimeout(t);
  }, [steadiedPop, reduceMotion]);

  const beginSteady = () => {
    void playB4Clip?.('flame-start');
    onButtonClick();
    setPhase('steady');
  };

  const handleSteadyFlame = () => {
    if (hasSteadiedFlameRef.current || phase !== 'steady' || interactionLocked) return;

    const runSteady = async () => {
      setInteractionLocked(true);
      onButtonClick();
      hasSteadiedFlameRef.current = true;
      setHasSteadiedFlame(true);

      onAwardPoints(FOCUS_POINT_AWARDS.tinyBeat);
      setFloatPoints({ id: Date.now(), amount: FOCUS_POINT_AWARDS.tinyBeat });

      if (playFlameSteadySuccess && !flameSuccessPlayedRef.current) {
        flameSuccessPlayedRef.current = true;
        await playFlameSteadySuccess();
      }

      if (showVideo) {
        await transitionToSteadyCompleteVideo();
      }

      setShowToast(true);
      if (!reduceMotion) setSteadiedPop(true);

      readyTimerRef.current = window.setTimeout(() => {
        setPhase('ready');
        setInteractionLocked(false);
      }, STEADY_FEEDBACK_MS);
    };

    void runSteady();
  };

  const handleContinueToFeeling = () => {
    onButtonClick();
    onComplete();
  };

  const handleSkip = useCallback(() => {
    onButtonClick();
    onSkip();
  }, [onButtonClick, onSkip]);

  const videoStackClass = [
    'ffl-sceneMoment-videoStack',
    videoFading ? 'ffl-sceneMoment-videoStack--fading' : '',
    hasSteadiedFlame ? 'ffl-sceneMoment-videoStack--steadied' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const layerClass = (layer: 0 | 1) =>
    [
      'ffl-sceneMoment-video',
      useVideoLayers ? 'ffl-sceneMoment-video--layer' : '',
      useVideoLayers && activeVideoLayer === layer ? 'ffl-sceneMoment-video--active' : '',
    ]
      .filter(Boolean)
      .join(' ');

  const mediaClass = [
    'ffl-scene-video-wrap',
    'ffl-sceneMoment-media',
    phase === 'steady' || phase === 'ready' ? 'ffl-sceneMoment-media--steady' : '',
    hasSteadiedFlame
      ? 'ffl-sceneMoment-media--steadied'
      : phase === 'steady' || phase === 'ready'
        ? 'ffl-sceneMoment-media--flickering'
        : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="ffl-comicFrame ffl-sceneMoment">
      <div className="ffl-comicHeader">
        <div className="ffl-comicTag">SCENE INTRO</div>
        <div className="ffl-comicTitle">{scene.title}</div>
      </div>

      <div className={mediaClass}>
        {showVideo ? (
          <div className={videoStackClass}>
            <video
              ref={videoARef}
              className={layerClass(0)}
              poster={scene.thumbnail}
              muted
              autoPlay
              playsInline
              loop
              preload="metadata"
              aria-label={scene.title}
              aria-hidden={useVideoLayers && activeVideoLayer !== 0}
            />
            {useVideoLayers ? (
              <video
                ref={videoBRef}
                className={layerClass(1)}
                poster={scene.thumbnail}
                muted
                playsInline
                loop
                preload="metadata"
                aria-hidden={activeVideoLayer !== 1}
              />
            ) : null}
          </div>
        ) : (
          <img className="ffl-sceneMoment-poster" src={scene.thumbnail} alt="" loading="eager" decoding="async" />
        )}

        {loading && showVideo ? (
          <div className="ffl-sceneMoment-loading" aria-hidden="true">
            <span className="ffl-sceneMoment-loadingText">Loading scene…</span>
          </div>
        ) : null}

        {hasSteadiedFlame && !reduceMotion ? (
          <span className="ffl-sceneMoment-steadyParticles" aria-hidden="true">
            <span className="ffl-sceneMoment-steadyParticle" />
            <span className="ffl-sceneMoment-steadyParticle" />
            <span className="ffl-sceneMoment-steadyParticle" />
          </span>
        ) : null}

        {phase === 'steady' || phase === 'ready' ? (
          <div className="ffl-sceneMoment-steadyLayer">
            {!hasSteadiedFlame ? (
              <div className="ffl-sceneMoment-promptCard">
                <p className="ffl-sceneMoment-promptTitle">Help Caiden steady his flame.</p>
                <p className="ffl-sceneMoment-promptSub">One small step can help big feelings slow down.</p>
              </div>
            ) : null}

            {showToast ? (
              <div className="ffl-tap-toast ffl-sceneMoment-steadyToast" role="status" aria-live="polite">
                {STEADY_TOAST}
              </div>
            ) : null}

            {floatPoints ? (
              <span key={floatPoints.id} className="ffl-sceneMoment-pointsFloat" aria-hidden="true">
                +{floatPoints.amount} Focus Points
              </span>
            ) : null}

            {!hasSteadiedFlame ? (
              <button
                type="button"
                className={[
                  'ffl-flame-badge-button',
                  steadiedPop && !reduceMotion ? 'ffl-flame-badge-button--pop' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                data-reduce-motion={reduceMotion ? 'true' : undefined}
                onClick={handleSteadyFlame}
                disabled={interactionLocked}
                aria-label="Help Caiden steady his flame"
              >
                <span className="ffl-flame-badge-ring" aria-hidden="true" />
                <img src={markSrc} alt="" decoding="async" />
                <span className="ffl-flame-badge-label">Steady</span>
              </button>
            ) : (
              <span
                className={[
                  'ffl-flame-badge-button',
                  'ffl-flame-badge-button--steadied',
                  steadiedPop && !reduceMotion ? 'ffl-flame-badge-button--pop' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-hidden="true"
              >
                <span className="ffl-flame-badge-ring" aria-hidden="true" />
                <img src={markSrc} alt="" decoding="async" />
              </span>
            )}
          </div>
        ) : null}
      </div>

      <p className="ffl-comicBody ffl-sceneMoment-copy">{scene.momentCopy}</p>

      {phase === 'watch' ? (
        <div className="ffl-comicAction ffl-sceneMoment-action">
          <button type="button" className="ffl-ctaPrimary ffl-sceneMoment-cta" onClick={beginSteady}>
            Help Caiden
          </button>
        </div>
      ) : phase === 'ready' ? (
        <div className="ffl-comicAction ffl-sceneMoment-action">
          <button type="button" className="ffl-ctaPrimary ffl-sceneMoment-cta" onClick={handleContinueToFeeling}>
            What is Caiden feeling?
          </button>
        </div>
      ) : (
        <div className="ffl-sceneMoment-steadyFooter">
          <button type="button" className="ffl-sceneMoment-skip" onClick={handleSkip}>
            Skip
          </button>
        </div>
      )}
    </div>
  );
}
