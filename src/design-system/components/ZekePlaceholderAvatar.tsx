import React from 'react';
import { ZEKE_AVATAR_SRC } from '../../data/zeke/sharedAssets';

/** Zeke avatar — uses the same game icon as Character Hub and mission flows. */
export default function ZekePlaceholderAvatar({ className }: { className?: string }) {
  return (
    <img
      src={ZEKE_AVATAR_SRC}
      alt=""
      className={['weeklyAdventureCardAvatar', className].filter(Boolean).join(' ')}
      width={56}
      height={56}
      loading="lazy"
    />
  );
}
