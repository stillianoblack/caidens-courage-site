import type { NormalizedQuestion } from '../question-audit/types';
import type { StagingQuestionOverride } from './types';

export type DuplicateCluster = {
  key: string;
  questionIds: string[];
  keeperId: string;
  rewriteIds: string[];
};

export type DeduplicationChange = {
  questionId: string;
  beforeScenario: string;
  afterScenario: string;
  beforeQuestion: string;
  afterQuestion: string;
  clusterKey: string;
  keptOriginal: boolean;
};

function normalizeScenarioKey(text: string): string {
  return text.trim().replace(/\s+/g, ' ').toLowerCase();
}

function normalizeStemKey(text: string): string {
  return text.trim().replace(/\s+/g, ' ').toLowerCase();
}

function choiceSetKey(q: Pick<NormalizedQuestion, 'choices'>): string {
  return q.choices
    .map((c) => c.label.trim().toLowerCase())
    .sort()
    .join(' | ');
}

export function fullQuestionKey(q: NormalizedQuestion): string {
  return [
    normalizeStemKey(q.questionText),
    normalizeScenarioKey(q.scenarioText),
    choiceSetKey(q),
    q.correctAnswerLabel.trim().toLowerCase(),
  ].join('::');
}

export function findDuplicateClusters(questions: NormalizedQuestion[]): DuplicateCluster[] {
  const groups = new Map<string, NormalizedQuestion[]>();
  for (const q of questions) {
    const key = fullQuestionKey(q);
    const list = groups.get(key) ?? [];
    list.push(q);
    groups.set(key, list);
  }

  return [...groups.entries()]
    .filter(([, list]) => list.length >= 2)
    .map(([key, list]) => {
      const sorted = [...list].sort((a, b) => a.questionId.localeCompare(b.questionId));
      return {
        key,
        questionIds: sorted.map((q) => q.questionId),
        keeperId: sorted[0].questionId,
        rewriteIds: sorted.slice(1).map((q) => q.questionId),
      };
    })
    .sort((a, b) => b.rewriteIds.length - a.rewriteIds.length);
}

function dedupeSentences(text: string): string {
  const parts = text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const part of parts) {
    const key = part.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(part);
  }
  return unique.join(' ');
}

function hashSlot(questionId: string, salt = 0): number {
  return questionId.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), salt);
}

const ORDER_SCENARIOS = [
  'Caiden must finish reading (15 min), walk the dog (5 min), and set the table (10 min). Dinner starts in 35 minutes.',
  'Caiden needs to complete math (15 min), feed the cat (5 min), and arrange plates (10 min). Dinner is in 38 minutes.',
  'Caiden plans to do spelling (15 min), refill the pet bowl (5 min), and lay out forks (10 min). Dinner begins in 40 minutes.',
  'Caiden must finish a worksheet (15 min), check on the puppy (5 min), and prep the table (10 min). Dinner is served in 36 minutes.',
  'Caiden has writing practice (15 min), a quick pet walk (5 min), and napkins to place (10 min). Dinner is in 42 minutes.',
  'Caiden needs reading time (15 min), a pet feeding (5 min), and table setup (10 min). Dinner starts in 34 minutes.',
];

const PLAN_FIT_SCENARIOS = [
  'Caiden must do homework (15 min), feed the dog (5 min), and set the table (10 min). Dinner is in 35 minutes. He also wants a 5-minute break.',
  'Caiden must finish a project (15 min), fill the pet dish (5 min), and set places (10 min). Dinner is in 37 minutes. He also wants a 5-minute rest.',
  'Caiden has practice pages (15 min), a dog walk (5 min), and table prep (10 min). Dinner is in 39 minutes. He also wants a 5-minute pause.',
  'Caiden needs study time (15 min), pet care (5 min), and dishes out (10 min). Dinner is in 41 minutes. He also wants a 5-minute breather.',
  'Caiden must read (15 min), feed the cat (5 min), and set the table (10 min). Dinner is in 33 minutes. He also wants a 5-minute break.',
  'Caiden has math (15 min), a pet check (5 min), and place settings (10 min). Dinner is in 36 minutes. He also wants a 5-minute rest.',
];

const TOKEN_SCENARIOS = [
  'Caiden has 10 tokens. A pencil costs 4 tokens and an eraser costs 3 tokens. He wants both before art class.',
  'Caiden has 12 tokens. A marker costs 5 tokens and a glue stick costs 4 tokens. He wants both before craft time.',
  'Caiden has 11 tokens. A notebook costs 6 tokens and a sticker sheet costs 3 tokens. He wants both before writing lab.',
  'Caiden has 10 tokens. A pen costs 4 tokens and a ruler costs 3 tokens. He wants both before math tools time.',
  'Caiden has 13 tokens. A crayon pack costs 5 tokens and a sharpener costs 4 tokens. He wants both before art block.',
  'Caiden has 10 tokens. A pencil costs 4 tokens and tape costs 3 tokens. He wants both before project hour.',
];

