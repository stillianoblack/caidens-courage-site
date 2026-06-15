import type { StagingQuestionOverride } from './types';

/** Enriched passages — answers require reading these details. */
export const MIRANDA_PASSAGES: Record<string, string> = {
  'miranda-mystery-file-1':
    'Before Focus Flame began, students kept asking, "What are we doing next?" Miranda studied the front board and noticed the morning schedule card was gone. She remembered the teacher carrying a stack of folders from the board area to the reading table. Miranda walked to the reading table, lifted the folders carefully, and found one corner of the schedule card tucked underneath. She matched the card to the board space and saw that math workshop came before snack break.',
  'miranda-mystery-file-2':
    'After the ceremony, Miranda scanned the line and realized Caiden was missing. His notebook lay open on a chair, and his water bottle had rolled under the table. Miranda heard a faint sound near the hallway but did not run alone. She told the facilitator what she saw, pointed to the belongings, and helped the group retrace the last place Caiden had been seen near the stage doors.',
  'miranda-mystery-file-3':
    'Miranda found a clue note on the floor with one smudged word: "Meet by the ____ after lunch." Beside the blank was a small sketch of branches, leaves, and a curved trunk. Miranda compared the drawing to places around school—the cafeteria door, the library steps, and the old tree near the playground. The trunk sketch matched the playground tree, and the note mentioned lunch, which happens right before recess at that tree.',
};

type MirandaEnhancement = {
  questionText: string;
  choices: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  hint: string;
  skillTags: string[];
};

