import type { B4BaselineCheckRecord } from '../b4BaselineCheckStorage';
import type { PilotGrowthMetrics } from '../pilotDashboardMetrics';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from '../pilotTrackingLocalStorage';
import {
  computeFamilyFocusSkillsGrowth,
  computePilotGrowthRollups,
  computeStudentGrowthSnapshot,
  type FamilyFocusSkillGrowth,
  type StudentGrowthSnapshot,
} from '../studentGrowthMetrics';
import type { StudentParticipantRecord } from '../pilotTrackingService';

export type StudentGrowthMetricsInput = {
  participants: StudentParticipantRecord[];
  assessments: LocalAssessmentV2Record[];
  moduleResults: LocalModuleResultRecord[];
  legacyBaselines?: B4BaselineCheckRecord[];
};

export type ProgramGrowthMetrics = {
  baselineScores: PilotGrowthMetrics;
  currentScores: PilotGrowthMetrics;
  growthSinceBaseline: PilotGrowthMetrics;
  studentSnapshots: StudentGrowthSnapshot[];
};

/** Program-level growth rollups used by facilitator Results KPIs. */
export function getStudentGrowthMetrics(input: StudentGrowthMetricsInput): ProgramGrowthMetrics {
  const participantIds = input.participants.map((row) => row.id).filter(Boolean);
  const rollups = computePilotGrowthRollups({
    participantIds,
    v2Assessments: input.assessments,
    moduleResults: input.moduleResults,
    legacyBaselines: input.legacyBaselines ?? [],
  });

  return {
    baselineScores: rollups.baselineScores,
    currentScores: rollups.currentScores,
    growthSinceBaseline: rollups.growthSinceBaseline,
    studentSnapshots: rollups.studentSnapshots,
  };
}

export function getStudentGrowthSnapshot(input: {
  participantId: string;
  assessments: LocalAssessmentV2Record[];
  moduleResults: LocalModuleResultRecord[];
  legacyBaselines?: B4BaselineCheckRecord[];
}): StudentGrowthSnapshot {
  return computeStudentGrowthSnapshot({
    participantId: input.participantId,
    v2Assessments: input.assessments,
    moduleResults: input.moduleResults,
    legacyBaselines: input.legacyBaselines ?? [],
  });
}

export function getFamilyFocusSkillsGrowth(input: {
  participantIds: string[];
  assessments: LocalAssessmentV2Record[];
  moduleResults: LocalModuleResultRecord[];
  legacyBaselines?: B4BaselineCheckRecord[];
}): FamilyFocusSkillGrowth[] {
  return computeFamilyFocusSkillsGrowth({
    allowedStudentIds: input.participantIds,
    v2Assessments: input.assessments,
    moduleResults: input.moduleResults,
    legacyBaselines: input.legacyBaselines ?? [],
  });
}

export type { FamilyFocusSkillGrowth, StudentGrowthSnapshot };
