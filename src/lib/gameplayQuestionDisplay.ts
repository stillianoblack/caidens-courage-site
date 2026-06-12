import type { GameQuestion } from '../types/gameAssessment';

const PROMPT_START_PATTERN =
  /\b(What should|Which|Where should|How should|When should|Who should|Why should|What is|What are|What would|What could|What happens|What needs|What must|What do|What does|What did|What can|How can|How do|How does|Where is|Where are|Who is|Who are)\b/i;

/** Scenario/setup copy for the top mission card only. */
export function resolveGameplayScenarioText(question: GameQuestion): string {
  const clueText =
    question.clueCard && 'text' in question.clueCard ? question.clueCard.text?.trim() : '';
  return (clueText || question.story?.trim() || '').trim();
}

function splitScenarioFromCombinedPrompt(text: string): { scenarioText: string; promptText: string } {
  const trimmed = text.trim();
  const match = trimmed.match(PROMPT_START_PATTERN);
  if (!match || match.index === undefined || match.index === 0) {
    return { scenarioText: '', promptText: trimmed };
  }

  const scenarioText = trimmed.slice(0, match.index).trim().replace(/\.\s*$/, '');
  const promptText = trimmed.slice(match.index).trim();
  return {
    scenarioText,
    promptText: promptText || trimmed,
  };
}

/** Question prompt for the main question area — never repeats scenario card copy. */
export function resolveGameplayQuestionPrompt(question: GameQuestion): string {
  const rawPrompt = (question.question ?? question.prompt ?? '').trim();
  if (!rawPrompt) return '';

  const scenario = resolveGameplayScenarioText(question);
  if (!scenario) {
    return rawPrompt;
  }

  const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();
  const normalizedScenario = normalize(scenario);
  const normalizedPrompt = normalize(rawPrompt);

  if (normalizedPrompt === normalizedScenario) {
    const split = splitScenarioFromCombinedPrompt(rawPrompt);
    return split.promptText || rawPrompt;
  }

  if (normalizedPrompt.startsWith(normalizedScenario)) {
    const remainder = normalizedPrompt
      .slice(normalizedScenario.length)
      .replace(/^[\s.:;—–-]+/, '')
      .trim();
    if (remainder) return remainder;
  }

  return rawPrompt;
}
