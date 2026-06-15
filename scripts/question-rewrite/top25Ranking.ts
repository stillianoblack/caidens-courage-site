import type { AuditedQuestion, NormalizedQuestion } from '../question-audit/types';
import { isGenuineObviousAnswer, isLengthGiveaway } from '../question-audit/auditHeuristics';
import { indexToLetter } from '../question-audit/collectQuestions';

const REASONING_KEYWORDS =
  /\b(why|best|infer|evidence|compare|stronger|most likely|hypothesis|variable|plan|order|priorit|tradeoff|which two)\b/i;

const MATH_KEYWORDS =
  /\b(\d+|minute|minutes|hour|\$|token|coin|budget|add|subtract|left|total|how many|how much|percent)\b/i;

export type RankedQuestion = {
  question: AuditedQuestion;
  weaknessScore: number;
  strengthScore: number;
  weaknessReasons: string[];
  strengthReasons: string[];
  recommendedReplacement: string;
};

function hasWeakDistractors(q: AuditedQuestion): boolean {
  return (
    q.flags.includes('joke_or_impossible_distractor') ||
    q.flags.includes('correct_answer_too_obvious') ||
    q.improvedDistractors.length > 0
  );
}

function isLowReasoning(q: AuditedQuestion): boolean {
  if (q.flags.includes('lacks_reasoning_skill')) return true;
  const combined = `${q.questionText} ${q.scenarioText}`;
  if ((q.gradeBand === '4-5' || q.gradeBand === '6-8') && !REASONING_KEYWORDS.test(combined) && !MATH_KEYWORDS.test(combined)) {
    return true;
  }
  return false;
}

function buildWhyWeak(q: AuditedQuestion, normalized: NormalizedQuestion): string[] {
  const reasons: string[] = [];

  if (q.difficultyScore <= 2) reasons.push(`Very low difficulty score (${q.difficultyScore}/5)`);
  else if (q.difficultyScore === 3) reasons.push(`Below-target difficulty (${q.difficultyScore}/5)`);

  if (q.flags.includes('correct_answer_too_obvious') || isGenuineObviousAnswer(normalized)) {
    reasons.push('Correct answer may stand out versus distractors');
  }
  if (isLengthGiveaway(normalized)) {
    reasons.push('Correct answer length may give away the choice');
  }
  if (q.flags.includes('joke_or_impossible_distractor')) {
    reasons.push('Contains joke or unrealistic distractor');
  }
  if (hasWeakDistractors(q) && !q.flags.includes('joke_or_impossible_distractor')) {
    reasons.push('Distractors may be too weak or uneven');
  }
  if (isLowReasoning(q)) {
    reasons.push('Limited reasoning requirement for grade band');
  }
  if (q.flags.includes('guessable_without_scenario')) {
    reasons.push('May be answerable without reading the scenario');
  }
  if (q.flags.includes('insufficient_scenario_evidence')) {
    reasons.push('Scenario may not provide enough evidence');
  }
  if (q.flags.includes('too_easy_for_grade_4_plus')) {
    reasons.push('Too easy for grades 4+');
  }
  if (q.flags.includes('caiden_needs_more_math_focus')) {
    reasons.push('Missing math/time/planning focus for Caiden');
  }
  if (reasons.length === 0) {
    reasons.push(`Relative outlier at difficulty ${q.difficultyScore}/5 within staging v4 set`);
  }

  return reasons;
}

function buildWhyStrong(q: AuditedQuestion): string[] {
  const reasons: string[] = [];
  if (q.difficultyScore >= 5) reasons.push('Maximum difficulty score (5/5)');
  else if (q.difficultyScore >= 4) reasons.push(`Strong difficulty score (${q.difficultyScore}/5)`);

  if (q.flags.length === 0) reasons.push('No quality flags detected');
  if (REASONING_KEYWORDS.test(`${q.questionText} ${q.scenarioText}`)) {
    reasons.push('Requires inference, comparison, or planning');
  }
  if (MATH_KEYWORDS.test(`${q.questionText} ${q.scenarioText}`)) {
    reasons.push('Uses quantitative or time-based reasoning');
  }
  if (q.scenarioText.trim().split(/\s+/).length >= 50) {
    reasons.push('Rich scenario with scenario-dependent answers');
  }
  if (q.character === 'caiden' && MATH_KEYWORDS.test(`${q.questionText} ${q.scenarioText}`)) {
    reasons.push('Caiden executive-function / math focus');
  }
  if (q.character === 'miranda' && /passage|evidence|clue/i.test(q.questionText)) {
    reasons.push('Evidence-based reading comprehension');
  }
  return reasons;
}

