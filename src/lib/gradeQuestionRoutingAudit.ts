import type { StudentGradeBand } from '../types/gradeBandContentMetadata';
import type { GameAssessmentConfig, GameQuestion } from '../types/gameAssessment';
import { finalizeAdaptiveQuestions } from './adaptiveQuestionSelection';
import { resolveBaseGradeBand } from './getGradeBand';
import {
  resolveQuestionSourceBand,
  type GradeContentPool,
} from './gradeBandQuestionSelection';
import {
  isRecognitionOnlyStem,
  passesReasoningDepthCheck,
  type ReasoningDepthQuestion,
} from './reasoningDepthFilter';
import {
  classifyQuestionDifficultyTier,
  type DifficultyTier,
} from './questionDifficultySelection';
import { STAGING_CONTENT_ENABLED, STAGING_CONTENT_VERSION } from '../config/stagingContent';

export type CharacterId = 'caiden' | 'miranda' | 'zeke' | 'charlie' | 'b4';

export type GradeScenario = {
  id: string;
  label: string;
  gradeLevel: string | null;
  gradeBand: string | null;
  allowStretch: boolean;
  expectedBaseBand: StudentGradeBand;
  expectMissingGradeWarning?: boolean;
};

export type QuestionAuditDetail = {
  questionId: string;
  sourceBand: StudentGradeBand | 'unknown';
  difficultyTier: DifficultyTier;
  contentVersion: string | null;
  passesReasoningDepth: boolean;
  hasJokeDistractor: boolean;
  recognitionOnly: boolean;
  correctAnswerPosition: string;
};

export type MissionRoutingAuditRow = {
  character: CharacterId;
  missionId: string;
  scenarioId: string;
  scenarioLabel: string;
  gradeLevel: string | null;
  gradeBand: string | null;
  allowStretchLevel: boolean;
  resolvedBaseBand: StudentGradeBand;
  resolvedContentBand: StudentGradeBand;
  usedStretch: boolean;
  questionIds: string[];
  questions: QuestionAuditDetail[];
  stagingEnabled: boolean;
  warnings: string[];
  failures: string[];
  pass: boolean;
};

export type GradeRoutingAuditReport = {
  generatedAt: string;
  stagingEnabled: boolean;
  productionStagingRisk: boolean;
  summary: {
    totalChecks: number;
    passed: number;
    failed: number;
    warnings: number;
    byCharacter: Record<CharacterId, { passed: number; failed: number }>;
    byScenario: Record<string, { passed: number; failed: number }>;
  };
  wrongBandQuestions: Array<{ character: CharacterId; missionId: string; scenarioId: string; detail: string }>;
  tooEasyGrade4: Array<{ character: CharacterId; missionId: string; questionId: string; reason: string }>;
  invalidStretchQuestions: Array<{ character: CharacterId; missionId: string; questionId: string; reason: string }>;
  missingGradeWarnings: Array<{ character: CharacterId; missionId: string; scenarioId: string }>;
  riskyExamples: MissionRoutingAuditRow[];
  recommendedFixes: string[];
  rows: MissionRoutingAuditRow[];
};

