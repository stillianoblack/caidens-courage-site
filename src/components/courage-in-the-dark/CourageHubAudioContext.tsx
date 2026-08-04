import React, { createContext, useContext, useMemo } from 'react';
import { useCourageAdventureHubAudio } from '../../hooks/useCourageAdventureHubAudio';

type CourageHubAudioContextValue = {
  soundEnabled: boolean;
  toggleSound: () => void;
  playClick: () => void;
};

const noop = () => undefined;

const FALLBACK_AUDIO_CONTEXT: CourageHubAudioContextValue = {
  soundEnabled: false,
  toggleSound: noop,
  playClick: noop,
};

const CourageHubAudioContext = createContext<CourageHubAudioContextValue | null>(null);

export function CourageHubAudioProvider({ children }: { children: React.ReactNode }) {
  const parent = useContext(CourageHubAudioContext);
  if (parent) return <>{children}</>;
  return <CourageHubAudioProviderLocal>{children}</CourageHubAudioProviderLocal>;
}

function CourageHubAudioProviderLocal({ children }: { children: React.ReactNode }) {
  const { soundEnabled, toggleSound, playClick } = useCourageAdventureHubAudio();

  const value = useMemo(
    () => ({
      soundEnabled,
      toggleSound,
      playClick,
    }),
    [playClick, soundEnabled, toggleSound],
  );

  return (
    <CourageHubAudioContext.Provider value={value}>{children}</CourageHubAudioContext.Provider>
  );
}

export function useCourageHubAudio() {
  return useContext(CourageHubAudioContext) ?? FALLBACK_AUDIO_CONTEXT;
}
