import type {
  AuditFlag,
  AuditedQuestion,
  AuditReport,
  AuditSummary,
  NormalizedQuestion,
  PositionDistribution,
  RewritePriority,
} from './types';
import { indexToLetter } from './collectQuestions';

const JOKE_DISTRACTOR_PATTERNS: RegExp[] = [
  /\bday of the week\b/i,
  /\bdisappeared\b/i,
  /\bmagic\b/i,
  /\bafraid of\b/i,
  /\bforever\b/i,
  /\bhide (forever|under|behind|the)\b/i,
  /\byell\b/i,
  /\bpunch\b/i,
  /\bscream\b/i,
  /\bswimming pool\b/i,
  /\bcharge (its|his|her) phone\b/i,
  /\bchooses favorites\b/i,
  /\bwater is (afraid|broken)\b/i,
  /\brun away forever\b/i,
  /\bbowl chooses\b/i,
  /\bbecome an orange\b/i,
  /\btable disappeared\b/i,
  /\bscience is over forever\b/i,
  /\bnever pass again\b/i,
  /\bhide tokens in a bush\b/i,
  /\bdrop all tokens\b/i,
  /\bfunniest\b/i,
];

const POSITIVE_SEL_WORDS = /\b(safe|help|calm|trust|team|kind|responsible|breath|plan|ask for help|notice)\b/i;
const NEGATIVE_EXTREME = /\b(never|forever|ignore|hide|yell|punch|blame|quit|broken|afraid|hate)\b/i;

const REASONING_KEYWORDS =
  /\b(why|best|infer|evidence|compare|stronger|most likely|should happen first|hypothesis|variable|plan|order|priorit)\b/i;

const MATH_KEYWORDS =
  /\b(\d+|minute|minutes|hour|\$|token|coin|budget|add|subtract|left|total|how many|how much|percent)\b/i;

const CAIDEN_MATH_MISSIONS = new Set(['quest-3', 'quest-5', 'quest-6', 'quest-7', 'quest-8']);

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function avgWordCount(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length === 0 ? 0 : words.reduce((sum, w) => sum + w.length, 0) / words.length;
}

function hasJokeDistractor(choices: NormalizedQuestion['choices'], correctLabel: string): boolean {
  return choices.some(
    (choice) =>
      choice.label !== correctLabel && JOKE_DISTRACTOR_PATTERNS.some((pattern) => pattern.test(choice.label)),
  );
}

export function isGenuineObviousAnswer(question: NormalizedQuestion): boolean {
  const distractors = question.choices.filter((c) => c.id !== question.correctAnswerId);
  const jokeCount = distractors.filter((d) =>
    JOKE_DISTRACTOR_PATTERNS.some((p) => p.test(d.label)),
  ).length;
  if (jokeCount >= 2) return true;

  const positiveCorrect = POSITIVE_SEL_WORDS.test(question.correctAnswerLabel);
  const negativeDistractors = distractors.filter((d) => NEGATIVE_EXTREME.test(d.label)).length;
  if (positiveCorrect && negativeDistractors >= 2 && distractors.length >= 3) return true;

  return false;
}

export function isLengthGiveaway(question: NormalizedQuestion): boolean {
  if (!isLengthImbalanced(question)) return false;
  const lengths = question.choices.map((c) => c.label.length);
  const correctLen = question.correctAnswerLabel.length;
  const maxLen = Math.max(...lengths);
  if (correctLen !== maxLen) return false;
  const distractors = question.choices.filter((c) => c.id !== question.correctAnswerId);
  const otherAvg = distractors.reduce((s, d) => s + d.label.length, 0) / Math.max(distractors.length, 1);
  return correctLen > otherAvg * 1.8;
}

function isCorrectTooObvious(question: NormalizedQuestion): boolean {
  if (isGenuineObviousAnswer(question)) return true;

  const distractors = question.choices.filter((c) => c.id !== question.correctAnswerId);
  const lengths = question.choices.map((c) => c.label.length);
  const correctLen = question.correctAnswerLabel.length;
  const otherAvg = distractors.reduce((s, d) => s + d.label.length, 0) / Math.max(distractors.length, 1);
  if (correctLen > otherAvg * 1.8 && otherAvg < 25) return true;

  return false;
}

