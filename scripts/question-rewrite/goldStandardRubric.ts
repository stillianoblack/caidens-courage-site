import type { AuditedQuestion } from '../question-audit/types';
import { indexToLetter } from '../question-audit/collectQuestions';

const REASONING_KEYWORDS =
  /\b(why|best|infer|evidence|compare|stronger|most likely|hypothesis|variable|plan|order|priorit|tradeoff|which two)\b/i;

const MATH_KEYWORDS =
  /\b(\d+|minute|minutes|hour|\$|token|coin|budget|add|subtract|left|total|how many|how much|percent)\b/i;

export type GoldPatternStats = {
  count: number;
  avgScenarioWords: number;
  avgQuestionWords: number;
  avgChoiceLength: number;
  choiceLengthSpread: number;
  zeroFlagsPct: number;
  characterBreakdown: Record<string, number>;
  gradeBandBreakdown: Record<string, number>;
  reasoningTypeBreakdown: Record<string, number>;
  comparisonStemPct: number;
  mathScenarioPct: number;
  positionDistribution: { A: number; B: number; C: number; D: number };
  commonStemPatterns: string[];
  commonDistractorPatterns: string[];
};

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function analyzeGoldPatterns(questions: AuditedQuestion[]): GoldPatternStats {
  const choiceLengths: number[] = [];
  let scenSum = 0;
  let qSum = 0;
  const chars: Record<string, number> = {};
  const bands: Record<string, number> = {};
  const types: Record<string, number> = {};
  const pos = { A: 0, B: 0, C: 0, D: 0 };
  let comparisonStems = 0;
  let mathScenarios = 0;
  const distractorSnippets: Record<string, number> = {};

  for (const q of questions) {
    chars[q.character] = (chars[q.character] ?? 0) + 1;
    bands[q.gradeBand] = (bands[q.gradeBand] ?? 0) + 1;
    types[q.questionType] = (types[q.questionType] ?? 0) + 1;
    scenSum += wordCount(q.scenarioText);
    qSum += wordCount(q.questionText);
    const lengths = q.choices.map((c) => c.label.length);
    choiceLengths.push(lengths.reduce((a, b) => a + b, 0) / 4);
    const letter = indexToLetter(q.correctIndex) as keyof typeof pos;
    pos[letter] += 1;
    if (/compare|which two|best|evidence|tradeoff|plan/i.test(q.questionText)) comparisonStems += 1;
    if (MATH_KEYWORDS.test(`${q.questionText} ${q.scenarioText}`)) mathScenarios += 1;
    for (const c of q.choices) {
      if (c.id !== q.correctAnswerId) {
        const key = c.label.slice(0, 35);
        distractorSnippets[key] = (distractorSnippets[key] ?? 0) + 1;
      }
    }
  }

  const n = questions.length || 1;
  const avgChoice = choiceLengths.reduce((a, b) => a + b, 0) / n;
  const spread =
    choiceLengths.reduce((s, avg) => s + Math.abs(avg - avgChoice), 0) / n;

  return {
    count: questions.length,
    avgScenarioWords: scenSum / n,
    avgQuestionWords: qSum / n,
    avgChoiceLength: avgChoice,
    choiceLengthSpread: spread,
    zeroFlagsPct: (questions.filter((q) => q.flags.length === 0).length / n) * 100,
    characterBreakdown: chars,
    gradeBandBreakdown: bands,
    reasoningTypeBreakdown: types,
    comparisonStemPct: (comparisonStems / n) * 100,
    mathScenarioPct: (mathScenarios / n) * 100,
    positionDistribution: pos,
    commonStemPatterns: [
      'Which two strategies compare well for this moment?',
      'Which coping step fits best after naming the feeling?',
      'What should [character] check first before acting?',
      'According to the passage, which answer is best supported?',
      'Which plan uses the time and constraints in the scenario?',
    ],
    commonDistractorPatterns: [
      'Plausible incomplete: a reasonable step that skips a key part of the scenario',
      'Plausible flawed: a strategy that helps a little but ignores an important clue',
      'Clearly wrong but realistic: an option that does not fit the scenario',
    ],
  };
}

