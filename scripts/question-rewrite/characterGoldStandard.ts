import type { AuditedQuestion } from '../question-audit/types';
import { analyzeGoldPatterns, type GoldPatternStats } from './goldStandardRubric';
import { rankStrongest, type RankedQuestion } from './top25Ranking';

export const CHARACTER_IDS = ['caiden', 'miranda', 'zeke', 'charlie', 'b4'] as const;
export type CharacterId = (typeof CHARACTER_IDS)[number];

const MATH_KEYWORDS =
  /\b(\d+|minute|minutes|hour|\$|token|coin|budget|add|subtract|left|total|how many|how much|percent|sequenc|order|priorit|plan|tradeoff|time)\b/i;

const REASONING_KEYWORDS =
  /\b(why|best|infer|evidence|compare|stronger|most likely|hypothesis|variable|plan|order|priorit|tradeoff|which two)\b/i;

const JOKE_DISTRACTOR =
  /\b(day of the week|disappeared|magic|forever|water is broken|science is over|become an orange|table disappeared)\b/i;

const SELFISH_ZEKE_WRONG =
  /\b(ignore everyone|only care about yourself|refuse to help|walk away alone|blame everyone)\b/i;

const SILLY_CHARLIE =
  /\b(science is over|magic|disappeared forever|become a banana)\b/i;

export type CharacterSkillProfile = {
  id: CharacterId;
  displayName: string;
  coreSkills: string[];
  skillKeywordPattern: RegExp;
  stemPattern: RegExp;
  scenarioPattern: RegExp;
};

export const CHARACTER_PROFILES: Record<CharacterId, CharacterSkillProfile> = {
  caiden: {
    id: 'caiden',
    displayName: 'Caiden',
    coreSkills: ['planning', 'sequencing', 'budgeting', 'time management', 'tradeoff reasoning'],
    skillKeywordPattern: MATH_KEYWORDS,
    stemPattern: /\b(which plan|what order|first|next|budget|minute|time|priorit|tradeoff|how many|how much)\b/i,
    scenarioPattern: /\b(minute|token|coin|budget|schedule|deadline|step|order|left|total|\d+)\b/i,
  },
  miranda: {
    id: 'miranda',
    displayName: 'Miranda',
    coreSkills: ['evidence', 'clues', 'passage analysis', 'inference'],
    skillKeywordPattern: /\b(evidence|clue|passage|detail|infer|support|according|because|shows|suggests)\b/i,
    stemPattern: /\b(according to|evidence|clue|passage|detail|infer|support|which shows)\b/i,
    scenarioPattern: /\b(noticed|found|read|saw|heard|clue|detail|passage|journal|note|report)\b/i,
  },
  zeke: {
    id: 'zeke',
    displayName: 'Zeke',
    coreSkills: ['teamwork', 'leadership', 'social reasoning', 'collaboration tradeoffs'],
    skillKeywordPattern: /\b(team|group|leader|leadership|together|collaborat|tradeoff|include|fair|communicat)\b/i,
    stemPattern: /\b(leadership|team|group|together|tradeoff|include|fair|communicat|without ignoring)\b/i,
    scenarioPattern: /\b(team|group|table|friends|class|project|together|leader|everyone)\b/i,
  },
  charlie: {
    id: 'charlie',
    displayName: 'Charlie',
    coreSkills: ['experimentation', 'variables', 'observation', 'scientific thinking'],
    skillKeywordPattern: /\b(variable|hypothesis|observe|observation|test|experiment|fair test|control|predict|measure|evidence)\b/i,
    stemPattern: /\b(variable|hypothesis|observe|test|experiment|fair|control|predict|measure|change one)\b/i,
    scenarioPattern: /\b(test|experiment|observe|bowl|float|sink|measure|change|variable|hypothesis)\b/i,
  },
  b4: {
    id: 'b4',
    displayName: 'B-4',
    coreSkills: ['emotions', 'regulation', 'self-awareness', 'coping strategies'],
    skillKeywordPattern: /\b(feel|feeling|emotion|calm|regulat|body signal|coping|strategy|name the feeling|mood)\b/i,
    stemPattern: /\b(feeling|emotion|calm|coping|regulat|body signal|strategy|name|mood|compare)\b/i,
    scenarioPattern: /\b(feel|feeling|emotion|calm|body|signal|mood|scanner|regulat|coping)\b/i,
  },
};

export type CharacterPatternAnalysis = GoldPatternStats & {
  character: CharacterId;
  avgDifficulty: number;
  skillKeywordPct: number;
  reasoningStemPct: number;
  commonStems: string[];
  successPatterns: string[];
};

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function topStemPhrases(questions: AuditedQuestion[], limit = 5): string[] {
  const counts: Record<string, number> = {};
  for (const q of questions) {
    const key = q.questionText.trim().slice(0, 60);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([stem, n]) => (n > 1 ? `${stem} (×${n})` : stem));
}

