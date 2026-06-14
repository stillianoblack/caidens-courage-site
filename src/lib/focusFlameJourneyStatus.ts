import { readJourneyPathChosen } from './focusFlameJourneyPath';

export type FocusFlameJourneyStep = 1 | 2 | 3 | 4 | 5;

export type FocusFlameJourneyStatusInput = {
  /** Active child participant_id only — never parent_id. */
  participantId?: string | null;
  programCode?: string;
  hasChild: boolean;
  hasChildGrade: boolean;
  familyGoalsComplete: boolean;
  b4CheckInComplete: boolean;
  hasModuleActivity: boolean;
  hasWeeklyAdventureActivity?: boolean;
};

export type FocusFlameJourneyStatus = {
  step1Complete: boolean;
  step2Complete: boolean;
  /** Step 3 display — family goals saved for participant. */
  step3Complete: boolean;
  /** Step 4 display — B-4 Check-In complete. */
  b4CheckInComplete: boolean;
  /** Step 4 progression slot (goals + B-4). */
  step4Complete: boolean;
  /** Step 5 display — path chosen or any mission/adventure activity. */
  step5Complete: boolean;
  activeStep: FocusFlameJourneyStep;
  completedCount: number;
  totalSteps: number;
  /** All setup steps done for the selected child. */
  isProfileReady: boolean;
  pathChosen: boolean;
};

function resolvePathActivityComplete(input: FocusFlameJourneyStatusInput): boolean {
  const childId = input.participantId?.trim() || null;
  const pathChosen = readJourneyPathChosen(input.programCode, childId);
  return pathChosen || input.hasModuleActivity || Boolean(input.hasWeeklyAdventureActivity);
}

/** Shared Focus Flame Journey status — participant_id scoped only. */
export function computeFocusFlameJourneyStatus(
  input: FocusFlameJourneyStatusInput,
): FocusFlameJourneyStatus {
  const step1Complete = input.hasChild;
  const step2Complete = step1Complete && input.hasChildGrade;
  const step3Complete = input.familyGoalsComplete;
  const b4CheckInComplete = input.b4CheckInComplete;
  const step5Complete = resolvePathActivityComplete(input);
  const step4Complete = step3Complete && b4CheckInComplete;

  let activeStep: FocusFlameJourneyStep = 1;
  if (!step1Complete) activeStep = 1;
  else if (!step2Complete) activeStep = 2;
  else if (!step3Complete) activeStep = 3;
  else if (!b4CheckInComplete) activeStep = 4;
  else activeStep = 5;

  const completedCount = [
    step1Complete,
    step2Complete,
    step3Complete,
    b4CheckInComplete,
    step5Complete,
  ].filter(Boolean).length;

  const isProfileReady =
    step1Complete && step2Complete && step3Complete && b4CheckInComplete && step5Complete;

  const childId = input.participantId?.trim() || null;

  return {
    step1Complete,
    step2Complete,
    step3Complete,
    b4CheckInComplete,
    step4Complete,
    step5Complete,
    activeStep,
    completedCount,
    totalSteps: 5,
    isProfileReady,
    pathChosen: readJourneyPathChosen(input.programCode, childId),
  };
}
