import { loadSpeechVoices, pickEnglishVoice } from './pickEnglishVoice';
import type { NarrationPlaybackState, NarrationProvider, NarrationVoiceSettings } from './types';

export class BrowserSpeechProvider implements NarrationProvider {
  readonly id = 'browser-speech';

  private state: NarrationPlaybackState = 'idle';
  private segments: string[] = [];
  private segmentIndex = 0;
  private settings: NarrationVoiceSettings = { rate: 0.92, pitch: 1, volume: 1 };
  private onStateChange: ((state: NarrationPlaybackState) => void) | null = null;
  private onComplete: (() => void) | null = null;
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const syncVoices = () => {
        this.voice = pickEnglishVoice(loadSpeechVoices());
      };
      syncVoices();
      window.speechSynthesis.addEventListener('voiceschanged', syncVoices);
    }
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  getState(): NarrationPlaybackState {
    return this.state;
  }

  speak(
    segments: string[],
    settings: NarrationVoiceSettings,
    callbacks?: {
      onStateChange?: (state: NarrationPlaybackState) => void;
      onComplete?: () => void;
    },
  ): void {
    if (!this.isSupported()) return;

    const cleaned = segments.map((segment) => segment.trim()).filter(Boolean);
    if (!cleaned.length) return;

    this.stopInternal(false);
    this.segments = cleaned;
    this.segmentIndex = 0;
    this.settings = settings;
    this.onStateChange = callbacks?.onStateChange ?? null;
    this.onComplete = callbacks?.onComplete ?? null;
    this.voice = pickEnglishVoice(loadSpeechVoices());
    this.setState('playing');
    this.speakCurrentSegment();
  }

  pause(): void {
    if (!this.isSupported() || this.state !== 'playing') return;
    try {
      window.speechSynthesis.pause();
      this.setState('paused');
    } catch {
      /* ignore */
    }
  }

  resume(): void {
    if (!this.isSupported() || this.state !== 'paused') return;
    try {
      window.speechSynthesis.resume();
      this.setState('playing');
    } catch {
      /* ignore */
    }
  }

  stop(): void {
    this.stopInternal(true);
  }

  private stopInternal(notify: boolean): void {
    if (!this.isSupported()) {
      this.segments = [];
      this.segmentIndex = 0;
      this.setState('idle');
      return;
    }

    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }

    this.segments = [];
    this.segmentIndex = 0;

    if (notify) {
      this.onComplete = null;
    }

    this.setState('idle');
  }

  private setState(next: NarrationPlaybackState): void {
    this.state = next;
    this.onStateChange?.(next);
  }

  private speakCurrentSegment(): void {
    if (!this.isSupported()) return;

    const text = this.segments[this.segmentIndex];
    if (!text) {
      this.finish();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = this.settings.rate;
      utterance.pitch = this.settings.pitch;
      utterance.volume = Math.min(1, Math.max(0, this.settings.volume));
      if (this.voice) utterance.voice = this.voice;

      utterance.onend = () => {
        if (this.state === 'idle') return;
        this.segmentIndex += 1;
        if (this.segmentIndex >= this.segments.length) {
          this.finish();
          return;
        }
        this.speakCurrentSegment();
      };

      utterance.onerror = () => {
        this.finish();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      this.finish();
    }
  }

  private finish(): void {
    const complete = this.onComplete;
    this.segments = [];
    this.segmentIndex = 0;
    this.onComplete = null;
    this.setState('idle');
    complete?.();
  }
}

export const browserSpeechProvider = new BrowserSpeechProvider();
