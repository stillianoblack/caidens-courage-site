import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SlideOutDrawer from '../portal-design-system/SlideOutDrawer';
import { useActiveChild } from '../../hooks/useActiveChild';
import { useFamilyChildGoals } from '../../hooks/useFamilyChildGoals';
import { useFamilyPortalShell } from '../../hooks/useFamilyPortalShell';
import { useFocusFlameJourneyOnboarding } from '../../hooks/useFocusFlameJourneyOnboarding';
import { familyPortalPath } from '../../lib/familyPortalPaths';
import { getPortalRoute } from '../../lib/portalGamePaths';
import { FOCUS_FLAME_ADD_CHILD_EVENT } from '../../lib/focusFlameJourney';
import FocusFlameJourneyOnboarding from './FocusFlameJourneyOnboarding';

type FocusFlameJourneyDrawerProps = {
  open: boolean;
  onClose: () => void;
  programCode: string;
};

export default function FocusFlameJourneyDrawer({
  open,
  onClose,
  programCode,
}: FocusFlameJourneyDrawerProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { children, visibleChildren, loading } = useFamilyPortalShell(programCode);

  const selectableChildren = useMemo(
    () =>
      visibleChildren
        .map((child) => ({
          participantId: child.studentId,
          displayName: child.displayName,
          firstName: child.displayName,
        }))
        .filter((child) => Boolean(child.participantId)),
    [visibleChildren],
  );

  const { activeChild } = useActiveChild(selectableChildren);
  const activeChildSummary = useMemo(
    () => children.find((child) => child.participantId === activeChild?.participantId) ?? children[0] ?? null,
    [activeChild?.participantId, children],
  );

  const childId = activeChild?.participantId ?? activeChildSummary?.participantId;
  const childGoals = useFamilyChildGoals(programCode, childId, activeChildSummary?.displayName);

  const journey = useFocusFlameJourneyOnboarding(
    selectableChildren.length > 0,
    childId,
    childGoals.complete,
  );

  const baselinePath = getPortalRoute('baseline-check', location.pathname);
  const continueLearningPath = familyPortalPath('continue-learning', location.pathname);
  const charactersPath = getPortalRoute('characters', location.pathname);
  const homePath = familyPortalPath('', location.pathname);

  const refreshJourney = journey.refresh;
  const refreshChildGoals = childGoals.refresh;

  useEffect(() => {
    if (!open) return;
    void refreshJourney();
    void refreshChildGoals();
  }, [open, refreshJourney, refreshChildGoals]);

  const handleAddChild = () => {
    onClose();
    if (location.pathname !== homePath && !location.pathname.startsWith(`${homePath}/`)) {
      navigate(homePath);
    }
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent(FOCUS_FLAME_ADD_CHILD_EVENT));
    }, 150);
  };

  return (
    <SlideOutDrawer
      open={open}
      onClose={onClose}
      className="pilot-drawer pilot-drawer--settings ffj-drawer"
      titleId="focus-flame-journey-title"
      size="large"
    >
      <div className="pilot-drawerBody pilot-drawerBody--settings ffj-drawerBody">
        {loading || journey.loading ? (
          <p className="family-panelHelper">Loading your journey…</p>
        ) : (
          <FocusFlameJourneyOnboarding
            variant="drawer"
            activeStep={journey.activeStep}
            step1Complete={journey.step1Complete}
            step2Complete={journey.step2Complete}
            step3Complete={journey.step3Complete}
            step4Complete={journey.step4Complete}
            completedCount={journey.completedCount}
            totalSteps={journey.totalSteps}
            isComplete={journey.isComplete}
            baselinePath={baselinePath}
            continueLearningPath={continueLearningPath}
            charactersPath={charactersPath}
            programCode={programCode}
            childId={childId}
            childName={activeChildSummary?.displayName}
            childGoalsRecord={childGoals.record}
            onAddChild={handleAddChild}
            onPathChosen={() => {
              journey.markPathChosen();
              onClose();
            }}
            onGoalsSaved={() => {
              void childGoals.refresh();
              void journey.refresh();
            }}
          />
        )}
      </div>
    </SlideOutDrawer>
  );
}