export function analyzeCharacterPatterns(
  character: CharacterId,
  top10: AuditedQuestion[],
): CharacterPatternAnalysis {
  const base = analyzeGoldPatterns(top10);
  const profile = CHARACTER_PROFILES[character];
  const combined = top10.map((q) => `${q.questionText} ${q.scenarioText}`);
  const skillHits = combined.filter((t) => profile.skillKeywordPattern.test(t)).length;
  const reasoningHits = combined.filter((t) => REASONING_KEYWORDS.test(t) || profile.stemPattern.test(t)).length;
  const avgDiff = top10.reduce((s, q) => s + q.difficultyScore, 0) / Math.max(top10.length, 1);

  const successPatterns: string[] = [
    `Average difficulty ${avgDiff.toFixed(1)}/5 across top 10`,
    `${base.zeroFlagsPct.toFixed(0)}% with zero quality flags`,
    `Scenarios average ${base.avgScenarioWords.toFixed(0)} words`,
    `${((skillHits / Math.max(top10.length, 1)) * 100).toFixed(0)}% embed ${profile.coreSkills.slice(0, 2).join(' / ')} language`,
    `${((reasoningHits / Math.max(top10.length, 1)) * 100).toFixed(0)}% use comparison, inference, or best-choice stems`,
    `Grade bands represented: ${Object.entries(base.gradeBandBreakdown).map(([b, n]) => `${b} (${n})`).join(', ')}`,
  ];

  if (base.comparisonStemPct >= 40) {
    successPatterns.push('Comparison or best-choice framing is common in gold stems');
  }
  if (base.mathScenarioPct >= 40 && character === 'caiden') {
    successPatterns.push('Quantitative constraints (time, tokens, totals) appear in most gold scenarios');
  }

  return {
    ...base,
    character,
    avgDifficulty: avgDiff,
    skillKeywordPct: (skillHits / Math.max(top10.length, 1)) * 100,
    reasoningStemPct: (reasoningHits / Math.max(top10.length, 1)) * 100,
    commonStems: topStemPhrases(top10),
    successPatterns,
  };
}

export type CharacterRubric = {
  character: CharacterId;
  displayName: string;
  coreSkills: string[];
  successPatterns: string[];
  patternStats: CharacterPatternAnalysis;
  goldCriteria: string[];
  fiveOfFive: string[];
  fourOfFive: string[];
  threeOfFive: string[];
  neverAppear: string[];
  distractorGuidelines: string[];
  gradeBandNotes: Record<string, string>;
};

function buildNeverAppear(character: CharacterId): string[] {
  const common = [
    'Joke or impossible distractors',
    'Correct answer dramatically longer than all distractors',
    'Question solvable without reading the scenario',
    'Duplicate scenario framing text repeated multiple times',
  ];

  const specific: Record<CharacterId, string[]> = {
    caiden: [
      'Upper-band questions with no numbers, time limits, or planning constraints',
      'Pure emotion/regulation items without executive-function demand',
      'Single-step recall when grade band expects multi-step tradeoffs',
      'SEL-only stems with no sequencing, budgeting, or time logic (grades 4+)',
    ],
    miranda: [
      'Answers guessable without rereading the passage',
      'Stems that do not reference evidence, clues, or passage details',
      'Pure “who/where/when” recall at grades 6–8 without inference',
      'Distractors unrelated to passage content',
    ],
    zeke: [
      'Cartoonishly selfish wrong answers (“ignore everyone,” “only care about yourself”)',
      'Leadership questions with no team or group context',
      'Only one emotionally plausible option — rest are obvious jokes',
      'Conflict resolution without a realistic collaboration tradeoff',
    ],
    charlie: [
      'Silly science distractors (“science is over forever,” magic explanations)',
      'Changing two variables at once without fair-test framing',
      'Conclusions before observation',
      'Non-scientific reasoning dressed as science (pure opinion)',
    ],
    b4: [
      'Skipping body-signal → name-feeling → strategy sequence (grades 2+)',
      'Only extreme negative distractors with one obviously positive correct answer',
      'Regulation strategies applied before naming the feeling (as correct answer)',
      'Emotion labeling without any coping comparison',
    ],
  };

  return [...specific[character], ...common];
}

function buildGoldCriteria(character: CharacterId, patterns: CharacterPatternAnalysis): string[] {
  const profile = CHARACTER_PROFILES[character];
  return [
    `Embeds ${profile.coreSkills.join(', ')} in scenario and/or stem`,
    `Scenario ~${Math.round(patterns.avgScenarioWords)}+ words with concrete, scenario-specific clues`,
    'Zero quality flags; balanced distractor lengths',
    'Requires reading — not answerable from generic SEL or common sense alone',
    'Four-option model: best / plausible-incomplete / plausible-flawed / realistic-wrong',
    'Correct answer position not predictable by length or slot',
  ];
}

