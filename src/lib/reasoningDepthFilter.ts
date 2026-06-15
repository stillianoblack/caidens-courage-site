import type { GradeBandQuestionMetadata } from '../types/gradeBandContentMetadata';
import { resolveNumericGradeLevel } from './questionDifficultySelection';

export type ReasoningDepthQuestion = {
  id: string;
  question: string;
  scenarioText?: string;
  options: readonly { id: string; label: string }[];
  metadata?: GradeBandQuestionMetadata;
};

const REASONING_SKILL_KEYWORDS = [
  'planning',
  'sequencing',
  'sequence',
  'budget',
  'budgeting',
  'tradeoff',
  'trade-off',
  'priorit',
  'schedule',
  'token',
  'executive',
  'time management',
  'time estimation',
  'multi-step',
  'consequence',
] as const;

const RECOGNITION_STEM_PATTERNS = [
  /^what is (a |an |the )?/i,
  /^which is a /i,
  /^which helps /i,
  /^define /i,
  /^which environment supports/i,
  /^what happens when distractions increase/i,
  /^why does (a )?plan help/i,
  /^what is attention control/i,
  /^what is the purpose of organizing/i,
  /^what is opportunity cost/i,
  /^what is (a )?saving strategy/i,
  /^what is fair planning/i,
  /^what is (his |her |their )?best move\??$/i,
  /^what is the best answer\??$/i,
  /^what is the fix\??$/i,
  /^what is this called/i,
] as const;

const OBVIOUS_DISTRACTOR_LABELS = [
  'tv playing',
  'gaming stream',
  'group chat open',
  'open social media',
  'do nothing',
  'wait until the last second',
  'multitasking constantly',
  'switching tasks every minute',
] as const;

export function isGradeFourOrAbove(gradeLevel: string | null | undefined): boolean {
  const grade = resolveNumericGradeLevel(gradeLevel);
  return grade != null && grade >= 4;
}

export function hasReasoningDepthMetadata(metadata?: GradeBandQuestionMetadata): boolean {
  if (!metadata) return false;
  if (metadata.difficulty === 'advanced') return true;
  const tags = [...(metadata.skillTags ?? []), metadata.skillArea ?? ''].join(' ').toLowerCase();
  return REASONING_SKILL_KEYWORDS.some((keyword) => tags.includes(keyword));
}

export function isRecognitionOnlyStem(question: ReasoningDepthQuestion): boolean {
  const prompt = question.question.trim();
  if (RECOGNITION_STEM_PATTERNS.some((pattern) => pattern.test(prompt))) {
    return true;
  }
  return /^which is the best (time )?plan\??$/i.test(prompt);
}

function combinedScenarioText(question: ReasoningDepthQuestion): string {
  const scenario = question.scenarioText?.trim() ?? '';
  const prompt = question.question.trim();
  if (!scenario) return prompt;
  if (scenario.includes(prompt)) return scenario;
  return `${scenario} ${prompt}`;
}

export function isSingleSentenceScenario(question: ReasoningDepthQuestion): boolean {
  const text = combinedScenarioText(question);
  const sentences = text.split(/[.!?]+/).map((part) => part.trim()).filter(Boolean);
  return sentences.length <= 1;
}

export function hasObviousDistractorsOnly(question: ReasoningDepthQuestion): boolean {
  const labels = question.options.map((option) => option.label.trim().toLowerCase());
  const obviousCount = labels.filter((label) =>
    OBVIOUS_DISTRACTOR_LABELS.some((distractor) => label.includes(distractor)),
  ).length;
  return obviousCount >= 2 && obviousCount >= labels.length - 1;
}

function hasTradeoffLanguage(question: ReasoningDepthQuestion): boolean {
  const text = combinedScenarioText(question).toLowerCase();
  const tradeoffSignals = [
    'minutes',
    'budget',
    '$',
    'tokens',
    'deadline',
    'before dinner',
    'before the bus',
    'only has',
    'cannot finish',
    'trade',
    'choose one',
    'fits',
    'left after',
    'due tomorrow',
    'three tasks',
    'two tasks',
    'plan',
    'order',
    'first step',
  ];
  return tradeoffSignals.some((signal) => text.includes(signal));
}

function hasNonObviousDistractors(question: ReasoningDepthQuestion): boolean {
  const labels = question.options.map((option) => option.label.trim().toLowerCase());
  const plausible = labels.filter(
    (label) => !OBVIOUS_DISTRACTOR_LABELS.some((distractor) => label.includes(distractor)),
  );
  return plausible.length >= 2;
}

/** True when question requires comparing plans, time, or tradeoffs — not recognition. */
export function passesReasoningDepthCheck(
  question: ReasoningDepthQuestion,
  gradeLevel?: string | null,
): boolean {
  if (question.metadata?.difficulty === 'beginner') {
    return false;
  }

  if (hasReasoningDepthMetadata(question.metadata) && !isRecognitionOnlyStem(question)) {
    return true;
  }

  if (isRecognitionOnlyStem(question)) {
    return false;
  }

  if (hasObviousDistractorsOnly(question)) {
    return false;
  }

  if (isSingleSentenceScenario(question) && !hasTradeoffLanguage(question)) {
    return false;
  }

  if (!hasNonObviousDistractors(question)) {
    return false;
  }

  if (gradeLevel != null && !isGradeFourOrAbove(gradeLevel)) {
    return true;
  }

  return hasTradeoffLanguage(question) || Boolean(question.scenarioText?.trim());
}

export function filterQuestionsForGradeProfile<T extends ReasoningDepthQuestion>(
  questions: readonly T[],
  gradeLevel: string | null | undefined,
): T[] {
  if (!isGradeFourOrAbove(gradeLevel)) {
    return [...questions];
  }

  const filtered = questions.filter((question) => passesReasoningDepthCheck(question, gradeLevel));
  return filtered.length > 0 ? filtered : [...questions];
}
