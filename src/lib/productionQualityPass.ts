import type { ProductionQualityOverride } from '../data/shared/productionQualityTypes';
import { PRODUCTION_QUALITY_OVERRIDES } from '../data/shared/productionQualityManifest';

const CHOICE_IDS = ['a', 'b', 'c', 'd'] as const;

type QuestionWithChoices = {
  id: string;
  question: string;
  scenarioText?: string;
  options: { id: string; label: string }[];
  correctAnswer?: string;
  correctId?: string;
  whyPrompt?: string;
  metadata?: { difficulty?: string; gradeBand?: string };
};

export function applyProductionQualityPass<T extends QuestionWithChoices>(question: T): T {
  const override = PRODUCTION_QUALITY_OVERRIDES[question.id];
  if (!override) return question;

  let next: T = { ...question };

  if (override.scenarioText) {
    next = { ...next, scenarioText: override.scenarioText };
  }

  if (override.choices) {
    const options = override.choices.map((label, index) => ({
      id: CHOICE_IDS[index],
      label,
    }));
    const correctIndex = override.correctIndex ?? 0;
    const correctId = CHOICE_IDS[correctIndex];
    next = {
      ...next,
      options,
      correctAnswer: correctId,
      correctId,
    };
  }

  if (override.whyPrompt) {
    next = { ...next, whyPrompt: override.whyPrompt };
  }

  return next;
}

export function applyProductionQualityToQuestions<T extends QuestionWithChoices>(questions: readonly T[]): T[] {
  return questions.map((question) => applyProductionQualityPass(question));
}

export function getProductionQualityOverride(questionId: string): ProductionQualityOverride | undefined {
  return PRODUCTION_QUALITY_OVERRIDES[questionId];
}
