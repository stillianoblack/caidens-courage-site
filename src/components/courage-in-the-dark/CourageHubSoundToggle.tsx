import React from 'react';
import { useCourageHubAudio } from './CourageHubAudioContext';

export default function CourageHubSoundToggle() {
  const { soundEnabled, toggleSound } = useCourageHubAudio();

  return (
    <button
      type="button"
      className="courageHubSoundToggle"
      aria-label={soundEnabled ? 'Sound on' : 'Sound off'}
      aria-pressed={soundEnabled}
      onClick={toggleSound}
    >
      <span className="courageHubSoundToggleIcon" aria-hidden="true">
        {soundEnabled ? '🔊' : '🔇'}
      </span>
    </button>
  );
}
