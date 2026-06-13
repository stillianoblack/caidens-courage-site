import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFamilyOnboardingStatus } from '../../../hooks/useFamilyOnboardingStatus';
import { useFamilyPortalShell } from '../../../hooks/useFamilyPortalShell';
import { useFamilyChildGoals } from '../../../hooks/useFamilyChildGoals';
import { useActiveChild } from '../../../hooks/useActiveChild';
import { resolveTrackingProgramCode } from '../../../lib/activeProgramContext';
import { resolveSelectableFamilyChildren } from '../../../lib/familyOnboardingUtils';
import { FOCUS_FLAME_ADD_CHILD_EVENT } from '../../../lib/focusFlameJourney';
import { familyPortalPath, familySettingsChildrenGradePath } from '../../../lib/familyPortalPaths';
import { getPortalRoute } from '../../../lib/portalGamePaths';
import FocusFlameJourneyOnboarding from '../FocusFlameJourneyOnboarding';
import ParticipantDebugPanel from '../ParticipantDebugPanel';

type FamilySettingsOverviewTabProps = {
  onAddChild: () => void;
  onSetGoals: () => void;
};

export default function FamilySettingsOverviewTab({
  onAddChild,
  onSetGoals,
}: FamilySettingsOverviewTabProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const programCode = resolveTrackingProgramCode() ?? '';
  const { children, visibleChildren, loading } = useFamilyPortalShell(programCode);
  const onboarding = useFamilyOnboardingStatus();

  const selectableChildren = React.useMemo(
    () => resolveSelectableFamilyChildren(visibleChildren, children),
    [children, visibleChildren],
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

  const baselinePath = getPortalRoute('baseline-check', location.pathname);
  const continueLearningPath = familyPortalPath('continue-learning', location.pathname);
  const charactersPath = getPortalRoute('characters', location.pathname);
  const childrenGradeSettingsPath = familySettingsChildrenGradePath(location.pathname);

  const handleConfigureGrade = () => {
    navigate(childrenGradeSettingsPath);
  };

  const handleAddChild = () => {
    onAddChild();
    window.dispatchEvent(new CustomEvent(FOCUS_FLAME_ADD_CHILD_EVENT));
  };

  if (loading || onboarding.loading) {
    return <p className="family-panelHelper">Loading your journey…</p>;
  }

  return (
    <>
      <FocusFlameJourneyOnboarding
      variant="inline"
      embedGoalsEditor={false}
      activeStep={onboarding.activeStep}
      step1Complete={onboarding.hasChild}
      step2Complete={onboarding.hasChildGrade}
      step3Complete={onboarding.hasFamilyGoals}
      step4Complete={onboarding.hasCompletedB4CheckIn}
      step5Complete={onboarding.hasChosenPath}
      completedCount={onboarding.completedCount}
      totalSteps={onboarding.totalSteps}
      isComplete={onboarding.isComplete}
      baselinePath={baselinePath}
      continueLearningPath={continueLearningPath}
      charactersPath={charactersPath}
      childrenSettingsPath={childrenGradeSettingsPath}
      programCode={programCode}
      childId={childId}
      childName={activeChildSummary?.displayName}
      childGoalsRecord={childGoals.record}
      onAddChild={handleAddChild}
      onConfigureGrade={handleConfigureGrade}
      onSetGoals={onSetGoals}
      onPathChosen={onboarding.markPathChosen}
      onGoalsSaved={() => {
        void childGoals.refresh();
        void onboarding.refresh();
      }}
    />
      <ParticipantDebugPanel />
    </>
  );
}