export const GRADE_SCENARIOS: GradeScenario[] = [
  {
    id: 'k1',
    label: 'K / 1st grade',
    gradeLevel: '1',
    gradeBand: null,
    allowStretch: false,
    expectedBaseBand: 'K-1',
  },
  {
    id: '23',
    label: '2nd / 3rd grade',
    gradeLevel: '3',
    gradeBand: null,
    allowStretch: false,
    expectedBaseBand: '2-3',
  },
  {
    id: '45',
    label: '4th / 5th grade',
    gradeLevel: '5',
    gradeBand: null,
    allowStretch: false,
    expectedBaseBand: '4-5',
  },
  {
    id: 'g4-no-stretch',
    label: '4th grade, stretch off',
    gradeLevel: '4',
    gradeBand: null,
    allowStretch: false,
    expectedBaseBand: '4-5',
  },
  {
    id: 'g4-stretch',
    label: '4th grade, stretch on',
    gradeLevel: '4',
    gradeBand: null,
    allowStretch: true,
    expectedBaseBand: '4-5',
  },
  {
    id: '68',
    label: '6th / 7th / 8th grade',
    gradeLevel: '7',
    gradeBand: null,
    allowStretch: false,
    expectedBaseBand: '6-8',
  },
  {
    id: 'band-fallback',
    label: 'Missing grade_level, grade_band fallback',
    gradeLevel: null,
    gradeBand: '4-5',
    allowStretch: false,
    expectedBaseBand: '4-5',
  },
  {
    id: 'missing-grade',
    label: 'Missing grade_level and grade_band',
    gradeLevel: null,
    gradeBand: null,
    allowStretch: false,
    expectedBaseBand: '2-3',
    expectMissingGradeWarning: true,
  },
];

const JOKE_DISTRACTOR_PATTERNS: RegExp[] = [
  /\bday of the week\b/i,
  /\bforgot what games are\b/i,
  /\blike a superhero\b/i,
  /\bwater got tired\b/i,
  /\bwater is broken\b/i,
  /\bscience is over forever\b/i,
  /\bbecome an orange\b/i,
  /\btable disappeared\b/i,
  /\bfunniest\b/i,
  /\bposter glitter\b/i,
  /\bfunniest guess\b/i,
  /\bonly the volcano name\b/i,
  /\bhide forever\b/i,
  /\bcharge (its|his|her) phone\b/i,
  /\bchooses favorites\b/i,
  /\bhide tokens in a bush\b/i,
  /\bdrop all tokens\b/i,
  /\bclassroom lights\b/i,
  /\bdepends on luck\b/i,
  /\bthe silliest guess\b/i,
  /\bnothing at all\b/i,
  /\bno feelings at all\b/i,
  /\bfeelings reset every hour\b/i,
  /\bonly one feeling is allowed\b/i,
  /\bnervous means they should quit\b/i,
  /\bembarrassed means the project is bad\b/i,
  /\bthe friend deserved it\b/i,
  /\bhope for the best\b/i,
  /\bignore the first test\b/i,
  /\bchanges two things at once\b/i,
];

function isJokeDistractor(label: string): boolean {
  return JOKE_DISTRACTOR_PATTERNS.some((pattern) => pattern.test(label));
}

function findRawQuestion(
  gradeContent: GradeContentPool<ReasoningDepthQuestion>,
  questionId: string,
): ReasoningDepthQuestion | undefined {
  const bands: StudentGradeBand[] = ['K-1', '2-3', '4-5', '6-8'];
  for (const band of bands) {
    const match = gradeContent[band]?.questions.find((question) => question.id === questionId);
    if (match) return match;
  }
  return undefined;
}

function isGuessableWithoutScenario(question: ReasoningDepthQuestion, gradeLevel: string | null): boolean {
  const scenario = question.scenarioText?.trim() ?? '';
  const prompt = question.question.trim();
  if (!scenario && isRecognitionOnlyStem(question)) {
    return true;
  }
  if (scenario.length < 40 && isRecognitionOnlyStem(question)) {
    return true;
  }
  if (gradeLevel === '4' || gradeLevel === '5') {
    return !passesReasoningDepthCheck(question, gradeLevel);
  }
  return false;
}

function isBalancedPositions(positions: string[]): boolean {
  if (positions.length === 0) return true;
  const counts = new Map<string, number>();
  for (const position of positions) {
    counts.set(position, (counts.get(position) ?? 0) + 1);
  }
  const max = Math.max(...Array.from(counts.values()));
  return max / positions.length <= 0.5;
}

