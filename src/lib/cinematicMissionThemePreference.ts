export type CinematicMissionTheme = 'dark' | 'light';

export const CINEMATIC_MISSION_THEME_STORAGE_KEY = 'cc-cinematic-mission-theme';

export function readCinematicMissionTheme(): CinematicMissionTheme {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = window.localStorage.getItem(CINEMATIC_MISSION_THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // ignore storage errors
  }
  return 'dark';
}

export function writeCinematicMissionTheme(theme: CinematicMissionTheme): void {
  try {
    window.localStorage.setItem(CINEMATIC_MISSION_THEME_STORAGE_KEY, theme);
  } catch {
    // ignore storage errors
  }
}
