export const COURAGE_HUB_SOUND_PREF_KEY = 'focus-flame-sound-enabled';

export function loadCourageHubSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const raw = window.localStorage.getItem(COURAGE_HUB_SOUND_PREF_KEY);
  if (raw === null) return true;
  return raw === 'true';
}

export function saveCourageHubSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(COURAGE_HUB_SOUND_PREF_KEY, String(enabled));
}
