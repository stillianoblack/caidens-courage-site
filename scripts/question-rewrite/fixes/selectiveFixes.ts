import type { NormalizedQuestion } from '../../question-audit/types';
import { buildDistractorSet } from '../distractorEngine';
import { applyPositionToChoices } from '../positionBalancer';
import type { StagingQuestionOverride } from '../types';

function padToLength(text: string, target: number): string {
  if (text.length >= target) return text;
  const fillers = [' in this situation', ' for the team', ' right now', ' with the clues given'];
  let result = text;
  let i = 0;
  while (result.length < target && i < fillers.length) {
    result += fillers[i];
    i += 1;
  }
  return result.slice(0, Math.max(target, text.length));
}

export function fixObviousOverride(
  override: StagingQuestionOverride,
  question: NormalizedQuestion,
): StagingQuestionOverride {
  const distractors = buildDistractorSet(question);
  const choices = applyPositionToChoices(
    distractors.best,
    distractors.plausibleIncomplete,
    distractors.plausibleFlawed,
    distractors.obviousWrong,
    override.correctIndex,
  );

  return {
    ...override,
    choices,
    contentVersion: 'adaptive_staging_v3_final',
    rewriteNotes: `${override.rewriteNotes}; v3 genuine obvious-answer fix`,
  };
}

export function fixLengthGiveawayOverride(override: StagingQuestionOverride): StagingQuestionOverride {
  const correctLabel = override.choices[override.correctIndex];
  const lengths = override.choices.map((c) => c.length);
  const target = Math.round(lengths.reduce((a, b) => a + b, 0) / 4);

  const balanced = override.choices.map((label, index) => {
    if (index === override.correctIndex) {
      return label.length > target * 1.4 ? label.slice(0, target).trim() + '…' : label;
    }
    return padToLength(label, target);
  }) as [string, string, string, string];

  return {
    ...override,
    choices: balanced,
    contentVersion: 'adaptive_staging_v3_final',
    rewriteNotes: `${override.rewriteNotes}; v3 length-giveaway fix`,
  };
}