function forbiddenBandsForScenario(scenario: GradeScenario): StudentGradeBand[] {
  if (scenario.expectedBaseBand === 'K-1') {
    return ['2-3', '4-5', '6-8'];
  }
  if (scenario.expectedBaseBand === '2-3') {
    return ['4-5', '6-8'];
  }
  return [];
}

function expectedSourceBands(
  scenario: GradeScenario,
  usedStretch: boolean,
  contentBand: StudentGradeBand,
): StudentGradeBand[] {
  if (scenario.id === 'g4-stretch') {
    return usedStretch ? ['6-8'] : ['4-5'];
  }
  if (scenario.id === 'g4-no-stretch' || scenario.id === '45' || scenario.id === 'band-fallback') {
    return ['4-5'];
  }
  if (scenario.id === 'missing-grade') {
    return ['2-3'];
  }
  return [contentBand];
}

export function auditMissionRouting(input: {
  character: CharacterId;
  missionId: string;
  gradeContent: GradeContentPool<ReasoningDepthQuestion>;
  scenario: GradeScenario;
  config: GameAssessmentConfig;
}): MissionRoutingAuditRow {
  const { character, missionId, gradeContent, scenario, config } = input;
  const resolvedBaseBand = resolveBaseGradeBand({
    gradeLevel: scenario.gradeLevel,
    gradeBand: scenario.gradeBand,
  });
  const contentBand = (config.adaptiveMeta?.contentBand ?? resolvedBaseBand) as StudentGradeBand;
  const usedStretch = config.adaptiveMeta?.usedStretch ?? false;

  const selection = finalizeAdaptiveQuestions(gradeContent, {
    missionId,
    gradeLevel: scenario.gradeLevel,
    gradeBand: scenario.gradeBand,
    allowStretch: scenario.allowStretch,
  });

  const warnings: string[] = [];
  const failures: string[] = [];

  if (resolvedBaseBand !== scenario.expectedBaseBand) {
    failures.push(`Base band ${resolvedBaseBand} !== expected ${scenario.expectedBaseBand}`);
  }

  if (scenario.expectMissingGradeWarning) {
    warnings.push('Missing grade_level and grade_band — safe default 2-3 applied');
  }

  if (STAGING_CONTENT_ENABLED) {
    warnings.push(`Staging overrides ENABLED (${STAGING_CONTENT_VERSION})`);
  }

  const forbidden = forbiddenBandsForScenario(scenario);
  const allowedSources = expectedSourceBands(scenario, usedStretch, contentBand);

  const questions: QuestionAuditDetail[] = config.questions.map((question, index) => {
    const raw = findRawQuestion(gradeContent, question.id);
    const sourceBand =
      resolveQuestionSourceBand(gradeContent, question.id) ??
      (question.diagnosticMeta?.sourceBand as StudentGradeBand | undefined) ??
      'unknown';
    const difficultyTier =
      (question.diagnosticMeta?.difficultyTier as DifficultyTier | undefined) ??
      classifyQuestionDifficultyTier(
        { id: question.id, metadata: raw?.metadata },
        index,
        config.questions.length,
      );
    const contentVersion =
      question.diagnosticMeta?.contentVersion ??
      raw?.metadata?.contentVersion ??
      (STAGING_CONTENT_ENABLED ? STAGING_CONTENT_VERSION : 'adaptive_v2');

    const reasoningQuestion: ReasoningDepthQuestion = raw ?? {
      id: question.id,
      question: question.question ?? question.prompt,
      scenarioText: question.story,
      options: 'options' in question ? question.options : [],
    };

    const jokeDistractor =
      'options' in question
        ? question.options.some((option) => isJokeDistractor(option.label))
        : false;

    const recognitionOnly = isRecognitionOnlyStem(reasoningQuestion);
    const passesDepth = passesReasoningDepthCheck(reasoningQuestion, scenario.gradeLevel);
    const correctPosition =
      'options' in question && 'correctId' in question
        ? question.options.findIndex((option) => option.id === question.correctId)
        : -1;
    const positionLabel = correctPosition >= 0 ? ['A', 'B', 'C', 'D'][correctPosition] : '?';

    if (sourceBand !== 'unknown' && forbidden.includes(sourceBand)) {
      failures.push(`Question ${question.id} served from forbidden band ${sourceBand}`);
    }

    if (
      sourceBand !== 'unknown' &&
      allowedSources.length > 0 &&
      !allowedSources.includes(sourceBand)
    ) {
      const isFallbackSafe =
        scenario.expectedBaseBand === '2-3' &&
        sourceBand === 'K-1' &&
        contentBand === 'K-1';
      if (isFallbackSafe) {
        warnings.push(`Question ${question.id} served from K-1 fallback (2-3 content missing)`);
      } else {
        failures.push(
          `Question ${question.id} source band ${sourceBand} outside expected ${allowedSources.join(', ')}`,
        );
      }
    }

    if (scenario.id === 'g4-no-stretch' && sourceBand === '6-8') {
      failures.push(`Grade 4 without stretch received 6-8 question ${question.id}`);
    }

    if (scenario.id === 'g4-stretch' && usedStretch && sourceBand === '6-8' && !passesDepth) {
      failures.push(`Stretch served 6-8 question ${question.id} without reasoning-depth approval`);
    }

    if (
      (scenario.gradeLevel === '4' || scenario.gradeLevel === '5') &&
      !scenario.allowStretch &&
      sourceBand === '6-8'
    ) {
      failures.push(`Grade 4-5 profile received 6-8 question ${question.id}`);
    }

    if (
      (scenario.gradeLevel === '4' || scenario.gradeLevel === '5') &&
      (recognitionOnly || !passesDepth)
    ) {
      failures.push(`Grade 4-5 question ${question.id} is too easy / recognition-only`);
    }

    if (jokeDistractor) {
      failures.push(`Question ${question.id} contains joke distractor`);
    }

    if (isGuessableWithoutScenario(reasoningQuestion, scenario.gradeLevel)) {
      failures.push(`Question ${question.id} may be guessable without reading scenario`);
    }

    if (contentVersion === STAGING_CONTENT_VERSION && !STAGING_CONTENT_ENABLED) {
      failures.push(`Question ${question.id} uses staging content version in production mode`);
    }

    return {
      questionId: question.id,
      sourceBand,
      difficultyTier,
      contentVersion,
      passesReasoningDepth: passesDepth,
      hasJokeDistractor: jokeDistractor,
      recognitionOnly,
      correctAnswerPosition: positionLabel,
    };
  });

  const positions = questions.map((question) => question.correctAnswerPosition).filter((p) => p !== '?');
  if (!isBalancedPositions(positions)) {
    warnings.push(`Answer positions may be unbalanced: ${positions.join(', ')}`);
  }

  if (contentBand !== selection.contentBand) {
    warnings.push(`Config content band ${contentBand} differs from selection ${selection.contentBand}`);
  }

  return {
    character,
    missionId,
    scenarioId: scenario.id,
    scenarioLabel: scenario.label,
    gradeLevel: scenario.gradeLevel,
    gradeBand: scenario.gradeBand,
    allowStretchLevel: scenario.allowStretch,
    resolvedBaseBand,
    resolvedContentBand: contentBand,
    usedStretch,
    questionIds: config.questions.map((question) => question.id),
    questions,
    stagingEnabled: STAGING_CONTENT_ENABLED,
    warnings,
    failures,
    pass: failures.length === 0,
  };
}

