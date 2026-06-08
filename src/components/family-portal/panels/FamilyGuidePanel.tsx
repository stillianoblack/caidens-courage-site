import React from 'react';
import { FAMILY_PARENT_CORNER_INTRO } from '../../../data/familyPortalContent';
import AdultLearningFlowSection from '../../shared/AdultLearningFlowSection';
import FamilyAccessCodeCard from '../FamilyAccessCodeCard';

export default function FamilyGuidePanel() {
  return (
    <div className="family-panel">
      <div className="family-panelIntro">
        <h2 className="family-panelIntroTitle">{FAMILY_PARENT_CORNER_INTRO.title}</h2>
        <p className="family-panelIntroSubtitle">{FAMILY_PARENT_CORNER_INTRO.subtitle}</p>
      </div>

      <FamilyAccessCodeCard />

      <AdultLearningFlowSection placement="parent" showStatusBanner />
    </div>
  );
}