function isLengthImbalanced(question: NormalizedQuestion): boolean {
  const lengths = question.choices.map((c) => c.label.length);
  const max = Math.max(...lengths);
  const min = Math.min(...lengths);
  if (min === 0) return false;
  return max / min >= 2.4;
}

function isReadingLevelLow(question: NormalizedQuestion): boolean {
  const band = question.gradeBand;
  const scenarioWords = wordCount(question.scenarioText);
  const choiceAvg = question.choices.reduce((sum, c) => sum + avgWordCount(c.label), 0) / question.choices.length;

  if ((band === '4-5' || band === '6-8') && choiceAvg < 4.2 && scenarioWords < 40) return true;
  if (band === '6-8' && choiceAvg < 5 && scenarioWords < 42 && !MATH_KEYWORDS.test(question.questionText + question.scenarioText)) {
    return true;
  }
  return false;
}

function isGuessableWithoutScenario(question: NormalizedQuestion): boolean {
  if (question.scenarioText.trim().length > 80) return false;
  const genericDistractors = question.choices.filter((c) =>
    /^(yes|no|maybe|nothing|everything|always|never)$/i.test(c.label.trim()),
  );
  if (genericDistractors.length >= 2) return true;

  if (question.scenarioText.trim().length < 25 && REASONING_KEYWORDS.test(question.questionText)) {
    return true;
  }

  const scenarioTokens = new Set(
    question.scenarioText.toLowerCase().split(/\W+/).filter((t) => t.length > 4),
  );
  const correctTokens = question.correctAnswerLabel.toLowerCase().split(/\W+/).filter((t) => t.length > 4);
  const overlap = correctTokens.filter((t) => scenarioTokens.has(t)).length;
  const distractorOverlap = question.choices
    .filter((c) => c.id !== question.correctAnswerId)
    .every((d) => {
      const tokens = d.label.toLowerCase().split(/\W+/).filter((t) => t.length > 4);
      return tokens.filter((t) => scenarioTokens.has(t)).length === 0;
    });

  return overlap >= 2 && distractorOverlap && question.scenarioText.length > 30;
}

function lacksScenarioEvidence(question: NormalizedQuestion): boolean {
  const needsEvidence = /which detail|most important evidence|best hypothesis|infer|why|compare|stronger/i.test(
    question.questionText,
  );
  return needsEvidence && wordCount(question.scenarioText) < 35;
}

function lacksReasoningSkill(question: NormalizedQuestion): boolean {
  const combined = `${question.questionText} ${question.scenarioText}`;
  const hasReasoningCue = REASONING_KEYWORDS.test(combined);
  const isPureRecall = /^(what was|what is missing|who is|where is)/i.test(question.questionText.trim());

  if (question.gradeBand === 'K-1' || question.gradeBand === '2-3') {
    return false;
  }

  if (isPureRecall && question.gradeBand === '6-8') return true;
  if (!hasReasoningCue && !MATH_KEYWORDS.test(combined) && question.questionType === 'multiple_choice') {
    return question.gradeBand === '4-5' || question.gradeBand === '6-8';
  }
  return false;
}

function caidenNeedsMath(question: NormalizedQuestion): boolean {
  if (question.character !== 'caiden') return false;
  if (CAIDEN_MATH_MISSIONS.has(question.missionId)) return false;
  const combined = `${question.questionText} ${question.scenarioText}`;
  if (MATH_KEYWORDS.test(combined)) return false;
  if (['sequencing', 'sel_decision'].includes(question.questionType) && question.gradeBand !== 'K-1') {
    return true;
  }
  return false;
}

