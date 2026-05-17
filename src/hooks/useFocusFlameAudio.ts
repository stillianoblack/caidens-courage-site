import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FLAME_TAP_CLIP_BY_KEY,
  FOCUS_FLAME_B4_SCREEN_SLUGS,
  isB4OverlayClip,
  type B4ClipSlug,
  type FlameTapB4VoiceKey,
  type FocusFlameB4ScreenSlug,
} from '../components/focus-flame-lab/focusFlameB4Clips';

/** Default background music level (~10% lower than prior 0.18). */
export const DEFAULT_MUSIC_VOLUME = 0.16;
export const DEFAULT_SFX_VOLUME = 0.9;
/** Pre-recorded B-4 narration (ElevenLabs, etc.). */
export const DEFAULT_VOICE_VOLUME = 0.9;
/** @deprecated Use DEFAULT_VOICE_VOLUME */
export const DEFAULT_B4_VOICE_VOLUME = DEFAULT_VOICE_VOLUME;

export type { B4ClipSlug, FlameTapB4VoiceKey, FocusFlameB4ScreenSlug };

/** @deprecated Use FocusFlameB4ScreenSlug — screen narration slugs. */
export const FOCUS_FLAME_B4_VOICE_KEYS = FOCUS_FLAME_B4_SCREEN_SLUGS;
export type FocusFlameB4VoiceKey = FocusFlameB4ScreenSlug;

export const FLAME_TAP_B4_VOICE_KEYS = ['flameTapIntro', 'flameTap1', 'flameTap2', 'flameTap3'] as const;

/** @deprecated Use B4ClipSlug directly. */
export const PRACTICE_B4_VOICE_KEYS = ['practiceStart', 'practiceComplete'] as const;
export type PracticeB4VoiceKey = (typeof PRACTICE_B4_VOICE_KEYS)[number];

const PRACTICE_CLIP_BY_KEY: Record<PracticeB4VoiceKey, B4ClipSlug> = {
  practiceStart: 'practice-start',
  practiceComplete: 'end-encouragement',
};

/** @deprecated Use B4ClipSlug directly. */
export const OPTIONAL_B4_VOICE_KEYS = ['watchScene', 'sparkBreath', 'sceneIntro', 'flameStart'] as const;
export type OptionalB4VoiceKey = (typeof OPTIONAL_B4_VOICE_KEYS)[number];

const OPTIONAL_CLIP_BY_KEY: Record<OptionalB4VoiceKey, B4ClipSlug> = {
  watchScene: 'watch-scene',
  sparkBreath: 'spark-breath',
  sceneIntro: 'scene-intro',
  flameStart: 'flame-start',
};

/** B-4 HUD copy during the scene-moment steady-flame beat. */
export const FLAME_STEADY_B4_MESSAGES = {
  before: 'Caiden’s flame is flickering. Let’s help him steady it.',
  after: 'You helped him steady it. Now let’s name what he might be feeling.',
} as const;