export function buildRecommendedFixes(report: GradeRoutingAuditReport): string[] {
  const fixes: string[] = [];
  if (report.productionStagingRisk) {
    fixes.push('Disable staging overrides in production (unset REACT_APP_STAGING_QUESTIONS).');
  }
  if (report.tooEasyGrade4.length > 0) {
    fixes.push('Upgrade 4-5 question banks with planning, budgeting, and sequencing scenarios.');
  }
  if (report.invalidStretchQuestions.length > 0) {
    fixes.push('Tighten stretch routing so only reasoning-depth-approved 6-8 questions are served.');
  }
  if (report.wrongBandQuestions.length > 0) {
    fixes.push('Review grade band fallback and ensure base band resolution precedes question pool selection.');
  }
  if (report.missingGradeWarnings.length > 0) {
    fixes.push('Ensure Supabase grade_level is saved and async grade resolution completes before mission start.');
  }
  if (fixes.length === 0) {
    fixes.push('No critical routing fixes detected — continue monitoring with verify:grade-routing in CI.');
  }
  return fixes;
}

export function summarizeAuditRows(rows: MissionRoutingAuditRow[]): Omit<GradeRoutingAuditReport, 'rows' | 'recommendedFixes'> {
  const byCharacter = {} as Record<CharacterId, { passed: number; failed: number }>;
  const byScenario = {} as Record<string, { passed: number; failed: number }>;

  const wrongBandQuestions: GradeRoutingAuditReport['wrongBandQuestions'] = [];
  const tooEasyGrade4: GradeRoutingAuditReport['tooEasyGrade4'] = [];
  const invalidStretchQuestions: GradeRoutingAuditReport['invalidStretchQuestions'] = [];
  const missingGradeWarnings: GradeRoutingAuditReport['missingGradeWarnings'] = [];

  for (const row of rows) {
    byCharacter[row.character] ??= { passed: 0, failed: 0 };
    byScenario[row.scenarioId] ??= { passed: 0, failed: 0 };
    if (row.pass) {
      byCharacter[row.character].passed += 1;
      byScenario[row.scenarioId].passed += 1;
    } else {
      byCharacter[row.character].failed += 1;
      byScenario[row.scenarioId].failed += 1;
    }

    for (const failure of row.failures) {
      if (failure.includes('forbidden band') || failure.includes('outside expected')) {
        wrongBandQuestions.push({
          character: row.character,
          missionId: row.missionId,
          scenarioId: row.scenarioId,
          detail: failure,
        });
      }
      if (failure.includes('too easy') || failure.includes('recognition-only')) {
        tooEasyGrade4.push({
          character: row.character,
          missionId: row.missionId,
          questionId: failure.match(/question ([^\s]+)/)?.[1] ?? 'unknown',
          reason: failure,
        });
      }
      if (failure.includes('Stretch served') || failure.includes('without stretch received 6-8')) {
        invalidStretchQuestions.push({
          character: row.character,
          missionId: row.missionId,
          questionId: failure.match(/question ([^\s]+)/)?.[1] ?? 'unknown',
          reason: failure,
        });
      }
    }

    if (row.warnings.some((warning) => warning.includes('Missing grade_level'))) {
      missingGradeWarnings.push({
        character: row.character,
        missionId: row.missionId,
        scenarioId: row.scenarioId,
      });
    }
  }

  const failedRows = rows.filter((row) => !row.pass);
  const riskyExamples = [...failedRows]
    .sort((left, right) => right.failures.length - left.failures.length)
    .slice(0, 20);

  const passed = rows.filter((row) => row.pass).length;
  const warnings = rows.reduce((sum, row) => sum + row.warnings.length, 0);

  return {
    generatedAt: new Date().toISOString(),
    stagingEnabled: STAGING_CONTENT_ENABLED,
    productionStagingRisk: STAGING_CONTENT_ENABLED && process.env.NODE_ENV === 'production',
    summary: {
      totalChecks: rows.length,
      passed,
      failed: rows.length - passed,
      warnings,
      byCharacter,
      byScenario,
    },
    wrongBandQuestions,
    tooEasyGrade4,
    invalidStretchQuestions,
    missingGradeWarnings,
    riskyExamples,
  };
}