export function buildCharacterRubric(
  character: CharacterId,
  top10: AuditedQuestion[],
): CharacterRubric {
  const profile = CHARACTER_PROFILES[character];
  const patterns = analyzeCharacterPatterns(character, top10);

  const fiveOfFive: Record<CharacterId, string[]> = {
    caiden: [
      'Multi-step plan under time or resource constraints (minutes, tokens, budget)',
      'Stem asks which plan, order, or tradeoff fits ALL constraints in the scenario',
      'Distractors: plans that forget one constraint, rush without checking totals, or skip a step',
      'Hardest character path — difficulty 5/5 with quantitative reasoning',
    ],
    miranda: [
      'Passage with at least two concrete clues supporting the correct inference',
      'Stem: “According to the passage…” or “Which clue best supports…”',
      'Distractors: true but weaker evidence, related off-topic facts, plausible misreadings',
      'Answer changes if a key passage sentence is removed',
    ],
    zeke: [
      'Group scenario with competing needs; leadership choice affects everyone',
      'Stem asks which move helps the team without ignoring anyone',
      'Two distractors are emotionally plausible team mistakes; one is realistic but too narrow',
      'No cartoon selfish “obvious wrong” options',
    ],
    charlie: [
      'Fair-test setup: one variable changes, others held constant',
      'Stem asks what to observe, predict, or change next in the experiment',
      'Distractors: change wrong variable, skip observation, or draw conclusion too early',
      'Scientific vocabulary appropriate to grade band',
    ],
    b4: [
      'Body signals → name feeling → compare two regulation strategies',
      'Stem compares coping steps or strategies for the named feeling',
      'Distractors: strategy applied too early, helps partially but ignores body signals, or avoids naming',
      'Warm tone; no shaming language',
    ],
  };

  const distractorGuidelines: Record<CharacterId, string[]> = {
    caiden: [
      'One distractor ignores a time or quantity constraint',
      'One distractor sequences steps in a plausible but wrong order',
      'One distractor solves an easier sub-problem but misses the full plan',
    ],
    miranda: [
      'One distractor cites a true passage detail that does not support the conclusion',
      'One distractor over-infers beyond what the text says',
      'One distractor is plausible if the reader skims but not if they reread',
    ],
    zeke: [
      'Two distractors are realistic group-leadership mistakes',
      'One distractor helps one person but sidelines others',
      'Avoid making the correct answer the only kind option',
    ],
    charlie: [
      'One distractor changes the wrong variable',
      'One distractor skips the observation step',
      'One distractor is a common kid misconception, not a joke',
    ],
    b4: [
      'One distractor uses a calm strategy before naming the feeling',
      'One distractor helps a little but ignores body signals',
      'One distractor avoids the feeling rather than regulating it',
    ],
  };

  return {
    character,
    displayName: profile.displayName,
    coreSkills: profile.coreSkills,
    successPatterns: patterns.successPatterns,
    patternStats: patterns,
    goldCriteria: buildGoldCriteria(character, patterns),
    fiveOfFive: fiveOfFive[character],
    fourOfFive: [
      'Meets grade-band difficulty (4/5) with clear character skill focus',
      'At most one minor heuristic flag that does not harm fairness',
      'Scenario provides enough context; distractors are plausible',
    ],
    threeOfFive: [
      'K–1: age-appropriate recognition or simple cause/effect (expected floor)',
      'Upper bands at 3/5: missing character skill depth or quality flags — needs review',
    ],
    neverAppear: buildNeverAppear(character),
    distractorGuidelines: distractorGuidelines[character],
    gradeBandNotes: {
      'K-1': `Simple ${profile.coreSkills[0]} recognition; difficulty ceiling ~3/5`,
      '2-3': `Introduce ${profile.coreSkills.slice(0, 2).join(' and ')} with one clear decision`,
      '4-5': `Comparison and inference; target 4–5/5 for ${profile.displayName}`,
      '6-8': `Multi-step ${profile.coreSkills[profile.coreSkills.length - 1]}; target 4–5/5`,
    },
  };
}

export type CharacterViolation = {
  questionId: string;
  missionId: string;
  missionTitle: string;
  gradeBand: string;
  difficultyScore: number;
  flags: string[];
  violations: string[];
  severity: 'critical' | 'review' | 'informational';
};

function isUpperBand(gradeBand: string): boolean {
  return gradeBand === '4-5' || gradeBand === '6-8';
}

function isLowerBand(gradeBand: string): boolean {
  return gradeBand === 'K-1' || gradeBand === '2-3';
}

