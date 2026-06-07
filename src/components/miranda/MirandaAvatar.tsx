import React from 'react';
import { MIRANDA_AVATAR_ALT, MIRANDA_AVATAR_SRC } from '../../data/miranda/sharedAssets';

type MirandaAvatarProps = {
  src?: string;
  alt?: string;
  /** hub | hero (landing) | complete | quiz */
  variant?: 'hub' | 'hero' | 'complete' | 'quiz';
  className?: string;
};

export default function MirandaAvatar({
  src = MIRANDA_AVATAR_SRC,
  alt = MIRANDA_AVATAR_ALT,
  variant = 'hub',
  className = '',
}: MirandaAvatarProps) {
  return (
    <div
      className={['miranda-avatar', `miranda-avatar--${variant}`, className].filter(Boolean).join(' ')}
    >
      <div className="miranda-avatarGlow" aria-hidden="true" />
      {variant === 'complete' ? (
        <span className="miranda-avatarSparkle" aria-hidden="true">
          ✦
        </span>
      ) : null}
      <img src={src} alt={alt} decoding="async" className="miranda-avatarImg" />
    </div>
  );
}
