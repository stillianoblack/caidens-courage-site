import React from 'react';
import CharacterAdventureCard from '../CharacterAdventureCard';
import { FAMILY_CONTINUE_LEARNING } from '../../../data/familyPortalContent';

export default function FamilyContinueLearningPanel() {
  return (
    <div className="family-panel">
      <p className="family-emptyNote" style={{ borderStyle: 'solid', background: 'transparent' }}>
        Pick up where you left off — story, reading games, and focus activities for your family.
      </p>
      <div className="family-dash-grid family-dash-grid--3">
        {FAMILY_CONTINUE_LEARNING.map((item) => (
          <CharacterAdventureCard
            key={item.title}
            characterId={item.characterId}
            title={item.title}
            description={item.description}
            cta={item.cta}
            href={item.href}
            status={item.status}
            statusTone={item.statusTone}
          />
        ))}
      </div>
    </div>
  );
}
