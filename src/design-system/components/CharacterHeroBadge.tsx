import React from 'react';
import type { FamilyCharacterId } from '../../data/familyPortalContent';
import { CHARACTER_ASSETS } from '../../data/familyPortalContent';
import ZekePlaceholderAvatar from './ZekePlaceholderAvatar';
import type { TrailNodeKind } from '../../types/adventureTrail';

export type CharacterHeroBadgeProps = {
  characterId?: FamilyCharacterId;
  kind?: TrailNodeKind;
  size?: 'md' | 'lg';
  state?: 'complete' | 'available' | 'locked' | 'in_progress' | 'coming_soon';
};

const KIND_LABELS: Partial<Record<TrailNodeKind, string>> = {
  family_activity: '★',
  certificate: '✦',
};

export default function CharacterHeroBadge({
  characterId,
  kind = 'caiden',
  size = 'md',
  state = 'available',
}: CharacterHeroBadgeProps) {
  const sizeClass = size === 'lg' ? 'characterHeroBadge--lg' : 'characterHeroBadge--md';
  const themeClass = characterId ? `characterHeroBadge--${characterId}` : `characterHeroBadge--${kind}`;
  const stateClass = `characterHeroBadge--${state}`;

  const asset = characterId ? CHARACTER_ASSETS[characterId] : null;

  return (
    <div
      className={['characterHeroBadge', sizeClass, themeClass, stateClass].join(' ')}
      aria-hidden="true"
    >
      {characterId === 'zeke' && !asset?.imageSrc ? (
        <ZekePlaceholderAvatar className="characterHeroBadgeAvatar characterHeroBadgeAvatar--zeke" />
      ) : asset?.imageSrc ? (
        <img src={asset.imageSrc} alt="" className="characterHeroBadgeAvatar" loading="lazy" />
      ) : (
        <span className="characterHeroBadgeFallback">{KIND_LABELS[kind] ?? '•'}</span>
      )}
      {state === 'complete' ? (
        <span className="characterHeroBadgeMark characterHeroBadgeMark--complete" aria-hidden="true">
          ✓
        </span>
      ) : null}
      {state === 'locked' || state === 'coming_soon' ? (
        <span className="characterHeroBadgeMark characterHeroBadgeMark--locked" aria-hidden="true">
          {state === 'coming_soon' ? '…' : (
            <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor" aria-hidden="true">
              <path d="M11 7V5a3 3 0 1 0-6 0v2H4v7h8V7h-1zm-2 0H7V5a1 1 0 1 1 2 0v2z" />
            </svg>
          )}
        </span>
      ) : null}
    </div>
  );
}
