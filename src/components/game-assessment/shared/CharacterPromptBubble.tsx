import React from 'react';
import CharacterSpeechBubble from './CharacterSpeechBubble';
import type { MissionGameTheme } from '../../mission-game/MissionSpeechRow';

type CharacterPromptBubbleProps = {
  avatarSrc: string;
  avatarAlt?: string;
  message: string;
  theme?: MissionGameTheme;
  className?: string;
};

/** @deprecated Use CharacterSpeechBubble directly. Kept for backward compatibility. */
export default function CharacterPromptBubble({
  avatarSrc,
  avatarAlt = '',
  message,
  theme = 'default',
  className = '',
}: CharacterPromptBubbleProps) {
  return (
    <CharacterSpeechBubble
      avatarSrc={avatarSrc}
      avatarAlt={avatarAlt}
      theme={theme}
      message={message}
      className={className}
    />
  );
}