export function detectCharacterViolations(q: AuditedQuestion): CharacterViolation | null {
  const profile = CHARACTER_PROFILES[q.character as CharacterId];
  if (!profile) return null;

  const violations: string[] = [];
  const combined = `${q.questionText} ${q.scenarioText}`;
  const choiceText = q.choices.map((c) => c.label).join(' ');

  for (const flag of q.flags) {
    violations.push(`Audit flag: ${flag}`);
  }

  if (isUpperBand(q.gradeBand)) {
    if (!profile.skillKeywordPattern.test(combined)) {
      violations.push(`Missing ${profile.displayName} core skill language (${profile.coreSkills.slice(0, 2).join(', ')})`);
    }
    if (!profile.stemPattern.test(q.questionText) && !REASONING_KEYWORDS.test(q.questionText)) {
      violations.push('Stem lacks character-appropriate reasoning cue (compare, evidence, plan, etc.)');
    }
    if (q.difficultyScore < 4) {
      violations.push(`Below character gold bar (${q.difficultyScore}/5; target 4–5/5 for ${q.gradeBand})`);
    }
  }

  if (q.gradeBand === '2-3' && !profile.scenarioPattern.test(combined) && q.difficultyScore >= 4) {
    violations.push('Scenario may not anchor character skill theme for grade 2–3');
  }

  if (q.character === 'caiden' && isUpperBand(q.gradeBand) && !MATH_KEYWORDS.test(combined)) {
    violations.push('Caiden upper-band item lacks planning, time, or quantitative constraints');
  }

  if (q.character === 'miranda' && !isLowerBand(q.gradeBand) && !profile.skillKeywordPattern.test(combined)) {
    violations.push('Miranda item lacks evidence/passage/clue framing');
  }

  if (q.character === 'zeke' && isUpperBand(q.gradeBand)) {
    if (!profile.scenarioPattern.test(combined)) {
      violations.push('Zeke upper-band item lacks team/group scenario context');
    }
    if (SELFISH_ZEKE_WRONG.test(choiceText) || JOKE_DISTRACTOR.test(choiceText)) {
      violations.push('Contains cartoon selfish or joke distractor (never appear for Zeke)');
    }
  }

  if (q.character === 'charlie' && isUpperBand(q.gradeBand)) {
    if (SILLY_CHARLIE.test(choiceText)) {
      violations.push('Contains silly science distractor (never appear for Charlie)');
    }
    if (!profile.skillKeywordPattern.test(combined)) {
      violations.push('Charlie upper-band item lacks experimentation/variable language');
    }
  }

  if (q.character === 'b4' && q.gradeBand !== 'K-1') {
    if (!profile.skillKeywordPattern.test(combined)) {
      violations.push('B-4 item lacks emotion/regulation/coping language');
    }
    const negativeCount = q.choices.filter((c) => /\b(ignore|never|yell|hide)\b/i.test(c.label)).length;
    if (negativeCount >= 3) {
      violations.push('Too many extreme-negative distractors (never appear for B-4)');
    }
  }

  if (JOKE_DISTRACTOR.test(choiceText)) {
    violations.push('Contains joke or impossible distractor');
  }

  const unique = [...new Set(violations)];
  if (unique.length === 0) return null;

  const hasCritical =
    q.flags.length > 0 ||
    (isUpperBand(q.gradeBand) && q.difficultyScore < 4) ||
    unique.some((v) => v.includes('never appear') || v.includes('joke'));

  const severity: CharacterViolation['severity'] = hasCritical
    ? 'critical'
    : q.gradeBand === 'K-1'
      ? 'informational'
      : 'review';

  return {
    questionId: q.questionId,
    missionId: q.missionId,
    missionTitle: q.missionTitle,
    gradeBand: q.gradeBand,
    difficultyScore: q.difficultyScore,
    flags: q.flags,
    violations: unique,
    severity,
  };
}

export function rankTop10ByCharacter(
  questions: AuditedQuestion[],
): Record<CharacterId, RankedQuestion[]> {
  const result = {} as Record<CharacterId, RankedQuestion[]>;
  for (const character of CHARACTER_IDS) {
    result[character] = rankStrongest(questions.filter((q) => q.character === character)).slice(0, 10);
  }
  return result;
}

export function auditCharacterViolations(
  questions: AuditedQuestion[],
): Record<CharacterId, CharacterViolation[]> {
  const result = {} as Record<CharacterId, CharacterViolation[]>;
  for (const character of CHARACTER_IDS) {
    result[character] = questions
      .filter((q) => q.character === character)
      .map((q) => detectCharacterViolations(q))
      .filter((v): v is CharacterViolation => v !== null)
      .sort((a, b) => {
        const sev = { critical: 0, review: 1, informational: 2 };
        if (sev[a.severity] !== sev[b.severity]) return sev[a.severity] - sev[b.severity];
        return a.difficultyScore - b.difficultyScore;
      });
  }
  return result;
}
