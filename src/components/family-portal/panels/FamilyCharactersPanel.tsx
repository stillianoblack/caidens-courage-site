import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import CharacterAdventureCard from '../CharacterAdventureCard';
import {
  CHARACTER_HUB_ADULT_SECTION,
  CHARACTER_HUB_KIDS_SECTION,
  CHARACTER_HUB_PAGE,
  buildFamilyAdultGuides,
  buildFamilyKidsCharacters,
  type FamilyCharacterCard,
} from '../../../data/familyPortalContent';
import { resolveFamilyBasePath } from '../../../lib/familyPortalNav';

function CharacterCardGrid({ characters }: { characters: FamilyCharacterCard[] }) {
  return (
    <div className="family-dash-grid family-dash-grid--2">
      {characters.map((character) => (
        <CharacterAdventureCard
          key={character.id}
          characterId={character.id}
          title={character.title}
          description={character.description}
          cta={character.cta}
          href={character.href}
          status={character.status}
          statusTone={character.statusTone}
          skillTags={character.skillTags}
        />
      ))}
    </div>
  );
}

export default function FamilyCharactersPanel() {
  const location = useLocation();
  const shellBase = resolveFamilyBasePath(location.pathname);
  const kidsCharacters = useMemo(() => buildFamilyKidsCharacters(shellBase), [shellBase]);
  const adultGuides = useMemo(() => buildFamilyAdultGuides(shellBase), [shellBase]);

  return (
    <div className="family-panel family-panel--characterHub">
      <div className="family-panelIntro">
        <h2 className="family-panelIntroTitle">{CHARACTER_HUB_PAGE.title}</h2>
        <p className="family-panelIntroSubtitle">{CHARACTER_HUB_PAGE.subtitle}</p>
      </div>

      <section className="family-characterHubSection" aria-labelledby="kids-characters-heading">
        <header className="family-characterHubSectionHead">
          <h3 id="kids-characters-heading" className="family-characterHubSectionTitle">
            {CHARACTER_HUB_KIDS_SECTION.title}
          </h3>
          <p className="family-characterHubSectionDesc">{CHARACTER_HUB_KIDS_SECTION.description}</p>
        </header>
        <CharacterCardGrid characters={kidsCharacters} />
      </section>

      <section className="family-characterHubSection" aria-labelledby="adult-guides-heading">
        <header className="family-characterHubSectionHead">
          <h3 id="adult-guides-heading" className="family-characterHubSectionTitle">
            {CHARACTER_HUB_ADULT_SECTION.title}
          </h3>
          <p className="family-characterHubSectionDesc">{CHARACTER_HUB_ADULT_SECTION.description}</p>
        </header>
        <CharacterCardGrid characters={adultGuides} />
      </section>
    </div>
  );
}