function buildImprovedDistractors(question: NormalizedQuestion): string[] {
  const correct = question.correctAnswerLabel;
  const templates: Record<string, string[]> = {
    math: [
      'Estimate quickly without adding the numbers',
      'Choose the option that ignores the time limit',
      'Pick the choice that skips checking totals',
    ],
    inference: [
      'Focus on what happened after the main event',
      'Choose the action someone took rather than physical evidence',
      'Select a true detail that is less relevant to the problem',
    ],
    sel_decision: [
      'Wait and hope the feeling passes on its own',
      'Do the easiest part first without a plan',
      'Ask for help only after trying one small step',
    ],
    science_reasoning: [
      'Change the amount of water in the bowl',
      'Test a different fruit size at the same time',
      'Keep the peel but change the water temperature',
    ],
    default: [
      'Choose a reasonable step that does not match the scenario best',
      'Pick a strategy that helps a little but misses the main goal',
      'Select an option that delays the decision',
    ],
  };

  const pool = templates[question.questionType] ?? templates.default;
  return pool.filter((item) => item !== correct).slice(0, 3);
}

function buildRecommendedRewrite(question: NormalizedQuestion, flags: AuditFlag[]): string {
  if (flags.length === 0) {
    return 'Question meets baseline quality checks. Optional polish: vary correct-answer position in future edits.';
  }

  const parts: string[] = [];
  if (flags.includes('joke_or_impossible_distractor')) {
    parts.push('Replace joke/impossible distractors with one obvious-but-not-silly wrong answer and two plausible weaker strategies.');
  }
  if (flags.includes('correct_answer_too_obvious')) {
    parts.push('Make two distractors realistic alternatives; avoid making the correct answer the only positive option.');
  }
  if (flags.includes('insufficient_scenario_evidence')) {
    parts.push('Add one more concrete clue to the scenario so inference requires reading, not guessing.');
  }
  if (flags.includes('caiden_needs_more_math_focus')) {
    parts.push('Add numbers (minutes, tokens, quantities) and ask for comparison, estimation, or ordering.');
  }
  if (flags.includes('lacks_reasoning_skill')) {
    parts.push('Rephrase to require comparison, prioritization, or best-choice reasoning.');
  }
  if (flags.includes('answer_length_imbalance')) {
    parts.push('Balance option length so the correct answer is not the only long/detailed choice.');
  }
  if (flags.includes('reading_level_below_band')) {
    parts.push('Increase vocabulary and sentence complexity to match the grade band.');
  }
  return parts.join(' ');
}

function buildCognitiveNotes(question: NormalizedQuestion, flags: AuditFlag[]): string[] {
  const notes: string[] = [];
  if (question.questionType === 'math' || MATH_KEYWORDS.test(question.questionText)) {
    notes.push('Uses quantitative reasoning');
  }
  if (/infer|evidence|why|best/i.test(question.questionText)) {
    notes.push('Benefits from inference');
  }
  if (/first|order|sequence|plan/i.test(question.questionText)) {
    notes.push('Benefits from sequencing or planning');
  }
  if (/feel|calm|friend|team/i.test(question.questionText + question.scenarioText)) {
    notes.push('SEL / emotional reasoning');
  }
  if (flags.includes('caiden_needs_more_math_focus')) {
    notes.push('Recommend adding time management, budgeting, or quantity comparison for Caiden');
  }
  if (notes.length === 0) {
    notes.push('Consider adding multi-step thinking or scenario-specific evidence');
  }
  return notes;
}

