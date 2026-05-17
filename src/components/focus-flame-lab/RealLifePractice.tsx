import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { B4ClipSlug } from '../../hooks/useFocusFlameAudio';
import { FOCUS_POINT_AWARDS } from './focusFlameRanks';
import {
  PRACTICE_ACTIVITY_CLIP_BY_MOVE,
  PRACTICE_SUCCESS_CLIP_BY_MOVE,
} from './focusFlameB4Clips';
import {
  FOCUS_FLAME_PRACTICE_BY_MOVE,
  PRACTICE_BRIDGE_COPY,
  PRACTICE_BRIDGE_CTA_LEAD,
  PRACTICE_COUNTDOWN_SECONDS,
  PRACTICE_HOLD_MS,
} from './focusFlamePractice';
import type { FocusFlameMove } from './focusFlameMoves';

const BREATHE_RING_R = 52;
const BREATHE_RING_C = 2 * Math.PI * BREATHE_RING_R;

export type RealLifePracticePhase = 'practice' | 'reflection' | 'bridge';

type RealLifePracticeProps = {
  selectedMove: FocusFlameMove;
  reduceMotion: boolean;
  onButtonClick: () => void;
  onAwardPoints: (amount: number) => void;
  onPhaseChange: (phase: RealLifePracticePhase) => void;
  onComplete: () => void;
  playB4ClipAsync?: (slug: B4ClipSlug) => Promise<void>;
  stopB4PracticeVoice?: () => void;
  playUiConfirm?: () => void;
};