const MINUTES_35_SCENARIOS = [
  'Caiden has 35 minutes before the bus. Homework takes 20 minutes and packing lunch takes 10 minutes. He wants 5 minutes to double-check.',
  'Caiden has 35 minutes before practice. Chores take 20 minutes and snack prep takes 10 minutes. He wants 5 minutes to review.',
  'Caiden has 35 minutes before the meeting. Reading takes 20 minutes and organizing takes 10 minutes. He wants 5 minutes to breathe.',
  'Caiden has 35 minutes before rehearsal. Writing takes 20 minutes and gathering supplies takes 10 minutes. He wants 5 minutes to check.',
  'Caiden has 35 minutes before the field trip call. A report takes 20 minutes and packing takes 10 minutes. He wants 5 minutes to verify.',
  'Caiden has 35 minutes before library time. Research takes 20 minutes and returning books takes 10 minutes. He wants 5 minutes to plan.',
];

const MINUTES_45_SCENARIOS = [
  'Caiden has 45 minutes after school. Homework takes 25 minutes, chores take 15 minutes, and he wants a 5-minute break before dinner.',
  'Caiden has 45 minutes before dinner. A project takes 25 minutes, room tidy takes 15 minutes, and he wants a 5-minute pause.',
  'Caiden has 45 minutes free. Reading takes 25 minutes, organizing takes 15 minutes, and he wants a 5-minute rest.',
  'Caiden has 45 minutes after class. Practice takes 25 minutes, prep takes 15 minutes, and he wants a 5-minute break.',
  'Caiden has 45 minutes before the game. Study takes 25 minutes, packing gear takes 15 minutes, and he wants a 5-minute check-in.',
  'Caiden has 45 minutes at home. Writing takes 25 minutes, setup takes 15 minutes, and he wants a 5-minute reset.',
];

const K1_ITEMS_SCENARIOS = [
  'Caiden packs a book, a snack, and a water bottle for the field trip.',
  'Caiden packs a hat, a lunch, and a coat for the rainy walk.',
  'Caiden packs a map, a snack, and gloves for the nature hike.',
  'Caiden packs a journal, a fruit cup, and mittens for the outdoor lab.',
  'Caiden packs a card, a granola bar, and boots for the snow activity.',
  'Caiden packs a photo, a apple slices, and a scarf for the winter outing.',
];

const K1_MINUTES_SCENARIOS = [
  'Caiden has 10 minutes before line-up. Shoes take 3 minutes and a coat takes 4 minutes.',
  'Caiden has 12 minutes before recess. Boots take 4 minutes and a hat takes 3 minutes.',
  'Caiden has 11 minutes before the bell. A backpack takes 3 minutes and a jacket takes 4 minutes.',
  'Caiden has 10 minutes before gym. Sneakers take 3 minutes and a water bottle grab takes 2 minutes.',
  'Caiden has 12 minutes before art. An apron takes 2 minutes and supply bin takes 4 minutes.',
  'Caiden has 10 minutes before lunch. Hand washing takes 2 minutes and lunch box takes 3 minutes.',
];

const SMART_PURCHASE_SCENARIOS = [
  'Caiden has $12 for camp supplies. A notebook costs $5 and markers cost $8. He can buy one now and save for the other tomorrow.',
  'Caiden has $14 for the book fair. A journal costs $6 and a pen set costs $9. He can buy one now and save for the other later.',
  'Caiden has $11 for the craft sale. A kit costs $4 and paint costs $8. He can buy one now and save for the other next week.',
  'Caiden has $13 for the supply shop. A folder costs $5 and colored pencils cost $8. He can buy one now and save for the other soon.',
  'Caiden has $10 for the fundraiser table. A bookmark costs $3 and a poster costs $8. He can buy one now and save for the other later.',
  'Caiden has $15 for the camp store. A puzzle costs $7 and a game costs $9. He can buy one now and save for the other tomorrow.',
];

function missionClause(questionId: string, missionTitle: string): string {
  const missionHints: Record<string, string> = {
    'quest-6': 'During the snack shop challenge',
    'quest-7': 'During the camp supply mission',
    'quest-8': 'During the homework rescue plan',
    'quest-9': 'During the camp leader challenge',
    'quest-1': 'During the what comes first quest',
    'quest-2': 'During focus or distraction',
    'quest-3': 'During the time tracker mission',
    'quest-4': 'During reset and return',
    'quest-5': 'During build the plan',
  };
  const missionId = questionId.match(/cq(\d+)/)?.[0]?.replace('cq', 'quest-') ?? '';
  return missionHints[missionId] ?? `During ${missionTitle.toLowerCase()}`;
}