export type RubricTier = {
  score: number;
  title: string;
  summary: string;
  criteria: string[];
};

export function buildGoldRubric(stats: GoldPatternStats): {
  tiers: RubricTier[];
  antiPatterns: string[];
  distractorGuidelines: string[];
  gradeBandGuidelines: Record<string, string[]>;
  characterGuidelines: Record<string, string[]>;
  goldPatterns: GoldPatternStats;
} {
  const tiers: RubricTier[] = [
    {
      score: 5,
      title: 'Gold standard (5/5)',
      summary: 'Requires reading the scenario; strong reasoning; no quality flags.',
      criteria: [
        `Scenario typically ${Math.round(stats.avgScenarioWords)}+ words with concrete situational details`,
        'Question stem uses comparison, evidence, planning, or best-choice reasoning',
        'Zero audit flags (no obvious answer, joke distractors, or guessable-without-scenario)',
        'Four choices follow: best / plausible-incomplete / plausible-flawed / realistic-wrong',
        `Choice labels balanced (~${Math.round(stats.avgChoiceLength)} characters average, low spread)`,
        'Correct answer position varies (not predictable by length or slot pattern)',
        'Answers cannot be solved from common sense alone — scenario carries necessary clues',
        'Warm SEL tone; kid-safe language',
      ],
    },
    {
      score: 4,
      title: 'Strong (4/5)',
      summary: 'Solid grade-band rigor with at most one minor quality note.',
      criteria: [
        'Scenario provides enough context for the grade band (40+ words for 2–3; 55+ for 4–8)',
        'Requires at least one cognitive step: inference, comparison, sequencing, or calculation',
        'Distractors are plausible; no joke or throwaway options',
        'Correct answer is not dramatically longer than other options',
        'May have one non-critical flag (e.g. reading-level heuristic) without harming fairness',
        'Character skill focus is clear (math/planning, evidence, science, teamwork, or SEL)',
      ],
    },
    {
      score: 3,
      title: 'Adequate / band floor (3/5)',
      summary: 'Acceptable for younger bands or as a relative outlier; not gold standard.',
      criteria: [
        'K–1: simple recognition, cause/effect, or matching — difficulty capped for age',
        'May rely more on recall than multi-step reasoning',
        'Scenario may be shorter but still present',
        'Upper bands (4–8) at 3/5 need review — likely missing reasoning depth or have quality flags',
        'Not publish-blocking for K–1 if tone and safety are intact',
      ],
    },
  ];

  const antiPatterns = [
    'Joke or cartoonishly wrong distractors (“the day of the week,” “water is broken”)',
    'Correct answer is the only long or detailed option',
    'Correct answer is the only positive SEL option while distractors are extreme negatives',
    'Question solvable without reading the scenario',
    'All correct answers in position A (or any single slot)',
    'Upper-grade questions that are pure recall with no inference or comparison',
    'Miranda questions guessable without rereading the passage',
    'Caiden upper-band questions without time, quantity, budgeting, or planning logic',
    'Zeke questions with selfish “obvious wrong” options instead of plausible tradeoffs',
    'Charlie questions that change two variables at once without science framing',
    'Duplicate scenario framing text appended multiple times',
    'Truncated choice labels (“…”) that reduce readability',
  ];

  const distractorGuidelines = [
    'Use exactly four choices: 1 best, 1 plausible-incomplete, 1 plausible-flawed, 1 clearly-wrong-but-realistic',
    'Keep choice lengths within ~25% of each other when possible',
    'Avoid joke answers unless the scenario genuinely makes them plausible',
    'Make two distractors emotionally or logically plausible for SEL/teamwork questions',
    'Embed scenario-specific language in at least two options so reading is required',
    'Rotate correct answer position across A/B/C/D within each mission',
  ];

  const gradeBandGuidelines: Record<string, string[]> = {
    'K-1': [
      'Short scenarios (28–45 words); concrete actions and feelings',
      'Recognition, matching, simple cause/effect',
      'Difficulty ceiling ~3/5 by design — not compared to 4–8 gold bar',
    ],
    '2-3': [
      'Scenarios 40–55 words; one clear decision point',
      'Simple sequencing, basic inference, introductory math/counting for Caiden',
      'Target 4/5 where possible',
    ],
    '4-5': [
      'Scenarios 55–75 words; compare or plan',
      'Inference, comparison, evidence from scenario, light multi-step math',
      'Gold bar: 4–5/5',
    ],
    '6-8': [
      'Scenarios 60–90 words; tradeoffs and evidence evaluation',
      'Multi-step reasoning, variable thinking, prioritization under constraints',
      'Gold bar: 4–5/5; 3/5 requires manual review',
    ],
  };

  const characterGuidelines: Record<string, string[]> = {
    caiden: [
      'Hardest path: multi-step time, budgeting, sequencing, executive function',
      'Include numbers (minutes, tokens, costs) in 4–5 and 6–8 scenarios',
      'Ask which plan fits all constraints, not single-step recall',
      'Gold examples: 4–5/6–8 math-planning items at difficulty 4–5',
    ],
    miranda: [
      'Passage-based; answers require rereading evidence',
      'Stems: “According to the passage…”, “Which clue best supports…?”',
      'Distractors: related but weaker evidence, off-topic true facts',
    ],
    zeke: [
      'Team tradeoffs; two emotionally plausible options',
      'Leadership and communication under group constraints',
      'Avoid cartoon selfish wrong answers; use realistic group mistakes',
    ],
    charlie: [
      'Science reasoning: variables, fair tests, predictions, evidence',
      'Change one thing at a time; observation before conclusion',
      'Avoid silly science distractors',
    ],
    b4: [
      'Emotional regulation: body signals → name feeling → compare coping strategies',
      'Gold top-25 pattern: “Which two strategies compare well for this moment?”',
      'Close distractors: regulation steps applied at the wrong time or incompletely',
    ],
  };

  return {
    tiers,
    antiPatterns,
    distractorGuidelines,
    gradeBandGuidelines,
    characterGuidelines,
    goldPatterns: stats,
  };
}

