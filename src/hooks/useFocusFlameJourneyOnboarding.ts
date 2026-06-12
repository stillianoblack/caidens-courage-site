import { useCallback, useEffect, useMemo, useState } from 'react';
import { readActiveChildParticipantId } from '../config/activeChildParticipant';
import { ACTIVE_CHILD_EVENT } from '../lib/activeChildContext';
import { checkBaselineCompletion } from '../lib/baselineCompletion';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { FAMILY_CHILD_GOALS_SAVED_EVENT } from '../lib/familyChildGoalsService';

const PATH_CHOSEN_KEY = 'focusFlame:journey:pathChosen';

export type FocusFlameJourneyStep = 1 | 2 | 3 | 4 | 5;

export type FocusFlameJourneyState = {
  step1Complete: boolean;
  step2Complete: boolean;
  step3Complete: boolean;
  step4Complete: boolean;
  step5Complete: boolean;
  completedCount: number;
  totalSteps: number;
  activeStep: FocusFlameJourneyStep;
  isComplete: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  markPathChosen: () => void;
};

export function readJourneyPathChosen(programCode?: string, childId?: string | null): boolean {
  if (typeof window === 'undefined') return false;
  const key = `${PATH_CHOSEN_KEY}:${programCode ?? 'default'}:${childId ?? 'default'}`;
  return localStorage.getItem(key) === 'true';
}

export function writeJourneyPathChosen(programCode?: string, childId?: string | null): void {
  if (typeof window === 'undefined') return;
  const key = `${PATH_CHOSEN_KEY}:${programCode ?? 'default'}:${childId ?? 'default'}`;
  localStorage.setItem(key, 'true');
}

export function useFocusFlameJourneyOnboarding(
  hasChild: boolean,
  hasChildGrade: boolean,
  participantId?: string | null,
  goalsComplete = false,
  hasModuleActivity = false,
): FocusFlameJourneyState {
  const program = readActivePilotProgram();
  const programCode = program?.programCode;
  const resolvedParticipantId = participantId?.trim() || readActiveChildParticipantId();

  const [baselineComplete, setBaselineComplete] = useState(false);
  const [pathChosen, setPathChosen] = useState(() =>
    readJourneyPathChosen(programCode, resolvedParticipantId),
  );
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const childId = participantId?.trim() || readActiveChildParticipantId();
    setPathChosen(readJourneyPathChosen(programCode, childId));
    if (!childId) {
      setBaselineComplete(false);
      setLoading(false);
      return;
    }
    const done = await checkBaselineCompletion(programCode, childId);
    setBaselineComplete(done);
    setLoading(false);
  }, [participantId, programCode]);

  useEffect(() => {
    void refresh();
  }, [refresh, hasChild, hasChildGrade, goalsComplete]);

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

  const step1Complete = hasChild;
  const step2Complete = step1Complete && hasChildGrade;
  const step3Complete = step2Complete && goalsComplete;
  const step4Complete = step3Complete && baselineComplete;
  const step5Complete = step4Complete && (pathChosen || hasModuleActivity);

  const activeStep: FocusFlameJourneyStep = useMemo(() => {
    if (!step1Complete) return 1;
    if (!step2Complete) return 2;
    if (!step3Complete) return 3;
    if (!step4Complete) return 4;
    return 5;
  }, [step1Complete, step2Complete, step3Complete, step4Complete]);

  const completedCount = [
    step1Complete,
    step2Complete,
    step3Complete,
    step4Complete,
    step5Complete,
  ].filter(Boolean).length;

  const isComplete = step5Complete;

  const markPathChosen = useCallback(() => {
    const childId = participantId?.trim() || readActiveChildParticipantId();
    writeJourneyPathChosen(programCode, childId);
    setPathChosen(true);
  }, [participantId, programCode]);

  return {
    step1Complete,
    step2Complete,
    step3Complete,
    step4Complete,
    step5Complete,
    completedCount,
    totalSteps: 5,
    activeStep,
    isComplete,
    loading,
    refresh,
    markPathChosen,
  };
}
