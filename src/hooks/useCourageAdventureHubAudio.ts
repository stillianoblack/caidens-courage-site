import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  loadCourageHubSoundEnabled,
  saveCourageHubSoundEnabled,
} from '../lib/courageAdventureHubAudioPrefs';

/** Low but audible background level. */
const AMBIENT_VOLUME = 0.18;
const CLICK_VOLUME = 0.28;
const FADE_IN_MS = 1200;
const FADE_OUT_MS = 650;
const CLICK_COOLDOWN_MS = 120;

function safePlay(audio: HTMLAudioElement): Promise<boolean> {
  return audio
    .play()
    .then(() => true)
    .catch(() => false);
}

export function useCourageAdventureHubAudio() {
  const publicUrl = process.env.PUBLIC_URL || '';
  const paths = useMemo(
    () => ({
      ambient: `${publicUrl}/audio/focus-flame-ambient.mp3`,
      click: `${publicUrl}/audio/card-hover-bubble.mp3`,
    }),
    [publicUrl],
  );

  const [soundEnabled, setSoundEnabled] = useState(loadCourageHubSoundEnabled);

  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const clickRef = useRef<HTMLAudioElement | null>(null);
  const soundEnabledRef = useRef(soundEnabled);
  const clickLastRef = useRef(0);
  const fadeRafRef = useRef<number | null>(null);

  soundEnabledRef.current = soundEnabled;

  const cancelFade = useCallback(() => {
    if (fadeRafRef.current != null) {
      cancelAnimationFrame(fadeRafRef.current);
      fadeRafRef.current = null;
    }
  }, []);

  const getAmbient = useCallback(() => {
    if (!ambientRef.current) {
      const audio = new Audio(paths.ambient);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 0;
      void audio.load();
      ambientRef.current = audio;
    }
    return ambientRef.current;
  }, [paths.ambient]);

  const getClickSound = useCallback(() => {
    if (!clickRef.current) {
      const audio = new Audio(paths.click);
      audio.preload = 'auto';
      clickRef.current = audio;
    }
    return clickRef.current;
  }, [paths.click]);

  const fadeAmbientTo = useCallback(
    (targetVolume: number, onComplete?: () => void) => {
      const audio = ambientRef.current;
      if (!audio) {
        onComplete?.();
        return;
      }

      cancelFade();
      const startVolume = audio.volume;
      const t0 = performance.now();

      const tick = (now: number) => {
        const progress = Math.min(1, (now - t0) / FADE_IN_MS);
        audio.volume = startVolume + (targetVolume - startVolume) * progress;
        if (progress < 1) {
          fadeRafRef.current = requestAnimationFrame(tick);
        } else {
          audio.volume = targetVolume;
          fadeRafRef.current = null;
          onComplete?.();
        }
      };

      fadeRafRef.current = requestAnimationFrame(tick);
    },
    [cancelFade],
  );

  const isAmbientAudible = useCallback(() => {
    const audio = ambientRef.current;
    return Boolean(audio && !audio.paused && audio.volume > 0.04);
  }, []);

  /**
   * Must run synchronously inside a user gesture (click/tap) so browsers allow play().
   */
  const ensureAmbientFromGesture = useCallback(() => {
    if (!soundEnabledRef.current) return;

    const audio = getAmbient();
    audio.loop = true;

    if (!audio.paused && audio.volume > 0.04) return;

    cancelFade();
    audio.volume = AMBIENT_VOLUME;
    void safePlay(audio);
  }, [cancelFade, getAmbient]);

  const tryAutoplayAmbient = useCallback(() => {
    if (!soundEnabledRef.current) return;

    const audio = getAmbient();
    audio.loop = true;
    audio.volume = 0;

    void safePlay(audio).then((played) => {
      if (!played || !soundEnabledRef.current) return;
      fadeAmbientTo(AMBIENT_VOLUME);
    });
  }, [fadeAmbientTo, getAmbient]);

  const stopAmbient = useCallback(() => {
    cancelFade();
    const audio = ambientRef.current;
    if (!audio) return;

    if (!audio.paused && audio.volume > 0) {
      const startVol = audio.volume;
      const t0 = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - t0) / FADE_OUT_MS);
        audio.volume = Math.max(0, startVol * (1 - progress));
        if (progress < 1) {
          fadeRafRef.current = requestAnimationFrame(tick);
        } else {
          audio.pause();
          try {
            audio.currentTime = 0;
          } catch {
            /* ignore */
          }
          audio.volume = 0;
          fadeRafRef.current = null;
        }
      };
      fadeRafRef.current = requestAnimationFrame(tick);
      return;
    }

    audio.pause();
    try {
      audio.currentTime = 0;
    } catch {
      /* ignore */
    }
    audio.volume = 0;
  }, [cancelFade]);

  useEffect(() => {
    saveCourageHubSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    if (soundEnabled) {
      tryAutoplayAmbient();
      return;
    }
    stopAmbient();
  }, [soundEnabled, stopAmbient, tryAutoplayAmbient]);

  useEffect(() => {
    if (!soundEnabled) return undefined;

    const unlockOnGesture = () => {
      if (!soundEnabledRef.current || isAmbientAudible()) return;
      ensureAmbientFromGesture();
    };

    document.addEventListener('pointerdown', unlockOnGesture);
    document.addEventListener('keydown', unlockOnGesture);

    return () => {
      document.removeEventListener('pointerdown', unlockOnGesture);
      document.removeEventListener('keydown', unlockOnGesture);
    };
  }, [ensureAmbientFromGesture, isAmbientAudible, soundEnabled]);

  useEffect(() => {
    return () => {
      cancelFade();
      const ambient = ambientRef.current;
      if (ambient) {
        ambient.pause();
        ambient.removeAttribute('src');
        ambient.load();
      }
      ambientRef.current = null;

      const click = clickRef.current;
      if (click) {
        click.pause();
        click.removeAttribute('src');
        click.load();
      }
      clickRef.current = null;
    };
  }, [cancelFade]);

  const playClick = useCallback(() => {
    if (!soundEnabledRef.current) return;

    ensureAmbientFromGesture();

    const now = Date.now();
    if (now - clickLastRef.current < CLICK_COOLDOWN_MS) return;
    clickLastRef.current = now;

    try {
      const audio = getClickSound();
      audio.volume = CLICK_VOLUME;
      audio.currentTime = 0;
      void safePlay(audio);
    } catch {
      /* ignore */
    }
  }, [ensureAmbientFromGesture, getClickSound]);

  const toggleSound = useCallback(() => {
    const next = !soundEnabledRef.current;
    soundEnabledRef.current = next;
    if (next) {
      ensureAmbientFromGesture();
    } else {
      stopAmbient();
    }
    setSoundEnabled(next);
  }, [ensureAmbientFromGesture, stopAmbient]);

  return {
    soundEnabled,
    setSoundEnabled,
    toggleSound,
    playClick,
    ensureAmbientFromGesture,
    stopAmbient,
  };
}
