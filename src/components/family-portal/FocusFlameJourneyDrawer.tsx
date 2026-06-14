import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SlideOutDrawer from '../portal-design-system/SlideOutDrawer';
import { useActiveChild } from '../../hooks/useActiveChild';
import { useFamilyChildGoals } from '../../hooks/useFamilyChildGoals';
import { useFamilyPortalShell } from '../../hooks/useFamilyPortalShell';
import { useFamilyOnboardingStatus } from '../../hooks/useFamilyOnboardingStatus';
import { familyPortalPath, familySettingsChildrenGradePath } from '../../lib/familyPortalPaths';
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
  const onboarding = useFamilyOnboardingStatus();

  const baselinePath = getPortalRoute('baseline-check', location.pathname);
  const continueLearningPath = familyPortalPath('continue-learning', location.pathname);
  const charactersPath = getPortalRoute('characters', location.pathname);
  const childrenGradeSettingsPath = familySettingsChildrenGradePath(location.pathname);
  const homePath = familyPortalPath('', location.pathname);

  useEffect(() => {
    if (!open) return;
    void onboarding.refresh();
    void childGoals.refresh();
  }, [childGoals, onboarding, open]);

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
        {loading || onboarding.loading ? (
          <p className="family-panelHelper">Loading your journey…</p>
        ) : (
          <FocusFlameJourneyOnboarding
            variant="drawer"
            activeStep={onboarding.activeStep}
            step1Complete={onboarding.hasChild}
            step2Complete={onboarding.hasChildGrade}
            step3Complete={onboarding.hasFamilyGoals}
            b4CheckInComplete={onboarding.hasCompletedB4CheckIn}
            step5Complete={onboarding.hasChosenPath}
            b4CheckInAggregateLabel={onboarding.b4CheckInAggregateLabel}
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
            profileReadyAvatarSrc={onboarding.profileReadyAvatarSrc}
            adventuresCompletedCount={onboarding.adventuresCompletedCount}
            activeParticipantRecord={onboarding.activeParticipantRecord}
            onAddChild={handleAddChild}
            onConfigureGrade={() => navigate(childrenGradeSettingsPath)}
            onPathChosen={() => {
              onboarding.markPathChosen();
              onClose();
            }}
            onGoalsSaved={() => {
              void childGoals.refresh();
              void onboarding.refresh();
            }}
          />
        )}
      </div>
    </SlideOutDrawer>
  );
}
