import React from 'react';
import { useLocation } from 'react-router-dom';
import { FAMILY_PARENT_CORNER_INTRO } from '../../../data/familyPortalContent';
import { useFamilyDashboardMetrics } from '../../../hooks/useFamilyDashboardMetrics';
import { resolveFamilyHasChild } from '../../../lib/familyOnboardingUtils';
import { resolveTrackingProgramCode } from '../../../lib/activeProgramContext';
import AdultLearningFlowSection from '../../shared/AdultLearningFlowSection';
import { getPortalRoute } from '../../../lib/portalGamePaths';
import AddChildForm from '../AddChildForm';
import FamilyAccessCodeCard from '../FamilyAccessCodeCard';
import FamilyAddedChildrenSection from '../FamilyAddedChildrenSection';
import { PortalPageIntro } from '../../portal-design-system';

export default function FamilyGuidePanel() {
  const location = useLocation();
  const programCode = resolveTrackingProgramCode() ?? undefined;
  const { refresh, visibleChildren, children, claimRequired, loading } =
    useFamilyDashboardMetrics(programCode);
  const baselinePath = getPortalRoute('baseline-check', location.pathname);
  const showAddChildForm = !claimRequired && !loading && !resolveFamilyHasChild(visibleChildren, children);

  return (
    <div className="family-panel">
      <PortalPageIntro>{FAMILY_PARENT_CORNER_INTRO.subtitle}</PortalPageIntro>

      <FamilyAccessCodeCard />

      <FamilyAddedChildrenSection children={visibleChildren} loading={loading} />

      {showAddChildForm ? (
        <AddChildForm
          compact
          routeToBaseline
          baselinePath={baselinePath}
          onAdded={() => void refresh()}
        />
      ) : null}

      <AdultLearningFlowSection placement="parent" showStatusBanner />
    </div>
  );
}
