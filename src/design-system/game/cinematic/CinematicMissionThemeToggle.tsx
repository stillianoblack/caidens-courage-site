import React from 'react';
import type { CinematicMissionTheme } from '../../../lib/cinematicMissionThemePreference';
import './cinematic-mission.css';

type CinematicMissionThemeToggleProps = {
  theme: CinematicMissionTheme;
  onToggle: () => void;
};

/** Moon/sun control — switches between light coaching UI and cinematic dark UI. */
export default function CinematicMissionThemeToggle({
  theme,
  onToggle,
}: CinematicMissionThemeToggleProps) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="cinematicMissionThemeToggle"
      onClick={onToggle}
      aria-pressed={isDark}
      aria-label={isDark ? 'Switch to light mission view' : 'Switch to cinematic dark view'}
      title={isDark ? 'Light mission view' : 'Cinematic dark view'}
    >
      <span className="cinematicMissionThemeToggleIcon" aria-hidden="true">
        {isDark ? '☀️' : '🌙'}
      </span>
    </button>
  );
}