const MIRANDA_ENHANCEMENTS: Record<string, MirandaEnhancement> = {
  'ms-k1-q1': {
    questionText: 'According to the passage, what was missing from the board?',
    choices: ['A lunch box', 'The schedule card', 'A pencil', 'A backpack'],
    correctIndex: 1,
    hint: 'Reread the sentence about what Miranda noticed on the board.',
    skillTags: ['Reading Comprehension', 'Evidence'],
  },
  'ms-k1-q2': {
    questionText: 'Where does the passage say Miranda found the card?',
    choices: ['On the playground', 'Under the folders', 'In the cafeteria', 'In a backpack'],
    correctIndex: 1,
    hint: 'Find the sentence about the reading table.',
    skillTags: ['Sequencing', 'Evidence'],
  },
  'ms-k1-q3': {
    questionText: 'Which sentence from the passage best explains why students were confused?',
    choices: [
      'They wanted lunch early',
      'They kept asking what was next',
      'The lights were off',
      'Miranda was reading',
    ],
    correctIndex: 1,
    hint: 'What did students say before Miranda searched?',
    skillTags: ['Inference', 'Evidence'],
  },
  'ms-23-q1': {
    questionText: 'According to the passage, what was missing from the board?',
    choices: ['A lunch box', 'The schedule card', 'A pencil', 'A backpack'],
    correctIndex: 1,
    hint: 'Look for what Miranda noticed was gone.',
    skillTags: ['Reading Comprehension', 'Evidence'],
  },
  'ms-23-q2': {
    questionText: 'Which detail tells where Miranda found the card?',
    choices: ['Under the folders', 'In the cafeteria', 'On the playground', 'Inside a backpack'],
    correctIndex: 0,
    hint: 'Find the place near the reading table.',
    skillTags: ['Sequencing', 'Evidence'],
  },
  'ms-23-q3': {
    questionText: 'Why were students confused, based on the passage?',
    choices: [
      'They did not know what was next',
      'They lost their pencils',
      'They wanted lunch',
      'They were tired',
    ],
    correctIndex: 0,
    hint: 'What question did students keep asking?',
    skillTags: ['Inference', 'Evidence'],
  },
  'ms-45-q1': {
    questionText: 'Which detail first showed Miranda what the problem was?',
    choices: [
      'Students were asking what came next',
      'The teacher was absent',
      'The lights were off',
      'Students were running outside',
    ],
    correctIndex: 0,
    hint: 'Find the clue that showed students were unsure.',
    skillTags: ['Evidence', 'Reading Comprehension'],
  },
  'ms-45-q2': {
    questionText: 'Which evidence helped Miranda find the schedule card?',
    choices: [
      'The teacher carrying folders from the board area',
      'A noise in the hallway',
      'A note on the door',
      'A student pointing at the playground',
    ],
    correctIndex: 0,
    hint: 'What movement did Miranda remember seeing?',
    skillTags: ['Evidence', 'Inference'],
  },
  'ms-45-q3': {
    questionText: 'What trait does Miranda show in the passage?',
    choices: ['Careful observation', 'Guessing', 'Avoiding the problem', 'Anger'],
    correctIndex: 0,
    hint: 'How did she search instead of interrupting?',
    skillTags: ['Inference', 'Character'],
  },
  'ms-68-q1': {
    questionText: 'Which evidence best supports where the schedule card went?',
    choices: [
      'The card corner visible beneath the folders',
      'Students sitting quietly',
      'The cafeteria was closed',
      'The clock was broken',
    ],
    correctIndex: 0,
    hint: 'Find the strongest physical evidence in the passage.',
    skillTags: ['Evidence', 'Analysis'],
  },
  'ms-68-q2': {
    questionText: 'Why does the missing schedule matter in this passage?',
    choices: [
      'It makes transitions less predictable',
      'It changes lunch time',
      'It makes the room colder',
      'It helps students ignore directions',
    ],
    correctIndex: 0,
    hint: 'What does the schedule help students prepare for?',
    skillTags: ['Inference'],
  },
  'ms-68-q3': {
    questionText: 'In this passage, what does “inferred” mean?',
    choices: [
      'Used clues to reach a conclusion',
      'Guessed without evidence',
      'Asked someone to leave',
      'Forgot important details',
    ],
    correctIndex: 0,
    hint: 'How did Miranda combine clues about the folders?',
    skillTags: ['Vocabulary', 'Inference'],
  },
  'mst-k1-q1': {
    questionText: 'According to the passage, who was missing from the line?',
    choices: ['Miranda', 'Caiden', 'Charlie', 'B-4'],
    correctIndex: 1,
    hint: 'Find who was not in the line after the ceremony.',
    skillTags: ['Reading Comprehension', 'Evidence'],
  },
  'mst-k1-q2': {
    questionText: 'What did Miranda see on the chair in the passage?',
    choices: ['A snack', 'Caiden’s notebook', 'A toy', 'A jacket'],
    correctIndex: 1,
    hint: 'What belonged to Caiden at his seat?',
    skillTags: ['Evidence'],
  },
  'mst-k1-q3': {
    questionText: 'Which action in the passage shows Miranda made a safe choice?',
    choices: ['She told an adult', 'She ran alone', 'She ignored it', 'She hid'],
    correctIndex: 0,
    hint: 'What did she do after hearing the hallway sound?',
    skillTags: ['Safety', 'Inference', 'Evidence'],
  },
  'mst-23-q1': {
    questionText: 'Who was missing from the line, according to the passage?',
    choices: ['Miranda', 'Caiden', 'Charlie', 'B-4'],
    correctIndex: 1,
    hint: 'Read the first sentence about the ceremony.',
    skillTags: ['Reading Comprehension'],
  },
  'mst-23-q2': {
    questionText: 'Which object on the chair is named in the passage?',
    choices: ['Caiden’s notebook', 'A snack', 'A jacket', 'A map'],
    correctIndex: 0,
    hint: 'Find what Miranda saw on the chair.',
    skillTags: ['Evidence'],
  },
  'mst-23-q3': {
    questionText: 'What safe choice did Miranda make in the passage?',
    choices: ['She told an adult', 'She ran alone', 'She waited and hoped', 'She ignored it'],
    correctIndex: 0,
    hint: 'What did she do instead of searching alone?',
    skillTags: ['Safety', 'Inference'],
  },
  'mst-45-q1': {
    questionText: 'Which clue suggests Caiden left quickly?',
    choices: [
      'His notebook and water bottle were left behind',
      'He packed his bag neatly',
      'Miranda found a map',
      'The lights turned off',
    ],
    correctIndex: 0,
    hint: 'What was still at his seat?',
    skillTags: ['Evidence', 'Inference'],
  },
  'mst-45-q2': {
    questionText: 'Why did Miranda tell the facilitator, based on the passage?',
    choices: [
      'It was the safest choice',
      'She wanted to hide',
      'She was finished observing',
      'She knew where Caiden was',
    ],
    correctIndex: 0,
    hint: 'What did she do instead of searching alone?',
    skillTags: ['Safety', 'Evidence'],
  },
  'mst-45-q3': {
    questionText: 'In the passage, what does “retrace” mean?',
    choices: ['Follow back through the steps', 'Draw a picture', 'Skip the activity', 'Make a guess'],
    correctIndex: 0,
    hint: 'Miranda helped follow Caiden’s path.',
    skillTags: ['Vocabulary'],
  },
  'mst-68-q1': {
    questionText: 'Which detail is the strongest physical evidence in the passage?',
    choices: [
      'Caiden’s belongings were left behind',
      'The ceremony had just ended',
      'Miranda reported to the facilitator',
      'Miranda identified the last location',
    ],
    correctIndex: 0,
    hint: 'What was left at the seat?',
    skillTags: ['Evidence', 'Analysis'],
  },
  'mst-68-q2': {
    questionText: 'What does Miranda’s response in the passage show?',
    choices: [
      'She understands safety and responsibility',
      'She wants to solve the mystery alone',
      'She assumes Caiden left on purpose',
      'She waits for others to notice',
    ],
    correctIndex: 0,
    hint: 'How did she involve adults?',
    skillTags: ['Inference', 'Character'],
  },
  'mst-68-q3': {
    questionText: 'Why is “last confirmed location” important in the passage?',
    choices: [
      'It helps adults know where to begin checking',
      'It proves Caiden was hiding',
      'It replaces asking for help',
      'It makes the mystery harder',
    ],
    correctIndex: 0,
    hint: 'How does this help the facilitator search?',
    skillTags: ['Analysis'],
  },
  'mcl-k1-q1': {
    questionText: 'According to the passage, what was missing from the note?',
    choices: ['A word', 'A pencil', 'A backpack', 'A snack'],
    correctIndex: 0,
    hint: 'Look at the blank in the sentence.',
    skillTags: ['Reading Comprehension', 'Evidence'],
  },
  'mcl-k1-q2': {
    questionText: 'What picture helped Miranda according to the passage?',
    choices: ['A tree', 'A chair', 'A shoe', 'A clock'],
    correctIndex: 0,
    hint: 'What did Miranda see beside the note?',
    skillTags: ['Context Clues', 'Evidence'],
  },
  'mcl-k1-q3': {
    questionText: 'Which word completed the note in the passage?',
    choices: ['tree', 'lunch', 'book', 'door'],
    correctIndex: 0,
    hint: 'Match the picture to the blank.',
    skillTags: ['Vocabulary', 'Inference'],
  },
  'mcl-23-q1': {
    questionText: 'What was missing from the note in the passage?',
    choices: ['A word', 'A pencil', 'A backpack', 'A snack'],
    correctIndex: 0,
    hint: 'Look at the blank in the sentence.',
    skillTags: ['Reading Comprehension'],
  },
  'mcl-23-q2': {
    questionText: 'Which picture helped Miranda solve the clue?',
    choices: ['A tree', 'A chair', 'A shoe', 'A clock'],
    correctIndex: 0,
    hint: 'What was beside the note?',
    skillTags: ['Context Clues', 'Evidence'],
  },
  'mcl-23-q3': {
    questionText: 'What word completed the note according to the passage?',
    choices: ['tree', 'lunch', 'book', 'door'],
    correctIndex: 0,
    hint: 'Match the drawing to the blank.',
    skillTags: ['Vocabulary', 'Inference'],
  },
  'mcl-45-q1': {
    questionText: 'What helped Miranda figure out the missing word?',
    choices: [
      'The drawing of branches and leaves',
      'A loud bell',
      'A lunch tray',
      'A classroom door',
    ],
    correctIndex: 0,
    hint: 'What visual clue was beside the note?',
    skillTags: ['Context Clues', 'Evidence'],
  },
  'mcl-45-q2': {
    questionText: 'In the passage, what does “smudged” mean?',
    choices: ['Blurry or rubbed away', 'Very loud', 'Easy to hear', 'Carefully folded'],
    correctIndex: 0,
    hint: 'The word could not be read clearly.',
    skillTags: ['Vocabulary'],
  },
  'mcl-45-q3': {
    questionText: 'Where did the clue probably point, based on the passage?',
    choices: [
      'The tree near the playground',
      'The cafeteria sink',
      'The library desk',
      'The gym closet',
    ],
    correctIndex: 0,
    hint: 'Where would branches and leaves be found?',
    skillTags: ['Inference', 'Evidence'],
  },
  'mcl-68-q1': {
    questionText: 'Which clue most strongly supports the meeting place?',
    choices: [
      'The sketch of branches, leaves, and trunk',
      'The word lunch',
      'The note being on the floor',
      'The sentence being short',
    ],
    correctIndex: 0,
    hint: 'Which clue describes a physical place?',
    skillTags: ['Evidence', 'Analysis'],
  },
  'mcl-68-q2': {
    questionText: 'What strategy did Miranda use in the passage?',
    choices: ['Context clues', 'Ignoring evidence', 'One clue only', 'Asking everyone to stop'],
    correctIndex: 0,
    hint: 'She combined the sentence and drawing.',
    skillTags: ['Context Clues', 'Inference'],
  },
  'mcl-68-q3': {
    questionText: 'In this passage, what does “intended” mean?',
    choices: ['Planned or meant', 'Forgotten', 'Missing from view', 'Broken'],
    correctIndex: 0,
    hint: 'What did the note writer mean to say?',
    skillTags: ['Vocabulary', 'Inference'],
  },
};

export function enhanceMirandaOverride(override: StagingQuestionOverride): StagingQuestionOverride {
  const passage = MIRANDA_PASSAGES[override.missionId];
  const enhancement = MIRANDA_ENHANCEMENTS[override.questionId];
  if (!passage || !enhancement) return override;

  return {
    ...override,
    scenarioText: passage,
    questionText: enhancement.questionText,
    choices: enhancement.choices,
    correctIndex: enhancement.correctIndex,
    hint: enhancement.hint,
    skillTags: enhancement.skillTags,
    contentVersion: 'adaptive_staging_v3_final',
    rewriteNotes: `${override.rewriteNotes}; v3 Miranda evidence pass`,
  };
}
