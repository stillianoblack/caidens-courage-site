import React from 'react';
import KidsAdventureIcon from '../../design-system/kids-adventure/KidsAdventureIcon';
import type { CharacterUnlockMore } from '../../lib/characterUnlockMore';

type CharacterUnlockMoreRowProps = {
  unlock: CharacterUnlockMore;
  theme: string;
};

export default function CharacterUnlockMoreRow({ unlock, theme }: CharacterUnlockMoreRowProps) {
  const iconName =
    unlock.icon === 'coin' ? 'coin' : unlock.icon === 'gift' ? 'gift' : 'badge';

  return (
    <div
      className={`characterDetailUnlockMore characterDetailUnlockMore--${theme}`}
      aria-label={unlock.title}
    >
      <div className="characterDetailUnlockMoreHead">
        <span className="characterDetailUnlockMoreTitle">{unlock.title}</span>
        <span
          className={[
            'characterDetailUnlockMorePill',
            unlock.isUnlocked ? 'characterDetailUnlockMorePill--complete' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {unlock.progressLabel}
        </span>
      </div>
      <div className="characterDetailUnlockMoreBody">
        <span className="characterDetailUnlockMoreIcon" aria-hidden="true">
          <KidsAdventureIcon name={iconName} size={18} />
        </span>
        <p className="characterDetailUnlockMoreText">{unlock.description}</p>
      </div>
    </div>
  );
}
