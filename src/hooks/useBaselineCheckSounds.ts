import { useCallback, useEffect, useMemo, useState } from 'react';

const SOUND_PREF_KEY = 'caidens-courage-bbc-sound-enabled';

export function loadBaselineSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const raw = window.localStorage.getItem(SOUND_PREF_KEY);
  if (raw === null) return true;
  return raw === 'true';
}

export function saveBaselineSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SOUND_PREF_KEY, String(enabled));
}

function audioPath(publicUrl: string, filename: string): string {
  return `${publicUrl}/audio/${encodeURIComponent(filename)}`;
}

/** UI effects only — no background music. */
export function useBaselineCheckSounds() {
  const publicUrl = process.env.PUBLIC_URL || '';
  const [soundEnabled, setSoundEnabledState] = useState(loadBaselineSoundEnabled);

  const paths = useMemo(
    () => ({
      select: audioPath(publicUrl, 'card-hover-bubble.mp3'),
      itemButton: audioPath(publicUrl, 'Selecting Item Button.wav'),
      moduleWin: audioPath(publicUrl, 'Game Success Win.wav'),
      success1: audioPath(publicUrl, 'Success Button 1.mp3'),
      success2: audioPath(publicUrl, 'Success Button 2.mp3'),
      success4: audioPath(publicUrl, 'Success Button 4.mp3'),
      success3: audioPath(publicUrl, 'Success Button 3.mp3'),
    }),
    [publicUrl],
  );

  useEffect(() => {
    saveBaselineSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  const play = useCallback(
    (src: string, volume: number, fallbackSrc?: string) => {
      if (!soundEnabled) return;
      const audio = new Audio(src);
      audio.volume = volume;
      if (fallbackSrc) {
        audio.onerror = () => {
          const fallback = new Audio(fallbackSrc);
          fallback.volume = volume;
          void fallback.play().catch(() => undefined);
        };
      }
      void audio.play().catch(() => undefined);
    },
    [soundEnabled],
  );

  const playSelect = useCallback(() => play(paths.select, 0.38), [paths.select, play]);
  const playItemButton = useCallback(() => play(paths.itemButton, 0.42), [paths.itemButton, play]);
  const playContinue = useCallback(() => play(paths.select, 0.38), [paths.select, play]);
  const playModuleWin = useCallback(() => play(paths.moduleWin, 0.5), [paths.moduleWin, play]);
  const playResultFeelings = useCallback(() => play(paths.success1, 0.48), [paths.success1, play]);
  const playResultReading = useCallback(() => play(paths.success2, 0.48), [paths.success2, play]);
  const playResultFocus = useCallback(
    () => play(paths.success4, 0.48, paths.success3),
    [paths.success4, paths.success3, play],
  );

  const toggleSound = useCallback(() => {
    if (soundEnabled) {
      const audio = new Audio(paths.itemButton);
      audio.volume = 0.42;
      void audio.play().catch(() => undefined);
    }
    setSoundEnabledState((on) => {
      const next = !on;
      if (next) {
        const audio = new Audio(paths.itemButton);
        audio.volume = 0.42;
        void audio.play().catch(() => undefined);
      }
      return next;
    });
  }, [soundEnabled, paths.itemButton]);

  return {
    soundEnabled,
    toggleSound,
    playSelect,
    playItemButton,
    playContinue,
    playModuleWin,
    playResultFeelings,
    playResultReading,
    playResultFocus,
  };
}
