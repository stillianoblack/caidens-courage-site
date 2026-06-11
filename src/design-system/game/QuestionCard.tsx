import React from 'react';
import { getCharacter } from '../characters/characterRegistry';

export type QuestionCardProps = {
  sceneLabel?: string;
  tag?: string;
  storyPrompt: string;
  characterId?: string;
  avatarSrc?: string;
  avatarAlt?: string;
  illustration?: React.ReactNode;
  className?: string;
};

export default function QuestionCard({
  sceneLabel = 'Mission Card',
  tag,
  storyPrompt,
  characterId,
  avatarSrc,
  avatarAlt,
  illustration,
  className = '',
}: QuestionCardProps) {
  const character = characterId ? getCharacter(characterId) : undefined;
  const src = avatarSrc ?? character?.avatarSrc;
  const alt = avatarAlt ?? character?.displayName ?? 'Character';

  return (
    <article className={['ds-questionCard', className].filter(Boolean).join(' ')}>
      {src ? (
        <img className="ds-questionCardAvatar" src={src} alt={alt} width={48} height={48} />
      ) : null}
      <div>
        <p className="ds-questionCardLabel">{sceneLabel}</p>
        {tag ? <p className="ds-questionCardTag">{tag}</p> : null}
        <p className="ds-questionCardText">{storyPrompt}</p>
        {illustration ? <div style={{ marginTop: '0.75rem' }}>{illustration}</div> : null}
      </div>
    </article>
  );
}
