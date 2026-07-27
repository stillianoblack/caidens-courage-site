export type OutcomeState = 'Not enough data' | 'Baseline only' | 'Post only' | 'Matched';

export type PilotOutcomeProgram = {
  id: string;
  programName: string;
  programType: string;
  facilitator: string;
  status: string;
  startDate: string | null;
  activeStudentCount: number;
  baseline: { count: number; total: number };
  post: { count: number; total: number };
  matchedCount: number;
  baselineAverage: number | null;
  postAverage: number | null;
  absoluteDelta: number | null;
  percentageDelta: number | null;
  percentageDeltaAvailable: boolean;
  weeklyCompletion: { count: number; total: number; rate: number | null };
  certificateCount: number;
  focusCoins: number;
  assessmentCount: number;
  missionCount: number;
  lastActivity: string | null;
  reportStatus: string;
  reportBlockers: string[];
  categories: Array<{
    category: string;
    baselineAverage: number | null;
    postAverage: number | null;
    delta: number | null;
    n: number;
    state: OutcomeState;
  }>;
  gradeDistribution: Array<{ grade: string; count: number }>;
  quality: {
    missingBaseline: number;
    missingPost: number;
    unmatchedRecords: number;
    duplicateAssessmentWarnings: number;
    invalidScoreRanges: number;
    studentsWithoutGrade: number;
    programWithoutStartDate: boolean;
    staleProgram: boolean;
  };
  students?: Array<{
    studentLabel: string;
    grade: string;
    baselineScore: number | null;
    postScore: number | null;
    delta: number | null;
    weeklyAdventuresCompleted: number;
    assessmentsCompleted: number;
    missionsCompleted: number;
    focusCoins: number;
    certificates: number;
    lastActivity: string | null;
    dataCompleteness: OutcomeState;
  }>;
};

export type PilotOutcomeSummary = {
  totalActivePilots: number;
  totalEnrolledStudents: number;
  completedBaseline: number;
  completedPost: number;
  matchedStudents: number;
  averageProgramCompletionRate: number | null;
  averageWeeklyAdventureCompletion: number | null;
  totalCompletedAssessments: number;
  totalCertificatesEarned: number;
  totalFocusCoinsEarned: number;
  mostRecentActivity: string | null;
};
