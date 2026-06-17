import { useCallback, useState } from 'react';
import {
  readCinematicMissionTheme,
  writeCinematicMissionTheme,
  type CinematicMissionTheme,
} from '../lib/cinematicMissionThemePreference';

export function useCinematicMissionThemePreference() {
  const [theme, setThemeState] = useState<CinematicMissionTheme>(() => readCinematicMissionTheme());

  const setTheme = useCallback((next: CinematicMissionTheme) => {
    setThemeState(next);
    writeCinematicMissionTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [setTheme, theme]);

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
  };
}