function scoreDifficulty(question: NormalizedQuestion, flags: AuditFlag[]): { score: number; reason: string } {
  let score = 3;
  const reasons: string[] = [];

  if (flags.includes('joke_or_impossible_distractor')) {
    score -= 1.5;
    reasons.push('joke distractors reduce challenge');
  }
  if (flags.includes('correct_answer_too_obvious')) {
    score -= 1;
    reasons.push('correct answer stands out too easily');
  }
  if (flags.includes('guessable_without_scenario')) {
    score -= 0.75;
    reasons.push('guessable without reading scenario');
  }
  if (flags.includes('insufficient_scenario_evidence')) {
    score -= 0.5;
    reasons.push('thin scenario for inference');
  }
  if (flags.includes('lacks_reasoning_skill')) {
    score -= 0.75;
    reasons.push('limited reasoning demand for band');
  }
  if (flags.includes('too_easy_for_grade_4_plus')) {
    score -= 1;
    reasons.push('too easy for grades 4+');
  }

  if (question.questionType === 'math' && question.gradeBand !== 'K-1') {
    score += 0.5;
    reasons.push('includes math thinking');
  }
  if (question.questionType === 'inference' && question.gradeBand === '6-8') {
    score += 0.25;
    reasons.push('inference at upper band');
  }
  if (flags.length === 0 && (question.gradeBand === '4-5' || question.gradeBand === '6-8')) {
    score += 0.5;
    reasons.push('clean baseline for band');
  }
  if (question.gradeBand === 'K-1' && flags.length <= 1) {
    score = Math.max(score, 2.5);
    reasons.push('appropriate simplicity for K-1');
  }

  const combined = `${question.questionText} ${question.scenarioText}`;
  const scenarioWords = wordCount(question.scenarioText);
  const band = question.gradeBand;

  if (
    /\b(compare|tradeoff|evidence|which two|best plan|priorit|variable|hypothesis|infer)\b/i.test(combined) &&
    scenarioWords >= 45
  ) {
    score += 0.5;
    reasons.push('requires scenario-based reasoning');
  }

  if (flags.length <= 1) {
    if (question.character === 'caiden' && (band === '4-5' || band === '6-8') && MATH_KEYWORDS.test(combined)) {
      score += 0.95;
      reasons.push('Caiden multi-step math/planning');
    } else if (question.character === 'caiden' && band === '2-3' && MATH_KEYWORDS.test(combined)) {
      score += 0.75;
      reasons.push('Caiden time/quantity reasoning');
    } else if (question.character === 'caiden' && band === 'K-1' && MATH_KEYWORDS.test(combined)) {
      score += 0.55;
      reasons.push('Caiden early math/planning');
    }
    if (
      question.character === 'miranda' &&
      band !== 'K-1' &&
      /according to the passage|which clue|evidence|passage/i.test(question.questionText)
    ) {
      score += 0.65;
      reasons.push('Miranda evidence-based reading');
    }
    if (question.character === 'zeke' && band !== 'K-1' && scenarioWords >= 35) {
      score += band === '6-8' ? 0.7 : band === '4-5' ? 0.55 : 0.5;
      reasons.push('Zeke teamwork tradeoff reasoning');
    } else if (question.character === 'zeke' && band === 'K-1' && scenarioWords >= 25) {
      score += 0.55;
      reasons.push('Zeke early teamwork reasoning');
    }
    if (question.character === 'charlie' && band !== 'K-1' && scenarioWords >= 35) {
      score += band === '6-8' ? 0.52 : band === '4-5' ? 0.45 : 0.4;
      reasons.push('Charlie science reasoning');
    }
    if (question.character === 'b4' && band !== 'K-1' && scenarioWords >= 35) {
      score += band === '6-8' ? 0.5 : band === '4-5' ? 0.45 : 0.4;
      reasons.push('B-4 regulation comparison');
    }
  }

  if (band === 'K-1') {
    score = Math.min(score, 3.5);
  }

  const rounded = Math.min(5, Math.max(1, Math.round(score)));
  return {
    score: rounded,
    reason: reasons.length > 0 ? reasons.join('; ') : 'Balanced difficulty for grade band',
  };
}

function resolvePriority(difficultyScore: number, flags: AuditFlag[]): RewritePriority {
  const majorFlags = flags.filter((f) =>
    ['joke_or_impossible_distractor', 'correct_answer_too_obvious', 'too_easy_for_grade_4_plus'].includes(f),
  );
  if (difficultyScore <= 2 || flags.length >= 2 || majorFlags.length >= 1) return 'high';
  if (difficultyScore === 3 && flags.length === 1) return 'medium';
  return 'low';
}

