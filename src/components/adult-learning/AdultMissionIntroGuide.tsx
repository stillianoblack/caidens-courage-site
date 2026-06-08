import React from 'react';
import CharacterSpeechBubble from '../game-assessment/shared/CharacterSpeechBubble';
import type { AdultGuideThemeId } from '../../types/adultTraining';
import './adult-mission-intro.css';

type AdultMissionIntroGuideProps = {
  avatarSrc: string;
  avatarAlt?: string;
  message: string;
  theme: AdultGuideThemeId;
};

export default function AdultMissionIntroGuide({
  avatarSrc,
  avatarAlt = '',
  message,
  theme,
}: AdultMissionIntroGuideProps) {
  return (
    <CharacterSpeechBubble
      avatarSrc={avatarSrc}
      avatarAlt={avatarAlt}
      theme={theme}
      size="large"
      message={message}
      className={`adultMissionIntroGuide adultMissionIntroGuide--${theme}`}
    />
  );
}
