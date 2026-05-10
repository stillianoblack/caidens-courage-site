import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/** Default background music level (~10% lower than prior 0.18). */
export const DEFAULT_MUSIC_VOLUME = 0.16;
export const DEFAULT_SFX_VOLUME = 0.9;
/** Pre-recorded B-4 narration (ElevenLabs, etc.). */
export const DEFAULT_VOICE_VOLUME = 0.9;
/** @deprecated Use DEFAULT_VOICE_VOLUME */
export const DEFAULT_B4_VOICE_VOLUME = DEFAULT_VOICE_VOLUME;

/** Filenames under `public/audio/b4/` (without `.mp3`). */
export const FOCUS_FLAME_B4_VOICE_KEYS = [
  'intro-welcome',
  'scene-move',
  'scene-ceremony',
  'scene-cave',
  'feeling-prompt',
  'body-prompt',
  'focus-move-prompt',
  'reward',
] as const;

export type FocusFlameB4VoiceKey = (typeof FOCUS_FLAME_B4_VOICE_KEYS)[number];

const CLICK_VOL = 0.22;
const HOVER_VOL = 0.25;
const SELECT_VOL = 0.35;
const FADE_IN_MS = 1000;
const FADE_OUT_MS = 650;
const HOVER_COOLDOWN_MS = 250;

function safePlay(audio: HTMLAudioElement) {
  return audio.play().catch(() => undefined);
}

