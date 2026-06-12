export type NarrationPlaybackState = 'idle' | 'playing' | 'paused';

export type NarrationVoiceSettings = {
  rate: number;
  pitch: number;
  volume: number;
};

/** Tuned for ages 5–8 — slower, calm delivery. */
export const DEFAULT_NARRATION_VOICE: NarrationVoiceSettings = {
  rate: 0.78,
  pitch: 0.96,
  volume: 1.0,
};

/** Pluggable narration backend — BrowserSpeech today, ElevenLabs later. */
export interface NarrationProvider {
  readonly id: string;
  isSupported(): boolean;
  speak(
    segments: string[],
    settings: NarrationVoiceSettings,
    callbacks?: {
      onStateChange?: (state: NarrationPlaybackState) => void;
      onComplete?: () => void;
    },
  ): void;
  pause(): void;
  resume(): void;
  stop(): void;
  getState(): NarrationPlaybackState;
}
