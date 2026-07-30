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

export type PilotLiveLearningCardDetails = {
  source: string;
  numerator: number | null;
  denominator: number | null;
  includedStudents: number | null;
  excludedStudents: number | null;
  dataSufficiencyRule: string;
  lastCalculatedAt: string;
  studentsWithActivity?: number;
  missionsCompleted?: number;
  questionsAnswered?: number;
  correctAnswers?: number;
  averageAttempts?: number | null;
  skillAreasObserved?: string[];
  trendNote?: string;
  baselineCompleted?: number;
  postCompleted?: number;
  currentWeekStatus?: string;
  includedDomainCount?: number;
  totalDomainCount?: number;
  weighting?: string;
};

export type PilotLiveLearningCard = {
  key: string;
  label: string;
  evidenceType: 'operational' | 'directional' | 'verified';
  centerValue: string;
  statusLabel: string;
  summary: string;
  details: PilotLiveLearningCardDetails;
  available: boolean;
  percentage?: number | null;
};

export type PilotLiveLearningSnapshot = {
  calculatedAt: string;
  subtitle: string;
  cards: PilotLiveLearningCard[];
  evidenceGuide: {
    operational: string;
    directional: string;
    verified: string;
  };
};

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

export type PilotImpactSnapshotPayload = {
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
  weeklyProgressSourceAvailable?: boolean;
  impactSnapshot: PilotImpactSnapshotPayload;
  verifiedGrowthSnapshot?: PilotImpactSnapshotPayload;
  liveLearningSnapshot?: PilotLiveLearningSnapshot;
  certificateCount: number;
  focusCoins: number;
  assessmentCount: number;
  missionCount: number;
  studentsWithAdventureCount?: number;
  activeStudentCountThisWeek?: number;
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
    kidPlaySessions?: number;
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

export type AcademyCohortRow = {
  participantId: string;
  studentIdentifier: string;
  programId: string | null;
  programCode: string | null;
  programName: string;
  programType: string;
  organization: string;
  distinctActiveDays: number;
  completedRecognizedActivities: number;
  firstActivity: string | null;
  latestActivity: string | null;
  automaticEligible: boolean;
  reportingOverride: 'automatic' | 'include' | 'exclude';
  reportingOverrideReason: string | null;
  included: boolean;
  exclusionReason: string | null;
  testSynthetic: boolean;
  missingProgramLink: boolean;
  missingGradeLevel: boolean;
};

export type AcademyOutcomePayload = {
  calculatedAt: string;
  eligibilityRule: {
    distinctActiveDays: number;
    completedRecognizedActivities: number;
    statement: string;
  };
  cohortSummary: {
    totalParticipantAccounts: number;
    automaticallyEligibleStudents: number;
    manuallyIncludedStudents: number;
    manuallyExcludedStudents: number;
    lowEngagementExclusions: number;
    testSyntheticExcluded: number;
    programsRepresented: number;
    activeOrganizations: number;
    earliestActivity: string | null;
    latestActivity: string | null;
  };
  dataQuality: {
    unmatchedParticipantRecords: number;
    missingProgramLinks: number;
    missingGradeLevels: number;
    duplicateIdentities: number;
    excludedTestSyntheticRecords: number;
    studentsBelowEligibilityThreshold: number;
    stalePrograms: number;
    missingWeeklyProgressSource: boolean;
  };
  aggregate: PilotOutcomeProgram;
  cohort: AcademyCohortRow[];
};