function auditQuestion(question: NormalizedQuestion): AuditedQuestion {
  const flags: AuditFlag[] = [];

  if (isCorrectTooObvious(question)) flags.push('correct_answer_too_obvious');
  if (hasJokeDistractor(question.choices, question.correctAnswerLabel)) {
    flags.push('joke_or_impossible_distractor');
  }
  if (isReadingLevelLow(question)) flags.push('reading_level_below_band');
  if (isGuessableWithoutScenario(question)) flags.push('guessable_without_scenario');
  if (isLengthImbalanced(question)) flags.push('answer_length_imbalance');
  if (
    (question.gradeBand === '4-5' || question.gradeBand === '6-8') &&
    (flags.includes('correct_answer_too_obvious') || flags.includes('joke_or_impossible_distractor'))
  ) {
    flags.push('too_easy_for_grade_4_plus');
  }
  if (lacksScenarioEvidence(question)) flags.push('insufficient_scenario_evidence');
  if (lacksReasoningSkill(question)) flags.push('lacks_reasoning_skill');
  if (caidenNeedsMath(question)) flags.push('caiden_needs_more_math_focus');

  const { score, reason } = scoreDifficulty(question, flags);
  const improvedDistractors = buildImprovedDistractors(question);

  return {
    ...question,
    flags: [...new Set(flags)],
    difficultyScore: score,
    difficultyReason: reason,
    recommendedRewrite: buildRecommendedRewrite(question, flags),
    improvedDistractors,
    suggestedCorrectAnswer: question.correctAnswerLabel,
    cognitiveNotes: buildCognitiveNotes(question, flags),
    rewritePriority: resolvePriority(score, flags),
  };
}

function buildPositionDistribution(questions: AuditedQuestion[]): PositionDistribution {
  const counts = { A: 0, B: 0, C: 0, D: 0, total: questions.length, uneven: false, dominantPosition: null as string | null };
  for (const q of questions) {
    const letter = indexToLetter(q.correctIndex) as 'A' | 'B' | 'C' | 'D';
    if (letter in counts) counts[letter] += 1;
  }
  const entries = (['A', 'B', 'C', 'D'] as const).map((k) => ({ k, v: counts[k] }));
  entries.sort((a, b) => b.v - a.v);
  const top = entries[0];
  const second = entries[1];
  if (counts.total >= 4 && top.v >= counts.total * 0.45 && top.v - second.v >= 2) {
    counts.uneven = true;
    counts.dominantPosition = top.k;
  }
  return counts;
}

export function auditAllQuestions(questions: NormalizedQuestion[]): AuditReport {
  const audited = questions.map(auditQuestion);

  const flagCounts = {} as Record<AuditFlag, number>;
  for (const q of audited) {
    for (const flag of q.flags) {
      flagCounts[flag] = (flagCounts[flag] ?? 0) + 1;
    }
  }

  const averageDifficultyByCharacter: Record<string, number> = {};
  const positionDistributionByCharacter: Record<string, PositionDistribution> = {};
  const positionDistributionByMission: Record<string, PositionDistribution> = {};

  const characters = [...new Set(audited.map((q) => q.character))];
  for (const character of characters) {
    const subset = audited.filter((q) => q.character === character);
    averageDifficultyByCharacter[character] =
      subset.reduce((s, q) => s + q.difficultyScore, 0) / Math.max(subset.length, 1);
    positionDistributionByCharacter[character] = buildPositionDistribution(subset);
  }

  const missionKeys = [...new Set(audited.map((q) => `${q.character}::${q.missionId}`))];
  for (const key of missionKeys) {
    const subset = audited.filter((q) => `${q.character}::${q.missionId}` === key);
    positionDistributionByMission[key] = buildPositionDistribution(subset);
  }

  const topRewriteCandidates = [...audited]
    .sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const pw = priorityWeight[b.rewritePriority] - priorityWeight[a.rewritePriority];
      if (pw !== 0) return pw;
      return a.difficultyScore - b.difficultyScore;
    })
    .slice(0, 10);

  const rewritePriorityCounts = { high: 0, medium: 0, low: 0 };
  for (const q of audited) {
    rewritePriorityCounts[q.rewritePriority] += 1;
  }

  const summary: AuditSummary = {
    generatedAt: new Date().toISOString(),
    totalQuestions: audited.length,
    averageDifficultyByCharacter,
    flagCounts,
    positionDistributionByCharacter,
    positionDistributionByMission,
    topRewriteCandidates,
    rewritePriorityCounts,
  };

  return { summary, questions: audited };
}

export { buildPositionDistribution };
