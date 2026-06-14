const SOUND_PREF_KEY = 'caidens-courage-bbc-sound-enabled';

function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const raw = window.localStorage.getItem(SOUND_PREF_KEY);
  if (raw === null) return true;
  return raw === 'true';
}

/** Plays the shared mission/quest success sound once. */
export function playGameSuccessSound(): void {
  if (!isSoundEnabled() || typeof window === 'undefined') return;
  const publicUrl = process.env.PUBLIC_URL || '';
  const src = `${publicUrl}/audio/${encodeURIComponent('Game Success Win.wav')}`;
  const audio = new Audio(src);
  audio.volume = 0.5;
  void audio.play().catch(() => undefined);
}
