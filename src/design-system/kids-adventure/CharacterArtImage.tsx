import React, { useState } from 'react';
import {
  resolveCharacterAssetUrl,
  resolveCharacterThemeId,
  themeDataAttributes,
} from './characterThemes';
import './character-art-image.css';

export type CharacterArtImageProps = {
  characterId?: string | null;
  src?: string | null;
  alt?: string;
  className?: string;
  locked?: boolean;
  variant?: 'token' | 'thumb' | 'discovery';
  /** When true, render nothing instead of a silhouette box on missing/failed art. */
  hideFallback?: boolean;
};

export default function CharacterArtImage({
  characterId,
  src,
  alt = '',
  className = '',
  locked = false,
  variant = 'token',
  hideFallback = false,
}: CharacterArtImageProps) {
  const themeId = resolveCharacterThemeId(characterId);
  const resolvedSrc = resolveCharacterAssetUrl(themeId ?? characterId, src);
  const [failed, setFailed] = useState(false);
  const showSilhouette = failed || !resolvedSrc;
  const themeAttrs = themeId ? themeDataAttributes(themeId) : {};

  const wrapClass = [
    'characterArtImage',
    `characterArtImage--${variant}`,
    locked ? 'characterArtImage--locked' : '',
    themeId ? `characterArtImage--${themeId}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (showSilhouette) {
    if (hideFallback) return null;
    return (
      <span
        className={wrapClass}
        aria-hidden={!alt}
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        {...themeAttrs}
      >
        <span className="characterArtImageSilhouette" aria-hidden="true" />
      </span>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={wrapClass}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      {...themeAttrs}
    />
  );
}