function buildRecommendedReplacement(q: AuditedQuestion): string {
  const parts: string[] = [];

  if (q.recommendedRewrite && !q.recommendedRewrite.includes('baseline quality')) {
    parts.push(q.recommendedRewrite);
  }

  if (q.improvedDistractors.length > 0) {
    parts.push(`Suggested distractors: ${q.improvedDistractors.join(' | ')}`);
  }

  if (q.character === 'caiden' && (q.gradeBand === '4-5' || q.gradeBand === '6-8')) {
    parts.push(
      'Add a multi-step scenario with minutes, costs, or task order; ask which plan fits all constraints.',
    );
  } else if (q.character === 'miranda') {
    parts.push('Expand passage with two concrete clues; ask which evidence best supports the conclusion.');
  } else if (q.character === 'zeke') {
    parts.push('Present two emotionally plausible team options; ask which tradeoff helps the group most.');
  } else if (q.character === 'charlie') {
    parts.push('Add a fair test setup; ask which variable to change while holding others constant.');
  } else if (q.character === 'b4') {
    parts.push('Compare two regulation strategies after naming the feeling; avoid obvious wrong answers.');
  }

  return parts.join(' ');
}

export function computeWeaknessScore(q: AuditedQuestion, normalized: NormalizedQuestion): number {
  let score = (5 - q.difficultyScore) * 22;

  if (q.flags.includes('correct_answer_too_obvious')) score += 28;
  if (isGenuineObviousAnswer(normalized)) score += 12;
  if (isLengthGiveaway(normalized)) score += 8;
  if (q.flags.includes('joke_or_impossible_distractor')) score += 24;
  if (q.flags.includes('guessable_without_scenario')) score += 20;
  if (q.flags.includes('lacks_reasoning_skill') || isLowReasoning(q)) score += 16;
  if (q.flags.includes('too_easy_for_grade_4_plus')) score += 14;
  if (q.flags.includes('insufficient_scenario_evidence')) score += 12;
  if (q.flags.includes('caiden_needs_more_math_focus')) score += 10;
  if (q.flags.includes('answer_length_imbalance')) score += 6;

  return score;
}

export function computeStrengthScore(q: AuditedQuestion): number {
  let score = q.difficultyScore * 22;
  score += Math.max(0, 30 - q.flags.length * 8);
  if (REASONING_KEYWORDS.test(`${q.questionText} ${q.scenarioText}`)) score += 10;
  if (MATH_KEYWORDS.test(`${q.questionText} ${q.scenarioText}`)) score += 8;
  if (q.scenarioText.trim().split(/\s+/).length >= 55) score += 8;
  if (q.rewritePriority === 'low') score += 6;
  return score;
}

export function rankWeakest(questions: AuditedQuestion[]): RankedQuestion[] {
  return [...questions]
    .map((question) => {
      const weaknessScore = computeWeaknessScore(question, question);
      return {
        question,
        weaknessScore,
        strengthScore: computeStrengthScore(question),
        weaknessReasons: buildWhyWeak(question, question),
        strengthReasons: buildWhyStrong(question),
        recommendedReplacement: buildRecommendedReplacement(question),
      };
    })
    .sort((a, b) => {
      if (b.weaknessScore !== a.weaknessScore) return b.weaknessScore - a.weaknessScore;
      return a.question.difficultyScore - b.question.difficultyScore;
    });
}

export function rankStrongest(questions: AuditedQuestion[]): RankedQuestion[] {
  return [...questions]
    .map((question) => ({
      question,
      weaknessScore: computeWeaknessScore(question, question),
      strengthScore: computeStrengthScore(question),
      weaknessReasons: buildWhyWeak(question, question),
      strengthReasons: buildWhyStrong(question),
      recommendedReplacement: buildRecommendedReplacement(question),
    }))
    .sort((a, b) => {
      if (b.strengthScore !== a.strengthScore) return b.strengthScore - a.strengthScore;
      return b.question.difficultyScore - a.question.difficultyScore;
    });
}

export function formatChoices(q: AuditedQuestion): string {
  return q.choices
    .map((c, i) => `${indexToLetter(i)}. ${c.label}${c.id === q.correctAnswerId ? ' ✓' : ''}`)
    .join('\n');
}
