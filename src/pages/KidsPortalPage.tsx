import React, { useEffect } from 'react';
import PortalSmartBackButton from '../components/family-portal/PortalSmartBackButton';
import CharacterAdventureCard from '../components/family-portal/CharacterAdventureCard';
import '../components/family-portal/family-dashboard.css';
import { FAMILY_CHARACTERS } from '../data/familyPortalContent';

export default function KidsPortalPage() {
  useEffect(() => {
    document.title = "Kids Hub | Caiden's Courage";
  }, []);

  return (
    <main className="family-kidsHub">
      <PortalSmartBackButton />
      <h1 className="family-kidsHubTitle">Continue Learning</h1>
      <p className="family-kidsHubIntro">
        Choose a character adventure to explore story, reading, and focus activities.
      </p>
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
    </main>
  );
}
