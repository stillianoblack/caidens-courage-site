import { STAGING_CONTENT_ENABLED } from '../config/stagingContent';

export type StagingChoiceOverride = {
  questionId: string;
  scenarioText?: string;
  questionText: string;
  choices: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation?: string;
  hint?: string;
  skillTags?: string[];
  scenarioTag?: string;
  scenarioAccent?: string;
  correctFeedback?: string;
  incorrectFeedback?: string;
  contentVersion: 'adaptive_staging_v4_difficulty';
};

type StagingManifest = {
  overrides: Record<string, StagingChoiceOverride>;
};

let manifestCache: StagingManifest | null = null;

function loadManifest(): StagingManifest | null {
  if (!STAGING_CONTENT_ENABLED) return null;
  if (manifestCache) return manifestCache;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
    const manifest = require('../data/staging/manifest.json') as StagingManifest;
    manifestCache = manifest;
    return manifest;
  } catch {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[STAGING_CONTENT] manifest.json not found — run npm run rewrite:staging');
    }
    return null;
  }
}

const CHOICE_IDS = ['a', 'b', 'c', 'd'] as const;

type QuestionWithChoices = {
  id: string;
  question: string;
  scenarioText?: string;
  scenarioTag?: string;
  scenarioAccent?: string;
  options: { id: string; label: string }[];
  correctAnswer: string;
  explanation?: string;
  hint?: string;
  skillTags?: string[];
  correctFeedback?: string;
  incorrectFeedback?: string;
  metadata?: { contentVersion?: string; skillTags?: string[] };
};

export function applyStagingQuestionOverride<T extends QuestionWithChoices>(question: T): T {
  const manifest = loadManifest();
  if (!manifest) return question;

  const override = manifest.overrides[question.id];
  if (!override) return question;

  const options = override.choices.map((label, index) => ({
    id: CHOICE_IDS[index],
    label,
  }));

  return {
    ...question,
    question: override.questionText,
    scenarioText: override.scenarioText ?? question.scenarioText,
    scenarioTag: override.scenarioTag ?? question.scenarioTag,
    scenarioAccent: override.scenarioAccent ?? question.scenarioAccent,
    options,
    correctAnswer: CHOICE_IDS[override.correctIndex],
    explanation: override.explanation ?? question.explanation,
    hint: override.hint ?? question.hint,
    skillTags: override.skillTags ?? question.skillTags,
    correctFeedback: override.correctFeedback ?? question.correctFeedback,
    incorrectFeedback: override.incorrectFeedback ?? question.incorrectFeedback,
    metadata: question.metadata
      ? {
          ...question.metadata,
          contentVersion: override.contentVersion,
          skillTags: override.skillTags ?? question.metadata.skillTags,
        }
      : question.metadata,
  };
}

export function applyStagingToQuestions<T extends QuestionWithChoices>(questions: readonly T[]): T[] {
  if (!STAGING_CONTENT_ENABLED) return [...questions];
  return questions.map((q) => applyStagingQuestionOverride(q));
}

export function stagingContentVersionSuffix(): string {
  return STAGING_CONTENT_ENABLED ? 'adaptive_staging_v4_difficulty' : 'adaptive_v2';
}
