import React from 'react';
import { FAMILY_PARENT_CORNER_INTRO } from '../../../data/familyPortalContent';
import { useFamilyDashboardMetrics } from '../../../hooks/useFamilyDashboardMetrics';
import { resolveTrackingProgramCode } from '../../../lib/activeProgramContext';
import AdultLearningFlowSection from '../../shared/AdultLearningFlowSection';
import AddChildForm from '../AddChildForm';
import FamilyAccessCodeCard from '../FamilyAccessCodeCard';

export default function FamilyGuidePanel() {
  const programCode = resolveTrackingProgramCode() ?? undefined;
  const { refresh } = useFamilyDashboardMetrics(programCode);

  return (
    <div className="family-panel">
      <div className="family-panelIntro">
        <h2 className="family-panelIntroTitle">{FAMILY_PARENT_CORNER_INTRO.title}</h2>
        <p className="family-panelIntroSubtitle">{FAMILY_PARENT_CORNER_INTRO.subtitle}</p>
      </div>

      <FamilyAccessCodeCard />

      <AddChildForm compact onAdded={() => void refresh()} />

      <AdultLearningFlowSection placement="parent" showStatusBanner />
    </div>
  );
}
