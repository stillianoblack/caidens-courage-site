import React from 'react';
import { resolveCharacterThemeColor } from './characterThemeColors';
import './character-avatar.css';

export type CharacterAvatarSize = 'small' | 'medium' | 'large' | 'hero';

type CharacterAvatarProps = {
  src: string;
  alt?: string;
  size?: CharacterAvatarSize;
  theme?: string;
  className?: string;
};

export default function CharacterAvatar({
  src,
  alt = '',
  size = 'medium',
  theme,
  className = '',
}: CharacterAvatarProps) {
  const themeColor = resolveCharacterThemeColor(theme);
  const bordered = Boolean(theme);

  return (
    <div
      className={[
        'character-avatar',
        `character-avatar--${size}`,
        bordered ? 'character-avatar--bordered' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={bordered ? { borderColor: themeColor } : undefined}
      aria-hidden={!alt}
    >
      <img src={src} alt={alt} className="character-avatarImg" decoding="async" />
    </div>
  );
}
