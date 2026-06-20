import React from 'react';
import KidsAdventureIcon from './KidsAdventureIcon';
import CharacterArtImage from './CharacterArtImage';
import type { CharacterDiscoveryCatalogEntry } from '../../lib/characterDiscoveryService';
import { resolveCharacterThemeId, themeDataAttributes } from './characterThemes';

type CharacterDiscoveryCardProps = {
  entry: CharacterDiscoveryCatalogEntry;
};

export default function CharacterDiscoveryCard({ entry }: CharacterDiscoveryCardProps) {
  const { definition, earned } = entry;
  const themeId = resolveCharacterThemeId(definition.characterId);
  const themeAttrs = themeId ? themeDataAttributes(themeId) : {};
  const unlockLabel = earned ? 'Discovered' : `Unlock: ${definition.discoveryTypeLabel}`;

  const className = [
    'characterDiscoveryCard',
    earned ? 'characterDiscoveryCard--earned' : 'characterDiscoveryCard--locked',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={className} {...themeAttrs}>
      <div className="characterDiscoveryCardArtWrap" aria-hidden="true">
        <CharacterArtImage
          characterId={definition.characterId}
          src={definition.imageSrc}
          variant="discovery"
          locked={!earned}
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
        <p className="characterDiscoveryCardType">{unlockLabel}</p>
      </div>
    </article>
  );
}