function varyQuestionStem(questionText: string, variant: number): string {
  const variants: Record<string, string[]> = {
    'what order finishes everything with time to spare?': [
      'Which sequence finishes everything with time to spare?',
      'Which order uses time wisely before the deadline?',
      'Which plan finishes all tasks with minutes left?',
      'Which task order leaves time before dinner?',
      'Which sequence completes everything on time?',
      'Which order best fits the minutes available?',
    ],
    'does his plan fit if he does all tasks and the break?': [
      'Which plan fits all tasks plus the break?',
      'Does his schedule fit the tasks and the rest?',
      'Which plan covers every task and the pause?',
      'Which schedule fits tasks plus the break?',
      'Which plan uses the deadline with a break included?',
      'Which timing plan fits tasks and rest?',
    ],
    'can he afford both items with 10 tokens?': [
      'Which purchase plan fits both items within his tokens?',
      'Can both items fit in his token budget today?',
      'Which token plan covers both purchases?',
      'Do both items fit within his token total?',
    ],
    'which purchase plan best fits his 10-token budget for both items?': [
      'Which token plan best covers both purchases?',
      'Which budget plan fits both items within 10 tokens?',
      'Which purchase plan compares both costs within his tokens?',
      'Which plan best fits both items in his token budget?',
    ],
    'how many items did caiden pack in total?': [
      'How many items is Caiden packing in total?',
      'What is the total number of items Caiden packs?',
      'How many things does Caiden pack altogether?',
      'What total items does Caiden need to pack?',
    ],
    'how many minutes are left after shoes and coat?': [
      'How many minutes remain after shoes and coat?',
      'How much time is left after those two steps?',
      'How many minutes stay after shoes and coat?',
      'What minutes are left after those tasks?',
    ],
    'which use of 35 minutes best fits the deadlines?': [
      'Which 35-minute plan best fits the deadlines?',
      'Which schedule uses 35 minutes most wisely?',
      'Which plan fits the tasks into 35 minutes?',
      'Which use of time best meets the deadlines?',
    ],
    'which plan uses his 45 minutes without skipping the break or chores?': [
      'Which 45-minute plan keeps the break and chores?',
      'Which schedule uses 45 minutes with break and chores?',
      'Which plan fits 45 minutes including break and chores?',
      'Which timing plan covers chores and the break in 45 minutes?',
    ],
    'what is the smartest purchase plan for today?': [
      'Which purchase plan is smartest for today?',
      'Which buying plan makes the best use of money today?',
      'Which spending plan fits today’s needs best?',
      'Which purchase choice is wisest today?',
    ],
    'what should zeke say or do first for the team?': [
      'Which team move should Zeke try first?',
      'Which first response helps the team most?',
      'Which opening choice supports the group?',
      'Which first step helps teammates feel included?',
    ],
  };

  const key = questionText.trim().toLowerCase();
  const pool = variants[key];
  if (!pool?.length) return questionText;
  return pool[variant % pool.length];
}

