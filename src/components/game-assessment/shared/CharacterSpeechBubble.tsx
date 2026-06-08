import React from 'react';
import type { MissionGameTheme } from '../../mission-game/MissionSpeechRow';
import CharacterAvatar, { type CharacterAvatarSize } from './CharacterAvatar';
import './character-speech-bubble.css';

type CharacterSpeechBubbleProps = {
  avatarSrc: string;
  avatarAlt?: string;
  theme?: MissionGameTheme;
  size?: CharacterAvatarSize;
  message?: string;
  className?: string;
  children?: React.ReactNode;
};

export default function CharacterSpeechBubble({
  avatarSrc,
  avatarAlt = '',
  theme = 'default',
  size = 'medium',
  message,
  className = '',
  children,
}: CharacterSpeechBubbleProps) {
  return (
    <div className={['character-speechBubble', `character-speechBubble--${theme}`, className].filter(Boolean).join(' ')}>
      <CharacterAvatar src={avatarSrc} alt={avatarAlt} size={size} theme={theme} />
      <div className="character-speechBubble-card">
        <div className="character-speechBubble-caret" aria-hidden="true" />
        <div className="character-speechBubble-content">
          {message ? <p className="character-speechBubble-message">{message}</p> : children}
        </div>
      </div>
    </div>
  );
}
