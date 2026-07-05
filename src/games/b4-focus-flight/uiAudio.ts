const BUTTON_SOUND_URL = '/audio/card-hover-bubble.mp3';

let buttonAudio: HTMLAudioElement | null = null;

export const playB4ButtonSound = (muted = false): void => {
  if (muted || typeof window === 'undefined') return;
  if (!buttonAudio) {
    buttonAudio = new Audio(BUTTON_SOUND_URL);
    buttonAudio.volume = 0.42;
  }

  buttonAudio.currentTime = 0;
  void buttonAudio.play().catch(() => {
    // Browser autoplay policy can reject if this is not triggered by a user gesture.
  });
};
