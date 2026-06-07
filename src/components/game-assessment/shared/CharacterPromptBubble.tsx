import React from 'react';

type CharacterPromptBubbleProps = {
  avatarSrc: string;
  avatarAlt?: string;
  message: string;
  className?: string;
};

export default function CharacterPromptBubble({
  avatarSrc,
  avatarAlt = '',
  message,
  className = '',
}: CharacterPromptBubbleProps) {
  return (
    <div className={['bbc-quizPrompt', className].filter(Boolean).join(' ')}>
      <div className="bbc-quizB4" aria-hidden={!avatarAlt}>
        <img src={avatarSrc} alt={avatarAlt} decoding="async" />
      </div>
      <div className="bbc-speechBubble">{message}</div>
    </div>
  );
}
