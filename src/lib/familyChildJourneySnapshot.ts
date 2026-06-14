import { readFamilyChildGoalsLocal, hasFamilyChildGoals } from './familyChildGoalsService';
import { computeFocusFlameJourneyStatus } from './focusFlameJourneyStatus';
import type { FamilyChildSummary } from './familyChildrenMetrics';
import { resolveChildHasGrade } from './familyOnboardingUtils';
import { getCompletedModuleIds, filterModulesForActiveChild } from './characterProgressService';
import type { LocalModuleResultRecord } from './pilotTrackingLocalStorage';
import type { StudentParticipantRecord } from './pilotTrackingService';
import { readJourneyPathChosen } from './focusFlameJourneyPath';

export type FamilyChildJourneySnapshot = {
  participantId: string;
  displayName: string;
  gradeLevel: string | null;
  gradeBand: string | null;
  baselineStatus: FamilyChildSummary['baselineStatus'];
  b4CheckInStatus: FamilyChildSummary['b4CheckInStatus'];
  familyGoalsSet: boolean;
  hasChildGrade: boolean;
  adventuresCompleted: number;
  progressPct: number;
  lastActivityLabel: string;
  journeyCompletedCount: number;
  journeyTotalSteps: number;
  isProfileReady: boolean;
  activeStep: number;
};

export function buildFamilyChildJourneySnapshot(input: {
  child: FamilyChildSummary;
  programCode: string;
  studentParticipants: Array<Pick<StudentParticipantRecord, 'id' | 'grade_level' | 'grade_band'>>;
  moduleResults: LocalModuleResultRecord[];
}): FamilyChildJourneySnapshot | null {
  const participantId = input.child.participantId?.trim();
  if (!participantId) return null;

  const participant = input.studentParticipants.find((row) => row.id === participantId);
  const hasChildGrade = resolveChildHasGrade(participantId, input.studentParticipants);
  const goalsRecord = readFamilyChildGoalsLocal(input.programCode, participantId);
  const familyGoalsComplete = hasFamilyChildGoals(goalsRecord);
  const scopedModules = filterModulesForActiveChild(
    input.moduleResults,
    participantId,
    input.programCode,
  );
  const completedModuleIds = getCompletedModuleIds(scopedModules);
  const hasModuleActivity = completedModuleIds.size > 0;
  const pathChosen = readJourneyPathChosen(input.programCode, participantId);
  const b4Complete = input.child.b4CheckInStatus === 'Complete';

  const journey = computeFocusFlameJourneyStatus({
    participantId,
    programCode: input.programCode,
    hasChild: true,
    hasChildGrade,
    familyGoalsComplete,
    b4CheckInComplete: b4Complete,
    hasModuleActivity,
    hasWeeklyAdventureActivity: pathChosen || hasModuleActivity,
  });

  return {
    participantId,
    displayName: input.child.displayName,
    gradeLevel: participant?.grade_level ?? null,
    gradeBand: participant?.grade_band ?? null,
    baselineStatus: input.child.baselineStatus,
    b4CheckInStatus: input.child.b4CheckInStatus,
    familyGoalsSet: familyGoalsComplete,
    hasChildGrade,
    adventuresCompleted: input.child.completedCount,
    progressPct: input.child.progressPct,
    lastActivityLabel: input.child.latestActivity ?? 'No activity yet',
    journeyCompletedCount: journey.completedCount,
    journeyTotalSteps: journey.totalSteps,
    isProfileReady: journey.isProfileReady,
    activeStep: journey.activeStep,
  };
}
