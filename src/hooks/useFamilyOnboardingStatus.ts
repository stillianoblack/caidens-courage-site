import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { B4_AVATAR_SRC } from '../data/b4/avatar';
import {
  FAMILY_MISSION_COACH_COPY,
  buildFamilyMissionCoachSteps,
} from '../data/familyMissionCoachContent';
import type { MissionCoachStep } from '../design-system/components/MissionCoachCard';
import { useActiveChild } from './useActiveChild';
import { useFamilyChildGoals } from './useFamilyChildGoals';
import { useFamilyDashboardMetrics } from './useFamilyDashboardMetrics';
import { resolveTrackingProgramCode } from '../lib/activeProgramContext';
import { FOCUS_FLAME_ADD_CHILD_EVENT } from '../lib/focusFlameJourney';
import {
  familyGoalsPath,
  familyPortalPath,
  familySettingsChildrenGradePath,
  familySettingsTabPath,
} from '../lib/familyPortalPaths';
import { getPortalRoute } from '../lib/portalGamePaths';
import {
  resolveChildHasGrade,
  resolveFamilyHasChild,
  resolveSelectableFamilyChildren,
} from '../lib/familyOnboardingUtils';
import type { FocusFlameJourneyStep } from './useFocusFlameJourneyOnboarding';
import { useFocusFlameJourneyOnboarding } from './useFocusFlameJourneyOnboarding';

export type FamilyOnboardingStatus = {
  hasChild: boolean;
  hasChildGrade: boolean;
  hasFamilyGoals: boolean;
  hasCompletedB4CheckIn: boolean;
  hasChosenPath: boolean;
  progressPercent: number;
  completedCount: number;
  totalSteps: number;
  steps: MissionCoachStep[];
  isComplete: boolean;
  activeStep: FocusFlameJourneyStep;
  loading: boolean;
  refresh: () => Promise<void>;
  markPathChosen: () => void;
  missionCoachProps: {
    title: string;
    subtitle: string;
    avatarImage: string;
    avatarAlt: string;
    progressLabel: string;
    progressPercent: number;
    steps: MissionCoachStep[];
    variant: 'family';
  };
};

export function useFamilyOnboardingStatus(): FamilyOnboardingStatus {
  const location = useLocation();
  const navigate = useNavigate();
  const programCode = resolveTrackingProgramCode() ?? '';
  const {
    children,
    visibleChildren,
    studentParticipants,
    moduleResults,
    loading: metricsLoading,
  } = useFamilyDashboardMetrics(programCode);

  const selectableChildren = useMemo(
    () => resolveSelectableFamilyChildren(visibleChildren, children),
    [children, visibleChildren],
  );

  const { activeChild } = useActiveChild(selectableChildren);
  const activeChildSummary = useMemo(
    () =>
      children.find((child) => child.participantId === activeChild?.participantId) ??
      children[0] ??
      null,
    [activeChild?.participantId, children],
  );

  const childId = activeChild?.participantId ?? activeChildSummary?.participantId ?? null;
  const childGoals = useFamilyChildGoals(
    programCode,
    childId ?? undefined,
    activeChildSummary?.displayName,
  );

  const hasChild = resolveFamilyHasChild(visibleChildren, children);
  const hasChildGrade = resolveChildHasGrade(childId, studentParticipants);
  const hasFamilyGoals = childGoals.complete;

  const hasModuleActivity = useMemo(() => {
    if (!childId) return false;
    return moduleResults.some((row) => row.participant_id?.trim() === childId);
  }, [childId, moduleResults]);

  const journey = useFocusFlameJourneyOnboarding(
    hasChild,
    hasChildGrade,
    childId,
    hasFamilyGoals,
    hasModuleActivity,
  );

  const baselinePath = getPortalRoute('baseline-check', location.pathname);
  const continueLearningPath = familyPortalPath('continue-learning', location.pathname);
  const childrenSettingsPath = familySettingsTabPath('children', location.pathname);
  const childrenGradeSettingsPath = familySettingsChildrenGradePath(location.pathname);
  const familyGoalsSettingsPath = familyGoalsPath(location.pathname);
  const settingsOverviewPath = familySettingsTabPath('overview', location.pathname);

  const focusAddChild = useCallback(() => {
    window.dispatchEvent(new CustomEvent(FOCUS_FLAME_ADD_CHILD_EVENT));
    navigate(childrenSettingsPath);
  }, [childrenSettingsPath, navigate]);

  const steps = useMemo(
    () =>
      buildFamilyMissionCoachSteps({
        journey,
        baselinePath,
        continueLearningPath,
        childrenSettingsPath,
        childrenGradeSettingsPath,
        familyGoalsSettingsPath,
        settingsOverviewPath,
        onAddChild: focusAddChild,
      }),
    [
      baselinePath,
      childrenGradeSettingsPath,
      childrenSettingsPath,
      continueLearningPath,
      familyGoalsSettingsPath,
      focusAddChild,
      journey,
      settingsOverviewPath,
    ],
  );

  const progressPercent = journey.totalSteps
    ? (journey.completedCount / journey.totalSteps) * 100
    : 0;

  const refresh = useCallback(async () => {
    await Promise.all([childGoals.refresh(), journey.refresh()]);
  }, [childGoals, journey]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development' || metricsLoading || journey.loading) return;
    console.info('[LOCAL_DATA_DEBUG] onboarding_status', {
      program_code: programCode || null,
      has_child: hasChild,
      has_child_grade: hasChildGrade,
      has_family_goals: hasFamilyGoals,
      has_completed_b4_check_in: journey.step4Complete,
      has_chosen_path: journey.step5Complete,
      has_module_activity: hasModuleActivity,
      active_step: journey.activeStep,
      completed_count: journey.completedCount,
    });
  }, [
    hasChild,
    hasChildGrade,
    hasFamilyGoals,
    hasModuleActivity,
    journey.activeStep,
    journey.completedCount,
    journey.loading,
    journey.step4Complete,
    journey.step5Complete,
    metricsLoading,
    programCode,
  ]);

  const missionCoachProps = useMemo(
    () => ({
      title: FAMILY_MISSION_COACH_COPY.title,
      subtitle: FAMILY_MISSION_COACH_COPY.subtitle,
      avatarImage: B4_AVATAR_SRC,
      avatarAlt: "B-4 Mission Coach",
      progressLabel: FAMILY_MISSION_COACH_COPY.progressLabel,
      progressPercent,
      steps,
      variant: 'family' as const,
    }),
    [progressPercent, steps],
  );

  return {
    hasChild,
    hasChildGrade,
    hasFamilyGoals,
    hasCompletedB4CheckIn: journey.step4Complete,
    hasChosenPath: journey.step5Complete,
    progressPercent,
    completedCount: journey.completedCount,
    totalSteps: journey.totalSteps,
    steps,
    isComplete: journey.isComplete,
    activeStep: journey.activeStep,
    loading: metricsLoading || childGoals.loading || journey.loading,
    refresh,
    markPathChosen: journey.markPathChosen,
    missionCoachProps,
  };
}
