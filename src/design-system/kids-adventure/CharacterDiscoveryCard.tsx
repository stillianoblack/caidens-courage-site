import React from 'react';
import KidsAdventureIcon from './KidsAdventureIcon';
import type { CharacterDiscoveryCatalogEntry } from '../../lib/characterDiscoveryService';
import { resolveCharacterThemeId, themeDataAttributes } from './characterThemes';

type CharacterDiscoveryCardProps = {
  entry: CharacterDiscoveryCatalogEntry;
};

export default function CharacterDiscoveryCard({ entry }: CharacterDiscoveryCardProps) {
  const { definition, earned } = entry;
  const themeId = resolveCharacterThemeId(definition.characterId);
  const themeAttrs = themeId ? themeDataAttributes(themeId) : {};

  const className = [
    'characterDiscoveryCard',
    earned ? 'characterDiscoveryCard--earned' : 'characterDiscoveryCard--locked',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={className} {...themeAttrs}>
      <div className="characterDiscoveryCardArtWrap" aria-hidden="true">
        <img
          src={definition.imageSrc}
          alt=""
          className="characterDiscoveryCardArt"
          loading="lazy"
          decoding="async"
        />
        {!earned ? (
          <span className="characterDiscoveryCardLock">
            <KidsAdventureIcon name="lock" size={14} filled />
          </span>
        ) : (
          <span className="characterDiscoveryCardEarned" aria-label="Earned">
            <KidsAdventureIcon name="check" size={12} filled />
          </span>
        )}
      </div>
      <div className="characterDiscoveryCardLabels">
        <p className="characterDiscoveryCardName">{definition.characterLabel}</p>
        <p className="characterDiscoveryCardType">{definition.discoveryTypeLabel}</p>
      </div>
    </article>
  );
}
