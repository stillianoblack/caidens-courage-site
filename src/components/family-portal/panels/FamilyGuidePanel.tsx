import React from 'react';
import { useLocation } from 'react-router-dom';
import { FAMILY_PARENT_CORNER_INTRO } from '../../../data/familyPortalContent';
import { useFamilyDashboardMetrics } from '../../../hooks/useFamilyDashboardMetrics';
import { resolveFamilyAddChildVisibility } from '../../../lib/familyPortalLinkAudit';
import { resolveTrackingProgramCode } from '../../../lib/activeProgramContext';
import AdultLearningFlowSection from '../../shared/AdultLearningFlowSection';
import { getPortalRoute } from '../../../lib/portalGamePaths';
import AddChildForm from '../AddChildForm';
import FamilyAccessCodeCard from '../FamilyAccessCodeCard';
import FamilyAddedChildrenSection from '../FamilyAddedChildrenSection';

export default function FamilyGuidePanel() {
  const location = useLocation();
  const programCode = resolveTrackingProgramCode() ?? undefined;
  const { refresh, visibleChildren, children, familyLinks, claimRequired, loading } =
    useFamilyDashboardMetrics(programCode);
  const baselinePath = getPortalRoute('baseline-check', location.pathname);
  const showAddChildForm = resolveFamilyAddChildVisibility({
    claimRequired,
    visibleChildrenCount: visibleChildren.length,
    childrenSummaryCount: children.length,
    familyLinks,
  });

  return (
    <div className="family-panel">
      <div className="family-panelIntro">
        <h2 className="family-panelIntroTitle">{FAMILY_PARENT_CORNER_INTRO.title}</h2>
        <p className="family-panelIntroSubtitle">{FAMILY_PARENT_CORNER_INTRO.subtitle}</p>
      </div>

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
