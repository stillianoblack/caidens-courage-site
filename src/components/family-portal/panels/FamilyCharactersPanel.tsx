import React from 'react';
import CharacterAdventureCard from '../CharacterAdventureCard';
import { FAMILY_CHARACTERS } from '../../../data/familyPortalContent';

export default function FamilyCharactersPanel() {
  return (
    <div className="family-panel">
      <div className="family-dash-grid family-dash-grid--2">
        {FAMILY_CHARACTERS.map((character) => (
          <CharacterAdventureCard
            key={character.id}
            characterId={character.id}
            title={character.title}
            description={character.description}
            cta={character.cta}
            href={character.href}
            status={character.status}
            statusTone={character.statusTone}
          />
        ))}
      </div>
    </div>
  );
}
