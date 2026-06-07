import React from 'react';
import CharacterAdventureCard from '../CharacterAdventureCard';
import { FAMILY_GAMES } from '../../../data/familyPortalContent';

export default function FamilyGamesPanel() {
  return (
    <div className="family-panel">
      <div className="family-dash-grid family-dash-grid--2">
        {FAMILY_GAMES.map((game) => (
          <CharacterAdventureCard
            key={game.title}
            characterId={game.characterId}
            title={game.title}
            description={game.description}
            cta={game.cta}
            href={game.href}
          />
        ))}
      </div>
    </div>
  );
}
