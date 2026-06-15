import type { GradeBand, NormalizedQuestion } from '../question-audit/types';
import type { StagingQuestionOverride } from './types';
import { applyPositionToChoices } from './positionBalancer';
import { isJokeOrImpossible } from './jokePatterns';

export type ChoiceSet = {
  best: string;
  plausibleIncomplete: string;
  plausibleFlawed: string;
  obviousWrong: string;
};

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function trimToWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(' ')}…`;
}

/** Keep all four options within ~30% length of the median. */
export function balanceChoiceLengths(
  choices: [string, string, string, string],
  correctIndex: 0 | 1 | 2 | 3,
): [string, string, string, string] {
  const target = Math.round(choices.reduce((s, c) => s + c.length, 0) / 4);
  const minLen = Math.max(18, Math.floor(target * 0.75));
  const maxLen = Math.ceil(target * 1.25);

  return choices.map((label) => {
    if (label.length > maxLen) return trimToWords(label, Math.max(6, Math.floor(maxLen / 5)));
    if (label.length < minLen && label.length < 40) {
      const pad = ' for this scenario';
      return (label + pad).slice(0, maxLen);
    }
    return label;
  }) as [string, string, string, string];
}

export function buildChoices(
  set: ChoiceSet,
  correctIndex: 0 | 1 | 2 | 3,
): [string, string, string, string] {
  const raw = applyPositionToChoices(
    set.best,
    set.plausibleIncomplete,
    set.plausibleFlawed,
    set.obviousWrong,
    correctIndex,
  );
  return balanceChoiceLengths(raw, correctIndex);
}

export function ensureScenarioDepth(
  scenario: string,
  character: string,
  band: GradeBand,
  missionTitle: string,
): string {
  const base = scenario.trim();
  const minWords = band === 'K-1' ? 28 : band === '2-3' ? 42 : 62;
  if (wordCount(base) >= minWords) return base;

  const frames: Record<string, string> = {
    caiden:
      'Caiden checks his plan twice, compares time and supplies, and picks the step that keeps camp prep on track.',
    miranda:
      'Miranda rereads the passage, marks two details, and compares clues before she decides.',
    zeke:
      'Zeke listens to teammates, weighs two reasonable plans, and chooses the option that helps the group most.',
    charlie:
      'Charlie observes carefully, changes one variable at a time, and records what the test shows.',
    b4: 'B-4 notices body signals, names the feeling, and compares two calm-down strategies before acting.',
  };

  const frame = frames[character] ?? frames.caiden;
  const context = missionTitle ? ` During ${missionTitle.toLowerCase()},` : '';
  return `${base}${context} ${frame}`.trim();
}

function stripEvidencePrefix(text: string): string {
  return text
    .replace(/^Using the evidence provided,\s*/i, '')
    .replace(/^Based on the scenario,\s*/i, '')
    .trim();
}

type CaidenMathPack = {
  scenarioText: string;
  questionText: string;
  choices: ChoiceSet;
  hint: string;
  skillTags: string[];
};

function caidenMathPack(seed: number, band: GradeBand): CaidenMathPack {
  const packs: CaidenMathPack[] =
    band === '6-8'
      ? [
          {
            scenarioText:
              'Caiden has 45 minutes before camp starts. Drawing takes 12 minutes, packing takes 8 minutes, reading takes 20 minutes, and he wants a 5-minute break. He must finish all tasks before leaving.',
            questionText:
              'Which plan uses his 45 minutes without skipping the break or running late?',
            choices: {
              best: 'Pack (8), draw (12), break (5), read (20) — total 45 minutes',
              plausibleIncomplete: 'Draw first, pack, read, then skip the break to save time',
              plausibleFlawed: 'Read (20), draw (12), pack (8) — no break planned',
              obviousWrong: 'Do all tasks at once with no time check',
            },
            hint: 'Add all task minutes plus the 5-minute break and compare to 45.',
            skillTags: ['Planning', 'Time Management', 'Math', 'Executive Function'],
          },
          {
            scenarioText:
              'Caiden has $14. Snack costs $3, notebook $5, and markers $8. He needs the notebook today; markers can wait until tomorrow when he earns $4.',
            questionText: 'What is the smartest purchase plan for today?',
            choices: {
              best: 'Buy notebook ($5) and snack ($3) — $8 total, saves markers for tomorrow',
              plausibleIncomplete: 'Buy markers ($8) only and skip snack',
              plausibleFlawed: 'Buy notebook and markers ($13) with no money left',
              obviousWrong: 'Buy all three items today with $14',
            },
            hint: 'Compare totals to $14 and note what can wait.',
            skillTags: ['Budgeting', 'Prioritization', 'Math'],
          },
          {
            scenarioText:
              'Three tasks: quiz study (25 min, due tomorrow), project (50 min, due in 4 days), chores (15 min, due tonight). Caiden has 35 free minutes now.',
            questionText: 'Which use of 35 minutes best fits the deadlines?',
            choices: {
              best: 'Quiz study (25 min) plus start chores (10 of 15 min)',
              plausibleIncomplete: 'Start the full project (50 min) and finish chores later',
              plausibleFlawed: 'Split 17 minutes on quiz and 18 on project — neither finishes',
              obviousWrong: 'Play first and hope to finish everything later',
            },
            hint: 'Match urgency and whether each task fits in 35 minutes.',
            skillTags: ['Prioritization', 'Time Management', 'Planning'],
          },
        ]
      : [
          {
            scenarioText:
              'Caiden has 30 minutes before the bus. Shoes (3 min), backpack (5 min), and lunch (4 min) must be done. He also wants 5 minutes to breathe.',
            questionText: 'Does his plan fit if he does all tasks and the break?',
            choices: {
              best: 'Yes — tasks total 12 minutes plus 5-minute break fits in 30',
              plausibleIncomplete: 'Skip lunch to save 4 minutes only',
              plausibleFlawed: 'Do backpack last even if the bus line is long',
              obviousWrong: 'Skip all planning and run at the last second',
            },
            hint: 'Add 3 + 5 + 4 + 5 and compare to 30.',
            skillTags: ['Time Management', 'Math', 'Planning'],
          },
          {
            scenarioText:
              'Caiden has 10 tokens. A pencil costs 4 tokens and an eraser costs 3 tokens. He wants both before art class.',
            questionText: 'Can he afford both items with 10 tokens?',
            choices: {
              best: 'Yes — 4 + 3 = 7 tokens, which is less than 10',
              plausibleIncomplete: 'Buy only the pencil and save the rest',
              plausibleFlawed: 'Buy the eraser twice to be sure',
              obviousWrong: 'He needs 15 tokens for both',
            },
            hint: 'Add both prices and compare to 10.',
            skillTags: ['Budgeting', 'Math'],
          },
          {
            scenarioText:
              'Caiden must do homework (15 min), feed the dog (5 min), and set the table (10 min). Dinner is in 35 minutes.',
            questionText: 'What order finishes everything with time to spare?',
            choices: {
              best: 'Homework, feed dog, set table — 30 minutes total',
              plausibleIncomplete: 'Set table first, then homework, skip dog until after dinner',
              plausibleFlawed: 'Do homework and table together without timing',
              obviousWrong: 'Start with the longest break first',
            },
            hint: 'Add minutes and compare to 35.',
            skillTags: ['Sequencing', 'Planning', 'Math'],
          },
        ];

  return packs[seed % packs.length];
}

function upgradeCaiden(
  q: NormalizedQuestion,
  override: StagingQuestionOverride,
): Partial<StagingQuestionOverride> {
  const seed = hashSeed(q.questionId);
  const band = q.gradeBand;

  if (band === '4-5' || band === '6-8') {
    const pack = caidenMathPack(seed, band);
    return {
      scenarioText: ensureScenarioDepth(pack.scenarioText, 'caiden', band, q.missionTitle),
      questionText: pack.questionText,
      hint: pack.hint,
      skillTags: pack.skillTags,
      _choiceSet: pack.choices,
    } as Partial<StagingQuestionOverride> & { _choiceSet: ChoiceSet };
  }

  if (band === '2-3') {
    const small = caidenMathPack(seed, '4-5');
    return {
      scenarioText: ensureScenarioDepth(small.scenarioText, 'caiden', band, q.missionTitle),
      questionText: small.questionText,
      hint: small.hint,
      skillTags: ['Planning', 'Time Management', 'Math'],
      _choiceSet: small.choices,
    } as Partial<StagingQuestionOverride> & { _choiceSet: ChoiceSet };
  }

  const k1Packs = [
    {
      scenarioText:
        'Caiden has 3 things to pack: lunch, water, and his book. He packs lunch first, then water, then the book.',
      questionText: 'How many items did Caiden pack in total?',
      choices: {
        best: '3 items',
        plausibleIncomplete: '2 items — he forgot to count the book',
        plausibleFlawed: '4 items — he counted lunch twice',
        obviousWrong: '1 item only',
      },
      hint: 'Count each thing he packed.',
    },
    {
      scenarioText:
        'Caiden has 10 minutes. Shoes take 3 minutes and coat takes 2 minutes.',
      questionText: 'How many minutes are left after shoes and coat?',
      choices: {
        best: '5 minutes left',
        plausibleIncomplete: '7 minutes left — counted only shoes',
        plausibleFlawed: '3 minutes left — skipped the coat',
        obviousWrong: '10 minutes left',
      },
      hint: 'Add 3 + 2 and subtract from 10.',
    },
  ];
  const k1 = k1Packs[hashSeed(q.questionId) % k1Packs.length];
  return {
    scenarioText: ensureScenarioDepth(k1.scenarioText, 'caiden', band, q.missionTitle),
    questionText: k1.questionText,
    hint: k1.hint,
    skillTags: ['Planning', 'Math', 'Executive Function'],
    _choiceSet: k1.choices,
  } as Partial<StagingQuestionOverride> & { _choiceSet: ChoiceSet };
}

// --- Miranda ---

function upgradeMiranda(
  q: NormalizedQuestion,
  override: StagingQuestionOverride,
): Partial<StagingQuestionOverride> & { _choiceSet?: ChoiceSet } {
  const passage = ensureScenarioDepth(
    override.scenarioText ?? q.scenarioText,
    'miranda',
    q.gradeBand,
    q.missionTitle,
  );
  const seed = hashSeed(q.questionId);
  const best = override.choices[override.correctIndex];

  if (q.gradeBand === '6-8') {
    const stems = [
      'Which two clues best support Miranda’s conclusion?',
      'Which clue weakens her first idea?',
      'What should Miranda check in the passage before deciding?',
    ];
    const questionText = stems[seed % stems.length];
    return {
      scenarioText: passage,
      questionText,
      hint: 'Reread the passage and compare clue strength.',
      skillTags: ['Evidence', 'Inference', 'Reading Comprehension'],
      _choiceSet: {
        best,
        plausibleIncomplete: 'A true detail that does not answer the question',
        plausibleFlawed: 'A clue from the wrong part of the passage',
        obviousWrong: 'A guess without rereading the passage',
      },
    };
  }

  if (q.gradeBand === '4-5') {
    return {
      scenarioText: passage,
      questionText: 'According to the passage, which answer is best supported by evidence?',
      hint: 'Find the sentence that proves your choice.',
      skillTags: ['Evidence', 'Inference'],
      _choiceSet: {
        best,
        plausibleIncomplete: 'A related detail that is weaker evidence',
        plausibleFlawed: 'A clue that sounds right but is off-topic',
        obviousWrong: 'An answer not stated or supported in the passage',
      },
    };
  }

  return {
    scenarioText: passage,
    questionText: override.questionText.startsWith('According')
      ? override.questionText
      : `According to the passage, ${stripEvidencePrefix(override.questionText).replace(/\?$/, '')}?`,
    hint: override.hint ?? 'Read the passage before you choose.',
    _choiceSet: {
      best,
      plausibleIncomplete: 'A detail from the wrong sentence',
      plausibleFlawed: 'A word that appears but does not answer',
      obviousWrong: 'Something not mentioned in the passage',
    },
  };
}

// --- Zeke ---

function upgradeZeke(
  q: NormalizedQuestion,
  override: StagingQuestionOverride,
): Partial<StagingQuestionOverride> & { _choiceSet: ChoiceSet } {
  const scenario = ensureScenarioDepth(
    override.scenarioText ?? q.scenarioText,
    'zeke',
    q.gradeBand,
    q.missionTitle,
  );
  const best = override.choices[override.correctIndex];
  const seed = hashSeed(q.questionId);

  const stems =
    q.gradeBand === 'K-1' || q.gradeBand === '2-3'
      ? ['What should Zeke say or do first for the team?']
      : [
          'Which choice best compares two fair plans for the team?',
          'What leadership move helps most without ignoring anyone?',
          'Which plan balances the team tradeoff best?',
        ];

  return {
    scenarioText: scenario,
    questionText: stems[seed % stems.length],
    hint: 'Two answers may sound kind — pick the one that helps the whole team.',
    skillTags: [...(override.skillTags ?? q.skillTags), 'Teamwork', 'Leadership'],
    _choiceSet: {
      best,
      plausibleIncomplete: 'A kind idea that skips hearing everyone out',
      plausibleFlawed: 'A fast choice that helps one person but not the group',
      obviousWrong: 'A choice that shuts teammates out',
    },
  };
}

// --- Charlie ---

function upgradeCharlie(
  q: NormalizedQuestion,
  override: StagingQuestionOverride,
): Partial<StagingQuestionOverride> & { _choiceSet: ChoiceSet } {
  const scenario = ensureScenarioDepth(
    override.scenarioText ?? q.scenarioText,
    'charlie',
    q.gradeBand,
    q.missionTitle,
  );
  const best = override.choices[override.correctIndex];
  const seed = hashSeed(q.questionId);

  const stems =
    q.gradeBand === 'K-1' || q.gradeBand === '2-3'
      ? ['What should Charlie do next as a scientist?']
      : [
          'Which variable should Charlie change while keeping others the same?',
          'What evidence best supports Charlie’s prediction?',
          'What should Charlie test to compare two ideas fairly?',
        ];

  return {
    scenarioText: scenario,
    questionText: stems[seed % stems.length],
    hint: 'Scientists use evidence and change one thing at a time.',
    skillTags: [...(override.skillTags ?? q.skillTags), 'Science Reasoning'],
    _choiceSet: {
      best,
      plausibleIncomplete: 'Observe once without recording the result',
      plausibleFlawed: 'Change two variables at the same time',
      obviousWrong: 'Skip testing and guess from memory',
    },
  };
}

// --- B-4 ---

function upgradeB4(
  q: NormalizedQuestion,
  override: StagingQuestionOverride,
): Partial<StagingQuestionOverride> & { _choiceSet: ChoiceSet } {
  const scenario = ensureScenarioDepth(
    override.scenarioText ?? q.scenarioText,
    'b4',
    q.gradeBand,
    q.missionTitle,
  );
  const best = override.choices[override.correctIndex];
  const seed = hashSeed(q.questionId);

  const stems =
    q.gradeBand === 'K-1'
      ? ['What feeling might B-4 name from these clues?']
      : [
          'Which coping step fits best after naming the feeling?',
          'Which two strategies compare well for this moment?',
          'What should B-4 try first before choosing a bigger response?',
        ];

  return {
    scenarioText: scenario,
    questionText: stems[seed % stems.length],
    hint: 'Name the feeling, then compare calm-down strategies.',
    skillTags: [...(override.skillTags ?? q.skillTags), 'Self-Regulation', 'SEL'],
    _choiceSet: {
      best,
      plausibleIncomplete: 'A calm strategy used before naming the feeling',
      plausibleFlawed: 'A strategy that helps a little but ignores body signals',
      obviousWrong: 'Ignore the feeling and keep going',
    },
  };
}

type UpgradePartial = Partial<StagingQuestionOverride> & { _choiceSet?: ChoiceSet };

export function upgradeQuestionForDifficulty(
  q: NormalizedQuestion,
  override: StagingQuestionOverride,
): StagingQuestionOverride {
  let partial: UpgradePartial;

  switch (q.character) {
    case 'caiden':
      partial = upgradeCaiden(q, override);
      break;
    case 'miranda':
      partial = upgradeMiranda(q, override);
      break;
    case 'zeke':
      partial = upgradeZeke(q, override);
      break;
    case 'charlie':
      partial = upgradeCharlie(q, override);
      break;
    case 'b4':
      partial = upgradeB4(q, override);
      break;
    default:
      partial = {};
  }

  const choiceSet = partial._choiceSet;
  const correctIndex = override.correctIndex;
  let choices = choiceSet
    ? buildChoices(choiceSet, correctIndex)
    : override.choices;

  choices = choices.map((c) => (isJokeOrImpossible(c) ? 'A step that does not fit the scenario' : c)) as [
    string,
    string,
    string,
    string,
  ];
  choices = balanceChoiceLengths(choices, correctIndex);

  const { _choiceSet: _, ...rest } = partial;

  return {
    ...override,
    ...rest,
    choices,
    correctIndex,
    contentVersion: 'adaptive_staging_v4_difficulty',
    rewriteNotes: `${override.rewriteNotes}; v4 difficulty upgrade`,
  };
}
