import React from 'react';
import {
  FAMILY_PARENT_CORNER_CARDS,
  FAMILY_PARENT_CORNER_INTRO,
} from '../../../data/familyPortalContent';
import AdultTrainingCard from '../../shared/AdultTrainingCard';

export default function FamilyGuidePanel() {
  return (
    <div className="family-panel">
      <div className="family-panelIntro">
        <h2 className="family-panelIntroTitle">{FAMILY_PARENT_CORNER_INTRO.title}</h2>
        <p className="family-panelIntroSubtitle">{FAMILY_PARENT_CORNER_INTRO.subtitle}</p>
      </div>

      <div className="adultTraining-grid">
        {FAMILY_PARENT_CORNER_CARDS.map((card) => (
          <AdultTrainingCard key={card.title} card={card} />
        ))}
      </div>
    </div>
  );
}