function buildScenarioVariant(
  question: NormalizedQuestion,
  variant: number,
): { scenarioText: string; questionText: string } {
  const stem = question.questionText.trim();
  const lower = stem.toLowerCase();
  const clause = missionClause(question.questionId, question.missionTitle);

  let base = '';
  if (lower.includes('order finishes everything')) {
    base = ORDER_SCENARIOS[variant % ORDER_SCENARIOS.length];
  } else if (lower.includes('plan fit if he does all tasks')) {
    base = PLAN_FIT_SCENARIOS[variant % PLAN_FIT_SCENARIOS.length];
  } else if (lower.includes('purchase plan') || lower.includes('afford both items') || lower.includes('10-token')) {
    base = dedupeSentences(question.scenarioText);
    const clauses = [
      'He compares both prices on the price tag before deciding.',
      'He checks the token chart on the wall before choosing.',
      'He counts his tokens twice before picking a plan.',
      'He reads the supply list again before spending tokens.',
      'He asks himself which item he needs first for class.',
      'He looks at the art table deadline before buying.',
    ];
    base = `${base} ${clauses[variant % clauses.length]}`;
  } else if (lower.includes('35 minutes best fits')) {
    base = MINUTES_35_SCENARIOS[variant % MINUTES_35_SCENARIOS.length];
  } else if (lower.includes('45 minutes without skipping')) {
    base = MINUTES_45_SCENARIOS[variant % MINUTES_45_SCENARIOS.length];
  } else if (lower.includes('how many items did caiden pack')) {
    base = K1_ITEMS_SCENARIOS[variant % K1_ITEMS_SCENARIOS.length];
  } else if (lower.includes('minutes are left after shoes')) {
    base = K1_MINUTES_SCENARIOS[variant % K1_MINUTES_SCENARIOS.length];
  } else if (lower.includes('smartest purchase plan')) {
    base = SMART_PURCHASE_SCENARIOS[variant % SMART_PURCHASE_SCENARIOS.length];
  } else if (question.character === 'zeke') {
    base = dedupeSentences(question.scenarioText);
    const zekeClauses = [
      'Two teammates share different ideas, and Zeke compares both before responding.',
      'The group needs a fair plan, so Zeke listens and weighs a tradeoff.',
      'Zeke notices one quiet friend and compares ways to include them.',
      'The team deadline is close, so Zeke compares speed with inclusion.',
    ];
    base = `${base} ${zekeClauses[variant % zekeClauses.length]}`;
  } else {
    base = dedupeSentences(question.scenarioText);
    base = base.replace(/\b(\d+)\b/g, (match, num) => {
      const n = Number(num);
      if (Number.isNaN(n) || n > 120) return match;
      return String(n + ((variant % 3) + 1));
    });
  }

  let scenarioText = base;
  if (question.character === 'caiden') {
    scenarioText = `${base} ${clause}, Caiden checks his plan twice and compares the time before acting.`;
  } else if (question.character === 'zeke') {
    scenarioText = `${base} ${clause}, Zeke compares both options before leading the group.`;
  } else {
    scenarioText = dedupeSentences(base);
  }

  const questionText = varyQuestionStem(stem, variant + hashSlot(question.questionId));
  return { scenarioText: dedupeSentences(scenarioText), questionText };
}

export function applyDeduplicationToOverrides(
  overrides: Record<string, StagingQuestionOverride>,
  normalized: NormalizedQuestion[],
): DeduplicationChange[] {
  const changes: DeduplicationChange[] = [];
  const clusters = findDuplicateClusters(normalized);

  for (const cluster of clusters) {
    cluster.rewriteIds.forEach((questionId, index) => {
      const override = overrides[questionId];
      const base = normalized.find((q) => q.questionId === questionId);
      if (!override || !base) return;

      const variant = index + 1 + (hashSlot(questionId) % 3);
      const beforeScenario = override.scenarioText ?? base.scenarioText;
      const beforeQuestion = override.questionText;
      const varied = buildScenarioVariant(base, variant);

      override.scenarioText = varied.scenarioText;
      override.questionText = varied.questionText;
      override.rewriteNotes = `${override.rewriteNotes}; v5 content variety dedupe`;
      changes.push({
        questionId,
        beforeScenario,
        afterScenario: override.scenarioText ?? '',
        beforeQuestion,
        afterQuestion: override.questionText,
        clusterKey: cluster.key.slice(0, 80),
        keptOriginal: false,
      });
    });

    changes.push({
      questionId: cluster.keeperId,
      beforeScenario: overrides[cluster.keeperId]?.scenarioText ?? '',
      afterScenario: overrides[cluster.keeperId]?.scenarioText ?? '',
      beforeQuestion: overrides[cluster.keeperId]?.questionText ?? '',
      afterQuestion: overrides[cluster.keeperId]?.questionText ?? '',
      clusterKey: cluster.key.slice(0, 80),
      keptOriginal: true,
    });
  }

  return changes;
}

export function fixRemainingDuplicateClusters(
  overrides: Record<string, StagingQuestionOverride>,
  normalized: NormalizedQuestion[],
  productionById: Map<string, NormalizedQuestion>,
): number {
  let fixed = 0;
  const clusters = findDuplicateClusters(normalized);
  for (const cluster of clusters) {
    for (const questionId of cluster.rewriteIds) {
      const prod = productionById.get(questionId);
      const override = overrides[questionId];
      if (!prod || !override) continue;
      override.scenarioText = prod.scenarioText;
      override.questionText = prod.questionText;
      override.rewriteNotes = `${override.rewriteNotes}; v5 dedupe restore production wording`;
      fixed += 1;
    }
  }
  return fixed;
}

export function countStemFrequency(
  normalized: NormalizedQuestion[],
  character?: string,
): Array<{ stem: string; count: number }> {
  const counts: Record<string, number> = {};
  for (const q of normalized) {
    if (character && q.character !== character) continue;
    const stem = q.questionText.trim();
    counts[stem] = (counts[stem] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([stem, count]) => ({ stem, count }))
    .sort((a, b) => b.count - a.count);
}
