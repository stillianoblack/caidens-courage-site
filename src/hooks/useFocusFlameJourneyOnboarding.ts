import { useCallback, useEffect, useMemo, useState } from 'react';
import { readActiveChildParticipantId } from '../config/activeChildParticipant';
import { ACTIVE_CHILD_EVENT } from '../lib/activeChildContext';
import { checkB4CheckInCompletion } from '../lib/baselineCompletion';
import {
  isB4CheckInCompleteLocal,
  type B4CheckInDisplayStatus,
} from '../lib/b4CheckInStatus';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { FAMILY_CHILD_GOALS_SAVED_EVENT } from '../lib/familyChildGoalsService';
import {
  computeFocusFlameJourneyStatus,
  type FocusFlameJourneyStep,
} from '../lib/focusFlameJourneyStatus';
import { readJourneyPathChosen, writeJourneyPathChosen } from '../lib/focusFlameJourneyPath';
import type { LocalAssessmentV2Record } from '../lib/pilotTrackingLocalStorage';

export type { FocusFlameJourneyStep };

export type FocusFlameJourneyState = {
  step1Complete: boolean;
  step2Complete: boolean;
  step3Complete: boolean;
  b4CheckInComplete: boolean;
  step4Complete: boolean;
  step5Complete: boolean;
  completedCount: number;
  totalSteps: number;
  activeStep: FocusFlameJourneyStep;
  isComplete: boolean;
  isProfileReady: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  markPathChosen: () => void;
};

export { readJourneyPathChosen, writeJourneyPathChosen };

type UseFocusFlameJourneyOnboardingInput = {
  hasChild: boolean;
  hasChildGrade: boolean;
  participantId?: string | null;
  goalsComplete?: boolean;
  hasModuleActivity?: boolean;
  hasWeeklyAdventureActivity?: boolean;
  programCode?: string;
  assessments?: LocalAssessmentV2Record[];
  selectedChildName?: string | null;
  summaryB4CheckInStatus?: B4CheckInDisplayStatus | null;
};

export function useFocusFlameJourneyOnboarding(
  hasChild: boolean,
  hasChildGrade: boolean,
  participantId?: string | null,
  goalsComplete = false,
  hasModuleActivity = false,
  options: Omit<
    UseFocusFlameJourneyOnboardingInput,
    'hasChild' | 'hasChildGrade' | 'participantId' | 'goalsComplete' | 'hasModuleActivity'
  > = {},
): FocusFlameJourneyState {
  const program = readActivePilotProgram();
  const programCode = options.programCode?.trim() || program?.programCode;
  const resolvedParticipantId = participantId?.trim() || readActiveChildParticipantId();
  const assessments = options.assessments;
  const selectedChildName = options.selectedChildName ?? undefined;
  const summaryB4CheckInStatus = options.summaryB4CheckInStatus ?? null;
  const hasWeeklyAdventureActivity = options.hasWeeklyAdventureActivity ?? false;

  const [b4CheckInComplete, setB4CheckInComplete] = useState(() => {
    if (summaryB4CheckInStatus === 'Complete') return true;
    if (!resolvedParticipantId) return false;
    return isB4CheckInCompleteLocal({
      programCode,
      participantId: resolvedParticipantId,
      assessments,
      selectedChildName: selectedChildName ?? undefined,
    });
  });
  const [pathRevision, setPathRevision] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const childId = participantId?.trim() || readActiveChildParticipantId();
    setPathRevision((value) => value + 1);

    if (!childId) {
      setB4CheckInComplete(false);
      setLoading(false);
      return;
    }

    if (summaryB4CheckInStatus === 'Complete') {
      setB4CheckInComplete(true);
      setLoading(false);
      return;
    }

    const localComplete = isB4CheckInCompleteLocal({
      programCode,
      participantId: childId,
      assessments,
      selectedChildName: selectedChildName ?? undefined,
    });
    setB4CheckInComplete(localComplete);

    if (localComplete) {
      setLoading(false);
      return;
    }

    const done = await checkB4CheckInCompletion(
      programCode,
      childId,
      assessments,
      selectedChildName ?? undefined,
    );
    setB4CheckInComplete(done);
    setLoading(false);
  }, [assessments, participantId, programCode, selectedChildName, summaryB4CheckInStatus]);

  useEffect(() => {
    if (summaryB4CheckInStatus === 'Complete') {
      setB4CheckInComplete(true);
      return;
    }
    if (!resolvedParticipantId) {
      setB4CheckInComplete(false);
      return;
    }
    const localComplete = isB4CheckInCompleteLocal({
      programCode,
      participantId: resolvedParticipantId,
      assessments,
      selectedChildName: selectedChildName ?? undefined,
    });
    if (localComplete) {
      setB4CheckInComplete(true);
    }
  }, [
    assessments,
    programCode,
    resolvedParticipantId,
    selectedChildName,
    summaryB4CheckInStatus,
  ]);

  useEffect(() => {
    void refresh();
  }, [refresh, hasChild, hasChildGrade, goalsComplete, hasModuleActivity, hasWeeklyAdventureActivity]);

  useEffect(() => {
    const onActiveChild = () => void refresh();
    const onBaseline = () => void refresh();
    const onGoalsSaved = () => void refresh();
    window.addEventListener(ACTIVE_CHILD_EVENT, onActiveChild);
    window.addEventListener('cc-baseline-complete', onBaseline);
    window.addEventListener(FAMILY_CHILD_GOALS_SAVED_EVENT, onGoalsSaved);
    return () => {
      window.removeEventListener(ACTIVE_CHILD_EVENT, onActiveChild);
      window.removeEventListener('cc-baseline-complete', onBaseline);
      window.removeEventListener(FAMILY_CHILD_GOALS_SAVED_EVENT, onGoalsSaved);
    };
  }, [refresh]);

  const status = useMemo(
    () =>
      computeFocusFlameJourneyStatus({
        participantId: resolvedParticipantId,
        programCode,
        hasChild,
        hasChildGrade,
        familyGoalsComplete: goalsComplete,
        b4CheckInComplete,
        hasModuleActivity,
        hasWeeklyAdventureActivity,
      }),
    [
      b4CheckInComplete,
      goalsComplete,
      hasChild,
      hasChildGrade,
      hasModuleActivity,
      hasWeeklyAdventureActivity,
      programCode,
      resolvedParticipantId,
      pathRevision,
    ],
  );

  const markPathChosen = useCallback(() => {
    const childId = participantId?.trim() || readActiveChildParticipantId();
    writeJourneyPathChosen(programCode, childId);
    setPathRevision((value) => value + 1);
  }, [participantId, programCode]);

  return {
    step1Complete: status.step1Complete,
    step2Complete: status.step2Complete,
    step3Complete: status.step3Complete,
    b4CheckInComplete: status.b4CheckInComplete,
    step4Complete: status.step4Complete,
    step5Complete: status.step5Complete,
    completedCount: status.completedCount,
    totalSteps: status.totalSteps,
    activeStep: status.activeStep,
    isComplete: status.isProfileReady,
    isProfileReady: status.isProfileReady,
    loading,
    refresh,
    markPathChosen,
  };
}