export function classifyBelowFour(q: AuditedQuestion): {
  belowThreshold: boolean;
  rubricGap: string[];
  k1Expected: boolean;
} {
  const gaps: string[] = [];
  const k1Expected = q.gradeBand === 'K-1' && q.difficultyScore === 3;

  if (q.difficultyScore >= 4) {
    return { belowThreshold: false, rubricGap: [], k1Expected: false };
  }

  if (q.difficultyScore <= 2) gaps.push('Score at or below 2 — critical review');
  if (q.flags.includes('lacks_reasoning_skill')) gaps.push('Missing reasoning depth for grade band');
  if (q.flags.includes('correct_answer_too_obvious')) gaps.push('Correct answer too obvious');
  if (q.flags.includes('guessable_without_scenario')) gaps.push('Guessable without scenario');
  if (q.flags.includes('joke_or_impossible_distractor')) gaps.push('Joke or impossible distractor');
  if (q.gradeBand === '6-8' && q.difficultyScore < 4) {
    gaps.push('Upper band below gold bar (target 4–5/5)');
  }
  if (k1Expected) gaps.push('K–1 age-appropriate floor (3/5) — expected, not gold standard');
  if (gaps.length === 0) gaps.push(`Difficulty ${q.difficultyScore}/5 below 4/5 threshold`);

  return { belowThreshold: true, rubricGap: gaps, k1Expected };
}

export function inferReasoningLabel(q: AuditedQuestion): string {
  const combined = `${q.questionText} ${q.scenarioText}`;
  if (MATH_KEYWORDS.test(combined)) return 'quantitative / planning';
  if (/evidence|passage|clue/i.test(combined)) return 'evidence / reading';
  if (/variable|hypothesis|test|observe/i.test(combined)) return 'science reasoning';
  if (/team|leader|group|tradeoff/i.test(combined)) return 'teamwork / leadership';
  if (/feel|calm|regulat|body signal|coping/i.test(combined)) return 'SEL / regulation';
  if (REASONING_KEYWORDS.test(combined)) return 'inference / comparison';
  return 'recall / recognition';
}