export default function RealLifePractice({
  selectedMove,
  reduceMotion,
  onButtonClick,
  onAwardPoints,
  onPhaseChange,
  onComplete,
  playB4ClipAsync,
  stopB4PracticeVoice,
  playUiConfirm,
}: RealLifePracticeProps) {
  const content = FOCUS_FLAME_PRACTICE_BY_MOVE[selectedMove];
  const [phase, setPhase] = useState<RealLifePracticePhase>('practice');
  const [goldPulse, setGoldPulse] = useState(false);
  const [showPoints, setShowPoints] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [interactionLocked, setInteractionLocked] = useState(false);
  const [isPracticeAudioPlaying, setIsPracticeAudioPlaying] = useState(false);
  const [hasPracticeCompleted, setHasPracticeCompleted] = useState(false);
  const [bridgeReady, setBridgeReady] = useState(false);

  const awardedRef = useRef(false);
  const holdRafRef = useRef<number | null>(null);
  const holdStartRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const bridgeTimerRef = useRef<number | null>(null);
  const bridgeVoicePlayedRef = useRef(false);
  const practiceStartPlayedRef = useRef(false);
  const hasPlayedPracticeSuccessRef = useRef(false);
  const practiceAudioQueueRef = useRef(Promise.resolve());
  const unmountedRef = useRef(false);

  const runPracticeAudio = useCallback(
    (slug: B4ClipSlug): Promise<void> => {
      if (!playB4ClipAsync) return Promise.resolve();

      const next = practiceAudioQueueRef.current.then(async () => {
        if (unmountedRef.current) return;
        setIsPracticeAudioPlaying(true);
        try {
          await playB4ClipAsync(slug);
        } finally {
          if (!unmountedRef.current) setIsPracticeAudioPlaying(false);
        }
      });

      practiceAudioQueueRef.current = next.catch(() => undefined);
      return next;
    },
    [playB4ClipAsync]
  );

  const cancelHold = useCallback(() => {
    if (holdRafRef.current != null) {
      cancelAnimationFrame(holdRafRef.current);
      holdRafRef.current = null;
    }
    holdStartRef.current = null;
    setHoldProgress(0);
  }, []);

  const scheduleBridge = useCallback(() => {
    const bridgeDelay = reduceMotion ? 400 : 2200;
    bridgeTimerRef.current = window.setTimeout(() => {
      if (unmountedRef.current) return;
      setPhase('bridge');
      onPhaseChange('bridge');
    }, bridgeDelay);
  }, [onPhaseChange, reduceMotion]);

  const finishPracticeWithSuccess = useCallback(async () => {
    if (hasPlayedPracticeSuccessRef.current || awardedRef.current) return;
    hasPlayedPracticeSuccessRef.current = true;
    awardedRef.current = true;
    setHasPracticeCompleted(true);
    setInteractionLocked(true);

    onAwardPoints(FOCUS_POINT_AWARDS.practice);
    setShowPoints(true);

    const successSlug = PRACTICE_SUCCESS_CLIP_BY_MOVE[selectedMove];
    console.log('[B4 PRACTICE AUDIO] success started');
    await runPracticeAudio(successSlug);
    console.log('[B4 PRACTICE AUDIO] success ended');

    if (unmountedRef.current) return;

    setGoldPulse(true);
    setPhase('reflection');
    onPhaseChange('reflection');
    scheduleBridge();
  }, [onAwardPoints, onPhaseChange, runPracticeAudio, scheduleBridge, selectedMove]);

  useEffect(() => {
    unmountedRef.current = false;
    onPhaseChange('practice');

    if (!practiceStartPlayedRef.current) {
      practiceStartPlayedRef.current = true;
      void runPracticeAudio('practice-start');
    }

    return () => {
      unmountedRef.current = true;
      if (countdownTimerRef.current != null) window.clearInterval(countdownTimerRef.current);
      if (bridgeTimerRef.current != null) window.clearTimeout(bridgeTimerRef.current);
      cancelHold();
      stopB4PracticeVoice?.();
    };
  }, [cancelHold, onPhaseChange, runPracticeAudio, stopB4PracticeVoice]);

  useEffect(() => {
    if (phase !== 'bridge' || bridgeVoicePlayedRef.current) return;
    bridgeVoicePlayedRef.current = true;

    void (async () => {
      await runPracticeAudio('real-life-reminder');
      if (!unmountedRef.current) setBridgeReady(true);
    })();
  }, [phase, runPracticeAudio]);

  useEffect(() => {
    if (phase === 'bridge' && hasPracticeCompleted) {
      setBridgeReady((ready) => ready || !playB4ClipAsync);
    }
  }, [hasPracticeCompleted, phase, playB4ClipAsync]);

  useEffect(() => {
    if (!goldPulse || reduceMotion) return;
    const t = window.setTimeout(() => setGoldPulse(false), 900);
    return () => window.clearTimeout(t);
  }, [goldPulse, reduceMotion]);

  useEffect(() => {
    if (!showPoints) return;
    const t = window.setTimeout(() => setShowPoints(false), 1100);
    return () => window.clearTimeout(t);
  }, [showPoints]);

  const tickHold = useCallback(
    (now: number) => {
      if (holdStartRef.current == null) return;
      const elapsed = now - holdStartRef.current;
      const p = Math.min(1, elapsed / PRACTICE_HOLD_MS);
      setHoldProgress(p);
      if (p >= 1) {
        holdRafRef.current = null;
        holdStartRef.current = null;
        void finishPracticeWithSuccess();
        return;
      }
      holdRafRef.current = requestAnimationFrame(tickHold);
    },
    [finishPracticeWithSuccess]
  );

  const runActivityThenSuccess = useCallback(async () => {
    if (hasPracticeCompleted || interactionLocked) return;
    setInteractionLocked(true);

    const activitySlug = PRACTICE_ACTIVITY_CLIP_BY_MOVE[selectedMove];
    if (activitySlug) {
      await runPracticeAudio(activitySlug);
    }
    await finishPracticeWithSuccess();
  }, [finishPracticeWithSuccess, hasPracticeCompleted, interactionLocked, runPracticeAudio, selectedMove]);

  const startHold = useCallback(() => {
    if (interactionLocked || hasPracticeCompleted || phase !== 'practice' || content.interaction !== 'hold-breathe')
      return;
    onButtonClick();
    cancelHold();
    holdStartRef.current = performance.now();
    holdRafRef.current = requestAnimationFrame(tickHold);

    const activitySlug = PRACTICE_ACTIVITY_CLIP_BY_MOVE[selectedMove];
    if (activitySlug) {
      void runPracticeAudio(activitySlug);
    }
  }, [
    cancelHold,
    content.interaction,
    hasPracticeCompleted,
    interactionLocked,
    onButtonClick,
    phase,
    runPracticeAudio,
    selectedMove,
    tickHold,
  ]);

  const endHold = useCallback(() => {
    if (holdProgress >= 1) return;
    cancelHold();
  }, [cancelHold, holdProgress]);

  const handleCountdownPause = useCallback(async () => {
    if (interactionLocked || hasPracticeCompleted || phase !== 'practice') return;
    onButtonClick();
    setInteractionLocked(true);

    let remaining = PRACTICE_COUNTDOWN_SECONDS;
    setCountdown(remaining);
    countdownTimerRef.current = window.setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        if (countdownTimerRef.current != null) {
          window.clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        setCountdown(null);
        return;
      }
      setCountdown(remaining);
    }, 1000);

    console.log('[B4 PRACTICE AUDIO] countdown started');
    await runPracticeAudio('b4-pause-countdown');
    console.log('[B4 PRACTICE AUDIO] countdown ended');

    if (countdownTimerRef.current != null) {
      window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);

    if (unmountedRef.current) return;
    await finishPracticeWithSuccess();
  }, [
    finishPracticeWithSuccess,
    hasPracticeCompleted,
    interactionLocked,
    onButtonClick,
    phase,
    runPracticeAudio,
  ]);

  const handleTapInteraction = () => {
    if (interactionLocked || hasPracticeCompleted || phase !== 'practice') return;
    onButtonClick();

    if (content.interaction === 'countdown') {
      void handleCountdownPause();
      return;
    }

    void runActivityThenSuccess();
  };

  const handleSeeReward = () => {
    if (!bridgeReady && playB4ClipAsync) return;
    stopB4PracticeVoice?.();
    playUiConfirm?.();
    onComplete();
  };

  const practiceControlsDisabled = interactionLocked || isPracticeAudioPlaying || hasPracticeCompleted;

  return (
    <div
      className={[
        'ffl-hud-card',
        'ffl-realLifePractice',
        goldPulse ? 'ffl-realLifePractice--pulse' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <header className="ffl-realLifePractice-header">
        <h2 className="ffl-h2 ffl-realLifePractice-title">Try it with B-4</h2>
        <p className="ffl-p ffl-realLifePractice-sub">Use this when your flame feels too big.</p>
      </header>

      <div className="ffl-realLifePractice-body">
        <h3 className="ffl-realLifePractice-moveTitle">{content.title}</h3>
        <p className="ffl-p ffl-realLifePractice-copy">{content.copy}</p>

        {phase === 'practice' && content.interaction === 'hold-breathe' ? (
          <div className="ffl-practice-breatheWrap">
            <div>
              <svg className="ffl-practice-breatheRing" viewBox="0 0 120 120" aria-hidden="true">
                <circle
                  className="ffl-practice-breatheRing-bg"
                  cx="60"
                  cy="60"
                  r={BREATHE_RING_R}
                  fill="none"
                />
                <circle
                  className="ffl-practice-breatheRing-progress"
                  cx="60"
                  cy="60"
                  r={BREATHE_RING_R}
                  fill="none"
                  strokeDasharray={BREATHE_RING_C}
                  strokeDashoffset={BREATHE_RING_C * (1 - holdProgress)}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <span className="ffl-practice-breatheRing-glow" aria-hidden="true" />
            </div>
            {reduceMotion ? (
              <button
                type="button"
                className="ffl-ctaPrimary ffl-practice-actionBtn"
                disabled={practiceControlsDisabled}
                onClick={() => {
                  onButtonClick();
                  void runActivityThenSuccess();
                }}
              >
                {content.buttonLabel}
              </button>
            ) : (
              <button
                type="button"
                className="ffl-ctaPrimary ffl-practice-actionBtn ffl-practice-holdBtn"
                disabled={practiceControlsDisabled}
                aria-label={content.buttonLabel}
                onPointerDown={(e) => {
                  if (e.pointerType === 'mouse' && e.button !== 0) return;
                  startHold();
                }}
                onPointerUp={endHold}
                onPointerLeave={endHold}
                onPointerCancel={endHold}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    startHold();
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    endHold();
                  }
                }}
              >
                {content.buttonLabel}
              </button>
            )}
          </div>
        ) : null}

        {phase === 'practice' && content.interaction === 'countdown' ? (
          <div className="ffl-practice-countdownWrap">
            {countdown != null ? (
              <p className="ffl-practice-countdown" aria-hidden="true">
                {countdown}…
              </p>
            ) : null}
            <p className="ffl-practice-srOnly" aria-live="polite" aria-atomic="true">
              {countdown != null ? `${countdown}` : ''}
            </p>
            <button
              type="button"
              className="ffl-ctaPrimary ffl-practice-actionBtn"
              disabled={practiceControlsDisabled}
              onClick={handleTapInteraction}
            >
              {content.buttonLabel}
            </button>
          </div>
        ) : null}

        {phase === 'practice' && content.interaction === 'tap' ? (
          <button
            type="button"
            className="ffl-ctaPrimary ffl-practice-actionBtn"
            disabled={practiceControlsDisabled}
            onClick={handleTapInteraction}
          >
            {content.buttonLabel}
          </button>
        ) : null}

        {phase !== 'practice' ? (
          <p className="ffl-realLifePractice-success" aria-live="polite" aria-atomic="true">
            {content.successMessage}
          </p>
        ) : null}

        {showPoints ? (
          <p className="ffl-realLifePractice-points" aria-hidden="true">
            +{FOCUS_POINT_AWARDS.practice} Focus Points
          </p>
        ) : null}

        {phase === 'bridge' ? (
          <div className="ffl-realLifePractice-bridge" aria-live="polite">
            <p className="ffl-p ffl-realLifePractice-bridgeCopy">{PRACTICE_BRIDGE_COPY}</p>
            <p className="ffl-p ffl-realLifePractice-bridgeLead">{PRACTICE_BRIDGE_CTA_LEAD}</p>
            <button
              type="button"
              className="ffl-ctaPrimary ffl-practice-actionBtn"
              disabled={!bridgeReady && Boolean(playB4ClipAsync)}
              onClick={handleSeeReward}
            >
              See my reward
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
