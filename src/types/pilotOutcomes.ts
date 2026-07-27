export type OutcomeState = 'Not enough data' | 'Baseline only' | 'Post only' | 'Matched';
export type ImpactDataQuality = 'Available' | 'Directional - small sample' | 'Not enough data';
export type ImpactDisplayStatus =
  | 'Strong growth'
  | 'Positive growth'
  | 'No measurable change'
  | 'Needs attention'
  | 'On track'
  | 'Directional result'
  | 'Not enough data';

export type PilotImpactDomain = {
  key: 'reading' | 'sel' | 'focus';
  label: string;
  source: string;
  baselineNumerator: number;
  baselineDenominator: number;
  postNumerator: number;
  postDenominator: number;
  baselinePercentage: number | null;
  postPercentage: number | null;
  deltaPercentagePoints: number | null;
  matchedStudentCount: number;
  requiredMatchedCount: number;
  excludedRecordCount: number;
  dataQualityStatus: ImpactDataQuality;
  displayStatus: ImpactDisplayStatus;
  missingReason: string | null;
};

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
  impactSnapshot: {
    domains: PilotImpactDomain[];
    weeklyCompletion: {
      numerator: number;
      denominator: number;
      percentage: number | null;
      dataQualityStatus: ImpactDataQuality;
      displayStatus: ImpactDisplayStatus;
      missingReason: string | null;
    };
    participation: {
      numerator: number;
      denominator: number;
      percentage: number | null;
      dataQualityStatus: ImpactDataQuality;
      displayStatus: ImpactDisplayStatus;
      missingReason: string | null;
      baselineCompleted: number;
      postCompleted: number;
    };
    overallMatchedGrowth: {
      deltaPercentagePoints: number | null;
      includedDomainCount: number;
      totalDomainCount: number;
      matchedStudentCount: number;
      requiredMatchedCount: number;
      weighting: string;
      dataQualityStatus: ImpactDataQuality;
      displayStatus: ImpactDisplayStatus;
      missingReason: string | null;
    };
  };
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
