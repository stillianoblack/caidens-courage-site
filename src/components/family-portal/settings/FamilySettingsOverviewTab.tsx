import React from 'react';
import { useLocation } from 'react-router-dom';
import { useActiveChild } from '../../../hooks/useActiveChild';
import { useFamilyChildGoals } from '../../../hooks/useFamilyChildGoals';
import { useFamilyPortalShell } from '../../../hooks/useFamilyPortalShell';
import { useFocusFlameJourneyOnboarding } from '../../../hooks/useFocusFlameJourneyOnboarding';
import { familyPortalPath } from '../../../lib/familyPortalPaths';
import { getPortalRoute } from '../../../lib/portalGamePaths';
import { resolveTrackingProgramCode } from '../../../lib/activeProgramContext';
import FocusFlameJourneyOnboarding from '../FocusFlameJourneyOnboarding';

type FamilySettingsOverviewTabProps = {
  onAddChild: () => void;
  onSetGoals: () => void;
};

export default function FamilySettingsOverviewTab({
  onAddChild,
  onSetGoals,
}: FamilySettingsOverviewTabProps) {
  const location = useLocation();
  const programCode = resolveTrackingProgramCode() ?? '';
  const { children, visibleChildren, loading } = useFamilyPortalShell(programCode);

  const selectableChildren = React.useMemo(
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
  const activeChildSummary = React.useMemo(
    () =>
      children.find((child) => child.participantId === activeChild?.participantId) ??
      children[0] ??
      null,
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

  if (loading || journey.loading) {
    return <p className="family-panelHelper">Loading your journey…</p>;
  }

  return (
    <FocusFlameJourneyOnboarding
      variant="inline"
      embedGoalsEditor={false}
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
      onAddChild={onAddChild}
      onSetGoals={onSetGoals}
      onPathChosen={journey.markPathChosen}
      onGoalsSaved={() => {
        void childGoals.refresh();
        void journey.refresh();
      }}
    />
  );
}