export function useFocusFlameAudio() {
  const publicUrl = process.env.PUBLIC_URL || '';
  const paths = useMemo(
    () => ({
      ambient: `${publicUrl}/audio/focus-flame-ambient.mp3`,
      hover: `${publicUrl}/audio/card-hover-bubble.mp3`,
      select: `${publicUrl}/audio/card-select-chime.mp3`,
      click: `${publicUrl}/audio/button-soft-click.mp3`,
    }),
    [publicUrl]
  );

  const [soundEnabled, setSoundEnabled] = useState(false);
  const [musicVolume, setMusicVolume] = useState(DEFAULT_MUSIC_VOLUME);
  const [sfxVolume, setSfxVolume] = useState(DEFAULT_SFX_VOLUME);
  /** Pre-recorded B-4 narration; default off (no autoplay until user enables). */
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceVolume, setVoiceVolume] = useState(DEFAULT_VOICE_VOLUME);

  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const b4NarrationRef = useRef<HTMLAudioElement | null>(null);
  const soundEnabledRef = useRef(soundEnabled);
  const musicVolumeRef = useRef(musicVolume);
  const sfxVolumeRef = useRef(sfxVolume);
  const voiceEnabledRef = useRef(voiceEnabled);
  const voiceVolumeRef = useRef(voiceVolume);
  const hoverLastRef = useRef(0);
  const fadeRafRef = useRef<number | null>(null);

  soundEnabledRef.current = soundEnabled;
  musicVolumeRef.current = musicVolume;
  sfxVolumeRef.current = sfxVolume;
  voiceEnabledRef.current = voiceEnabled;
  voiceVolumeRef.current = voiceVolume;

  const cancelFade = useCallback(() => {
    if (fadeRafRef.current != null) {
      cancelAnimationFrame(fadeRafRef.current);
      fadeRafRef.current = null;
    }
  }, []);

  const getAmbient = useCallback(() => {
    if (!ambientRef.current) {
      const a = new Audio(paths.ambient);
      a.loop = true;
      a.preload = 'auto';
      ambientRef.current = a;
    }
    return ambientRef.current;
  }, [paths.ambient]);

  useEffect(() => {
    let cancelled = false;

    if (!soundEnabled) {
      const a = ambientRef.current;
      if (a && !a.paused) {
        const startVol = a.volume;
        const t0 = performance.now();
        const tickOut = (now: number) => {
          if (cancelled) return;
          const u = Math.min(1, (now - t0) / FADE_OUT_MS);
          a.volume = Math.max(0, startVol * (1 - u));
          if (u < 1) {
            fadeRafRef.current = requestAnimationFrame(tickOut);
          } else {
            a.pause();
            try {
              a.currentTime = 0;
            } catch {
              /* ignore */
            }
            a.volume = musicVolumeRef.current;
            fadeRafRef.current = null;
          }
        };
        fadeRafRef.current = requestAnimationFrame(tickOut);
      } else if (a) {
        a.volume = musicVolumeRef.current;
      }

      return () => {
        cancelled = true;
        cancelFade();
      };
    }

    const a = getAmbient();
    a.loop = true;
    a.volume = 0;
    void safePlay(a).then(() => {
      if (cancelled || !soundEnabledRef.current) return;
      const t0 = performance.now();
      const tickIn = (now: number) => {
        if (cancelled || !soundEnabledRef.current) return;
        const u = Math.min(1, (now - t0) / FADE_IN_MS);
        a.volume = musicVolumeRef.current * u;
        if (u < 1) {
          fadeRafRef.current = requestAnimationFrame(tickIn);
        } else {
          a.volume = musicVolumeRef.current;
          fadeRafRef.current = null;
        }
      };
      fadeRafRef.current = requestAnimationFrame(tickIn);
    });

    return () => {
      cancelled = true;
      cancelFade();
    };
  }, [soundEnabled, cancelFade, getAmbient]);

  useEffect(() => {
    if (!soundEnabled) return;
    const a = ambientRef.current;
    if (!a || a.paused) return;
    if (fadeRafRef.current != null) return;
    a.volume = musicVolume;
  }, [musicVolume, soundEnabled]);

  useEffect(() => {
    return () => {
      cancelFade();
      const a = ambientRef.current;
      if (a) {
        a.pause();
        a.removeAttribute('src');
        a.load();
      }
      ambientRef.current = null;
    };
  }, [cancelFade]);

  const playOneShot = useCallback((src: string, volume: number, skipEnabledCheck?: boolean) => {
    if (!skipEnabledCheck && !soundEnabledRef.current) return;
    try {
      const el = new Audio(src);
      el.volume = Math.min(1, Math.max(0, volume));
      void safePlay(el);
    } catch {
      /* ignore */
    }
  }, []);

  const playCardHover = useCallback(() => {
    if (!soundEnabledRef.current) return;
    const now = Date.now();
    if (now - hoverLastRef.current < HOVER_COOLDOWN_MS) return;
    hoverLastRef.current = now;
    playOneShot(paths.hover, HOVER_VOL * sfxVolumeRef.current, true);
  }, [paths.hover, playOneShot]);

  const playCardSelect = useCallback(() => {
    if (!soundEnabledRef.current) return;
    playOneShot(paths.select, SELECT_VOL * sfxVolumeRef.current, true);
  }, [paths.select, playOneShot]);

  const playButtonClick = useCallback(() => {
    if (!soundEnabledRef.current) return;
    playOneShot(paths.click, CLICK_VOL * sfxVolumeRef.current, true);
  }, [paths.click, playOneShot]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      if (prev) {
        playOneShot(paths.click, CLICK_VOL * sfxVolumeRef.current, false);
      }
      return !prev;
    });
  }, [paths.click, playOneShot]);

  const toggleVoice = useCallback(() => {
    setVoiceEnabled((prev) => !prev);
  }, []);

  const stopB4Voice = useCallback(() => {
    const el = b4NarrationRef.current;
    if (!el) return;
    b4NarrationRef.current = null;
    try {
      el.onerror = null;
      el.onended = null;
      el.pause();
      el.removeAttribute('src');
      el.load();
    } catch {
      /* ignore */
    }
  }, []);

  const warnB4VoiceFailed = useCallback((key: FocusFlameB4VoiceKey) => {
    if (process.env.NODE_ENV !== 'development') return;
    console.warn(`B-4 voice file failed to play: [${key}]`);
  }, []);

  const playB4Voice = useCallback(
    (key: FocusFlameB4VoiceKey, opts?: { bypassVoiceCheck?: boolean }) => {
      if (!opts?.bypassVoiceCheck && !voiceEnabledRef.current) return;
      stopB4Voice();
      const src = `${publicUrl}/audio/b4/${key}.mp3`;
      try {
        const el = new Audio(src);
        el.preload = 'auto';
        el.volume = Math.min(1, Math.max(0, voiceVolumeRef.current));
        b4NarrationRef.current = el;
        const clearIfCurrent = () => {
          if (b4NarrationRef.current === el) {
            b4NarrationRef.current = null;
          }
        };
        el.addEventListener(
          'error',
          () => {
            warnB4VoiceFailed(key);
            clearIfCurrent();
          },
          { once: true }
        );
        el.addEventListener(
          'ended',
          () => {
            clearIfCurrent();
          },
          { once: true }
        );
        void el.play().catch(() => {
          warnB4VoiceFailed(key);
          clearIfCurrent();
        });
      } catch {
        warnB4VoiceFailed(key);
      }
    },
    [publicUrl, stopB4Voice, warnB4VoiceFailed]
  );

  useEffect(() => {
    const el = b4NarrationRef.current;
    if (!el) return;
    el.volume = Math.min(1, Math.max(0, voiceVolume));
  }, [voiceVolume]);

  useEffect(() => {
    if (!voiceEnabled) {
      stopB4Voice();
    }
  }, [voiceEnabled, stopB4Voice]);

  useEffect(() => {
    return () => {
      stopB4Voice();
    };
  }, [stopB4Voice]);

  return {
    soundEnabled,
    setSoundEnabled,
    toggleSound,
    musicVolume,
    setMusicVolume,
    sfxVolume,
    setSfxVolume,
    voiceEnabled,
    setVoiceEnabled,
    toggleVoice,
    voiceVolume,
    setVoiceVolume,
    playB4Voice,
    stopB4Voice,
    playCardHover,
    playCardSelect,
    playButtonClick,
  };
}
