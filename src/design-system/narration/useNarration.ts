import { useCallback, useEffect, useRef, useState } from 'react';
import { browserSpeechProvider } from './BrowserSpeechProvider';
import type { NarrationPlaybackState, NarrationProvider, NarrationVoiceSettings } from './types';
import { DEFAULT_NARRATION_VOICE } from './types';

export function useNarration(provider: NarrationProvider = browserSpeechProvider) {
  const providerRef = useRef(provider);
  providerRef.current = provider;

  const [state, setState] = useState<NarrationPlaybackState>(() => provider.getState());
  const supported = provider.isSupported();

  const stop = useCallback(() => {
    providerRef.current.stop();
    setState('idle');
  }, []);

  const play = useCallback(
    (segments: string[], settings: NarrationVoiceSettings = DEFAULT_NARRATION_VOICE) => {
      if (!segments.length) return;
      providerRef.current.speak(segments, settings, {
        onStateChange: setState,
        onComplete: () => setState('idle'),
      });
    },
    [],
  );

  const pause = useCallback(() => {
    providerRef.current.pause();
    setState(providerRef.current.getState());
  }, []);

  const resume = useCallback(() => {
    providerRef.current.resume();
    setState(providerRef.current.getState());
  }, []);

  useEffect(() => () => providerRef.current.stop(), []);

  return {
    supported,
    state,
    play,
    pause,
    resume,
    stop,
  };
}