/** @deprecated Former 3-tap HUD messages. */
export const FLAME_TAP_B4_MESSAGES = [
  'Tap the flame. Small steps help it steady.',
  'Nice! You noticed the flame.',
  'Keep going — it’s getting steadier.',
  'You did it! Caiden’s flame is steady.',
] as const;

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
  const b4ClipsPreloadedRef = useRef(false);
  const b4ClipAudioRef = useRef<Map<B4ClipSlug, HTMLAudioElement>>(new Map());
  const b4OverlayRef = useRef<HTMLAudioElement | null>(null);

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
      el.currentTime = 0;
    } catch {
      /* ignore */
    }
  }, []);

  const stopB4Overlay = useCallback(() => {
    const el = b4OverlayRef.current;
    if (!el) return;
    b4OverlayRef.current = null;
    try {
      el.onerror = null;
      el.onended = null;
      el.pause();
      el.currentTime = 0;
    } catch {
      /* ignore */
    }
  }, []);

  const stopB4PracticeVoice = useCallback(() => {
    stopB4Voice();
    stopB4Overlay();
  }, [stopB4Overlay, stopB4Voice]);

  const warnB4ClipFailed = useCallback((slug: B4ClipSlug, src: string) => {
    if (slug === 'flame-steady-success') {
      console.warn('[B4 AUDIO] missing flame-steady-success');
    }
    console.warn(`B-4 voice file failed to play: [${slug}] (${src})`);
  }, []);

  const getB4ClipAudio = useCallback(
    (slug: B4ClipSlug) => {
      const cached = b4ClipAudioRef.current.get(slug);
      if (cached) return cached;
      const src = `${publicUrl}/audio/b4/${slug}.mp3`;
      const el = new Audio(src);
      el.preload = 'auto';
      b4ClipAudioRef.current.set(slug, el);
      return el;
    },
    [publicUrl]
  );

  const playB4ClipOverlay = useCallback(
    (slug: B4ClipSlug, opts?: { bypassVoiceCheck?: boolean }) => {
      if (!opts?.bypassVoiceCheck && !voiceEnabledRef.current) return;
      const src = `${publicUrl}/audio/b4/${slug}.mp3`;
      try {
        const el = getB4ClipAudio(slug);
        const vol = voiceVolumeRef.current;
        el.volume = Math.min(1, Math.max(0, vol));
        el.currentTime = 0;
        b4OverlayRef.current = el;
        el.onended = () => {
          if (b4OverlayRef.current === el) b4OverlayRef.current = null;
        };
        el.onerror = () => {
          warnB4ClipFailed(slug, src);
          if (b4OverlayRef.current === el) b4OverlayRef.current = null;
        };
        void el.play().catch(() => {
          warnB4ClipFailed(slug, src);
          if (b4OverlayRef.current === el) b4OverlayRef.current = null;
        });
      } catch {
        warnB4ClipFailed(slug, src);
      }
    },
    [getB4ClipAudio, publicUrl, warnB4ClipFailed]
  );

  const playB4Clip = useCallback(
    (slug: B4ClipSlug, opts?: { bypassVoiceCheck?: boolean }) => {
      if (isB4OverlayClip(slug)) {
        playB4ClipOverlay(slug, opts);
        return;
      }
      if (!opts?.bypassVoiceCheck && !voiceEnabledRef.current) return;
      stopB4Voice();
      stopB4Overlay();
      const src = `${publicUrl}/audio/b4/${slug}.mp3`;
      try {
        const el = getB4ClipAudio(slug);
        el.volume = Math.min(1, Math.max(0, voiceVolumeRef.current));
        el.currentTime = 0;
        b4NarrationRef.current = el;
        const clearIfCurrent = () => {
          if (b4NarrationRef.current === el) b4NarrationRef.current = null;
        };
        el.onerror = () => {
          warnB4ClipFailed(slug, src);
          clearIfCurrent();
        };
        el.onended = () => {
          clearIfCurrent();
        };
        void el.play().catch(() => {
          warnB4ClipFailed(slug, src);
          clearIfCurrent();
        });
      } catch {
        warnB4ClipFailed(slug, src);
      }
    },
    [getB4ClipAudio, playB4ClipOverlay, publicUrl, stopB4Overlay, stopB4Voice, warnB4ClipFailed]
  );

  /** Plays one narration clip and resolves when it ends (or fails). Stops any in-flight narration first. */
  const playB4ClipAsync = useCallback(
    (slug: B4ClipSlug, opts?: { bypassVoiceCheck?: boolean }): Promise<void> => {
      if (isB4OverlayClip(slug)) {
        playB4ClipOverlay(slug, opts);
        return Promise.resolve();
      }
      if (!opts?.bypassVoiceCheck && !voiceEnabledRef.current) {
        return Promise.resolve();
      }

      stopB4Voice();
      stopB4Overlay();

      const src = `${publicUrl}/audio/b4/${slug}.mp3`;
      return new Promise((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          resolve();
        };

        try {
          const el = getB4ClipAudio(slug);
          el.volume = Math.min(1, Math.max(0, voiceVolumeRef.current));
          el.currentTime = 0;
          b4NarrationRef.current = el;

          const clearIfCurrent = () => {
            if (b4NarrationRef.current === el) b4NarrationRef.current = null;
          };

          el.onerror = () => {
            warnB4ClipFailed(slug, src);
            clearIfCurrent();
            finish();
          };
          el.onended = () => {
            clearIfCurrent();
            finish();
          };
          void el.play().catch(() => {
            warnB4ClipFailed(slug, src);
            clearIfCurrent();
            finish();
          });
        } catch {
          warnB4ClipFailed(slug, src);
          finish();
        }
      });
    },
    [getB4ClipAudio, playB4ClipOverlay, publicUrl, stopB4Overlay, stopB4Voice, warnB4ClipFailed]
  );

  const playB4Voice = useCallback(
    (key: FocusFlameB4VoiceKey, opts?: { bypassVoiceCheck?: boolean }) => {
      return playB4ClipAsync(key, opts);
    },
    [playB4ClipAsync]
  );

  const playFlameTapB4Voice = useCallback(
    (key: FlameTapB4VoiceKey) => {
      playB4Clip(FLAME_TAP_CLIP_BY_KEY[key]);
    },
    [playB4Clip]
  );

  const playFlameTapB4VoiceAsync = useCallback(
    (key: FlameTapB4VoiceKey) => {
      return playB4ClipAsync(FLAME_TAP_CLIP_BY_KEY[key]);
    },
    [playB4ClipAsync]
  );

  const playFlameSteadySuccess = useCallback(() => {
    console.log('[B4 AUDIO] flame steady success');
    return playFlameTapB4VoiceAsync('flameTap3');
  }, [playFlameTapB4VoiceAsync]);

  const playPracticeB4Voice = useCallback(
    (key: PracticeB4VoiceKey) => {
      playB4Clip(PRACTICE_CLIP_BY_KEY[key]);
    },
    [playB4Clip]
  );

  const playOptionalB4Voice = useCallback(
    (key: OptionalB4VoiceKey) => {
      playB4Clip(OPTIONAL_CLIP_BY_KEY[key]);
    },
    [playB4Clip]
  );

  const playUiConfirm = useCallback(() => {
    playB4ClipOverlay('ui-confirm');
  }, [playB4ClipOverlay]);

  const preloadB4Clips = useCallback(() => {
    if (!voiceEnabledRef.current) return;
    if (b4ClipsPreloadedRef.current) return;
    b4ClipsPreloadedRef.current = true;
    const priority: B4ClipSlug[] = [
      'scene-move',
      'scene-ceremony',
      'scene-cave',
      'flame-tap-intro',
      'flame-tap-1',
      'flame-tap-2',
      'flame-tap-3',
      'flame-steady-success',
      'mission-intro',
      'mission-complete',
      'why-feeling',
      'why-body',
      'why-move',
      'flame-start',
      'practice-start',
    ];
    priority.forEach((slug) => {
      try {
        getB4ClipAudio(slug).load();
      } catch {
        warnB4ClipFailed(slug, `${publicUrl}/audio/b4/${slug}.mp3`);
      }
    });
  }, [getB4ClipAudio, publicUrl, warnB4ClipFailed]);

  useEffect(() => {
    if (soundEnabled && voiceEnabled) {
      preloadB4Clips();
    }
  }, [soundEnabled, voiceEnabled, preloadB4Clips]);

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
    playB4Clip,
    playB4ClipAsync,
    stopB4PracticeVoice,
    playB4Voice,
    playFlameTapB4Voice,
    playFlameTapB4VoiceAsync,
    playFlameSteadySuccess,
    playPracticeB4Voice,
    playOptionalB4Voice,
    playUiConfirm,
    preloadB4Clips,
    stopB4Voice,
    playCardHover,
    playCardSelect,
    playButtonClick,
  };
}
