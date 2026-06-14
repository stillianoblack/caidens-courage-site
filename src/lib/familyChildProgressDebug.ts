import type { FamilyChildSummary } from './familyChildrenMetrics';
import { fetchCompletedMissionIdsByWeek } from './adventureWeekProgress';
import { readActiveChildParticipantId } from '../config/activeChildParticipant';
import { readFamilyChildGoalsLocal, hasFamilyChildGoals } from './familyChildGoalsService';
import type { StudentParticipantRecord } from './pilotTrackingService';
import { resolveChildHasGrade } from './familyOnboardingUtils';
import { getCompletedModuleIds, filterModulesForActiveChild } from './characterProgressService';
import type { LocalModuleResultRecord } from './pilotTrackingLocalStorage';

type FamilyChildProgressDebugInput = {
  children: FamilyChildSummary[];
  activeParticipantId?: string | null;
  studentParticipants?: Array<Pick<StudentParticipantRecord, 'id' | 'grade_level' | 'grade_band'>>;
  programCode?: string;
  moduleResults?: LocalModuleResultRecord[];
};

/** Development-only family progress audit for multi-child debugging. */
export async function logFamilyChildProgressDebug(input: FamilyChildProgressDebugInput): Promise<void> {
  if (process.env.NODE_ENV !== 'development') return;

  const activeId = input.activeParticipantId?.trim() || readActiveChildParticipantId();
  const programCode = input.programCode?.trim() ?? '';

  const rows = await Promise.all(
    input.children.map(async (child) => {
      const participantId = child.participantId?.trim() || '';
      const completedByWeek = participantId
        ? await fetchCompletedMissionIdsByWeek(participantId).catch(() => ({}))
        : {};
      const goalsRecord = programCode
        ? readFamilyChildGoalsLocal(programCode, participantId || null)
        : null;
      const scopedModules = participantId
        ? filterModulesForActiveChild(input.moduleResults ?? [], participantId, programCode)
        : [];
      const completedMissions = participantId
        ? getCompletedModuleIds(scopedModules).size
        : Object.values(completedByWeek).reduce((sum, ids) => sum + ids.length, 0);
      const participant = input.studentParticipants?.find((row) => row.id === participantId);

      return {
        name: child.displayName,
        participant_id: participantId || null,
        grade_level: participant?.grade_level ?? null,
        baseline_complete: child.baselineStatus === 'Complete',
        b4_checkin_complete: child.b4CheckInStatus === 'Complete',
        family_goals_set: hasFamilyChildGoals(goalsRecord),
        has_grade: resolveChildHasGrade(participantId, input.studentParticipants ?? []),
        completed_missions: completedMissions,
        completed_missions_by_week: completedByWeek,
        selected: participantId === activeId,
      };
    }),
  );

  console.table(rows);
}
