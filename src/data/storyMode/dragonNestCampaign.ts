export type StoryQuestionCategory =
  | 'recall'
  | 'sequencing'
  | 'cause_effect'
  | 'character_motivation'
  | 'inference'
  | 'emotional_comprehension'
  | 'sel_application'
  | 'theme';

export type StoryQuestGradeBand = '3-4' | '5-6' | '7+';

export type StoryQuestionVariant = {
  prompt: string;
  answers: string[];
  correctAnswer: string;
  hint: string;
  b4Feedback: string;
  explanation?: string;
};

export type StoryQuestQuestion = {
  id: string;
  chapterId: string;
  storyMoment: string;
  category: StoryQuestionCategory;
  visualMode: 'scene' | 'compact' | 'none';
  storyImage?: string;
  storyImageAlt?: string;
  contentStatus: 'playable' | 'needs_canon_detail';
  canonNeed?: string;
  variants: Record<StoryQuestGradeBand, StoryQuestionVariant>;
};

export type StoryComicPanel = {
  id: string;
  image: string;
  alt: string;
  narration: string;
};

export type StoryDialogueLine = {
  id: string;
  characterName: string;
  portrait: string;
  text: string;
};

/** Retained for legacy Story Mode cards that may be reused by later campaigns. */
export type StoryChoice = {
  id: string;
  prompt: string;
  options: string[];
};

export type StoryChapter = {
  id: string;
  title: string;
  description: string;
  focus: string;
  coverImage: string;
  comicPanels: StoryComicPanel[];
  dialogue: StoryDialogueLine[];
  guideMessage: string;
  focusClue: string;
  contentStatus: 'playable' | 'placeholder';
  questionIds: string[];
};

export type StoryQuestCampaign = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  chapters: StoryChapter[];
  questions: StoryQuestQuestion[];
};

const caidenPortrait = '/images/characters/caiden_photo_icon_game.webp';
const b4Portrait = '/images/caidenscourage/Character Hub/b-4_photo_icon_game.webp';

function variants(input: {
  simple: string;
  middle: string;
  advanced: string;
  answers: string[];
  correct: string;
  hint: string;
  feedback: string;
}): Record<StoryQuestGradeBand, StoryQuestionVariant> {
  const make = (prompt: string): StoryQuestionVariant => ({
    prompt,
    answers: input.answers,
    correctAnswer: input.correct,
    hint: input.hint,
    b4Feedback: input.feedback,
  });
  return { '3-4': make(input.simple), '5-6': make(input.middle), '7+': make(input.advanced) };
}

const chapterSpecs = [
  {
    id: 'chapter-1', title: 'Welcome to Courage Camp',
    description: 'Meet Caiden at Courage Camp and discover why this new beginning matters.',
    focus: 'Setting, characters, why Caiden is there, and the beginning of his journey.',
    coverImage: '/images/camp-courage/explore-inside-camp-courage.webp',
    panels: [
      ['arrival', '/images/camp-courage/explore-inside-camp-courage.webp', 'Courage Camp environment', '[CANON CONTENT REQUIRED] Add the approved Chapter 1 story scene from the graphic novel.'],
    ],
    dialogue: [
      ['b4', 'B-4', b4Portrait, '[CANON CONTENT REQUIRED] Add B-4’s approved Chapter 1 dialogue from the graphic novel.'],
    ],
    guideMessage: 'Think back to Caiden’s first moments at Courage Camp. I’ll help you notice what happened.',
    focusClue: '[CANON CONTENT REQUIRED]',
    contentStatus: 'placeholder' as const,
  },
  {
    id: 'chapter-2', title: 'Courage in the Dark',
    description: 'During a storm, Caiden follows a strange sound into the woods and meets Charlie Perk.',
    focus: 'The storm, uncertainty, careful exploration, and Caiden’s encounter with Charlie Perk.',
    coverImage: '/images/caidenscourage/Game-Hub/courage-in-the-dark.webp',
    panels: [['dark', '/images/caidenscourage/Game-Hub/courage-in-the-dark.webp', 'Caiden exploring during the storm', 'Caiden hears something strange, steps outside, and carefully follows the sound into the woods.']],
    dialogue: [['b4', 'B-4', b4Portrait, 'Caiden feels nervous and unsure, but he stays alert and keeps exploring carefully.']],
    guideMessage: 'When everything changes, look for the clue that helps Caiden steady himself.',
    focusClue: 'Uncertainty does not remove your ability to choose a next step.',
    contentStatus: 'playable' as const,
  },
  {
    id: 'chapter-3', title: 'Into the Cave',
    description: 'Caiden explores the cave, follows clues, and discovers that something larger is happening.',
    focus: 'Exploration, clues, B-4, Job, and the deeper mystery.',
    coverImage: '/images/focus-flame-lab/thecave_block_image.webp',
    panels: [['cave', '/images/focus-flame-lab/thecave_block_image.webp', 'The cave from Caiden’s adventure', '[CANON PLACEHOLDER] Add the approved cave exploration and meeting Job scene.']],
    dialogue: [['b4', 'B-4', b4Portrait, '[CANON PLACEHOLDER] Add the approved Focus Clue for entering the cave.']],
    guideMessage: 'Details become clues when Caiden pauses long enough to notice them.',
    focusClue: 'Careful observation can reveal what fear tries to hide.',
    contentStatus: 'placeholder' as const,
  },
  {
    id: 'chapter-4', title: 'The Dragon’s Nest',
    description: 'The baby dragon changes what Caiden understands about the conflict around him.',
    focus: 'The baby dragon, Leviathan, Behemoth, assumptions, and the real conflict.',
    coverImage: '/images/characters/dragon_img_profile.webp',
    panels: [['dragon', '/images/characters/dragon_img_profile.webp', 'A dragon from Caiden’s world', '[CANON PLACEHOLDER] Add the approved Dragon’s Nest reveal with Leviathan and Behemoth.']],
    dialogue: [['b4', 'B-4', b4Portrait, '[CANON PLACEHOLDER] Add B-4’s approved response to the baby dragon discovery.']],
    guideMessage: 'A first assumption is not always the whole story. Look again.',
    focusClue: 'Understanding grows when you test assumptions against new clues.',
    contentStatus: 'placeholder' as const,
  },
  {
    id: 'chapter-5', title: 'What Courage Means',
    description: 'Caiden’s goal changes as he realizes courage can mean helping and protecting others.',
    focus: 'Courage is not simply defeating an enemy; Caiden chooses to help and save others.',
    coverImage: '/images/focus-flame-lab/theceremony_block_image.webp',
    panels: [['meaning', '/images/focus-flame-lab/theceremony_block_image.webp', 'A Focus Flame moment', '[CANON PLACEHOLDER] Add the approved moment when Caiden’s objective changes.']],
    dialogue: [['caiden', 'Caiden', caidenPortrait, '[CANON PLACEHOLDER] Add Caiden’s approved realization about courage.']],
    guideMessage: 'Watch how Caiden’s goal changes when he understands who needs help.',
    focusClue: 'Real courage can protect, understand, and help—not only fight.',
    contentStatus: 'placeholder' as const,
  },
  {
    id: 'chapter-6', title: 'The Journey Isn’t Over',
    description: 'Caiden reflects on how he has changed as a new mystery points beyond this adventure.',
    focus: 'Resolution, transformation, and the missing-parent cliffhanger.',
    coverImage: '/images/backgrounds/caidenvale_book_hero.webp',
    panels: [['cliffhanger', '/images/backgrounds/caidenvale_book_hero.webp', 'The world of Caiden Vale', '[CANON PLACEHOLDER] Add the approved resolution and missing-parent cliffhanger.']],
    dialogue: [['b4', 'B-4', b4Portrait, '[CANON PLACEHOLDER] Add B-4’s approved closing line.']],
    guideMessage: 'An ending can show how far Caiden has come—and point toward the next path.',
    focusClue: 'Growth changes how you enter the challenge that comes next.',
    contentStatus: 'placeholder' as const,
  },
] as const;

type ApprovedQuestionSpec = {
  chapter: number;
  number: number;
  category: StoryQuestionCategory;
  prompt: string;
  canonNeed: string;
};

const approvedQuestionSpecs: ApprovedQuestionSpec[] = [
  { chapter: 1, number: 1, category: 'recall', prompt: 'Why is Caiden at Courage Camp?', canonNeed: 'Confirm Caiden’s exact reason for arriving and build canon-based distractors.' },
  { chapter: 1, number: 2, category: 'emotional_comprehension', prompt: 'How does Caiden react to being in a new and unfamiliar environment?', canonNeed: '' },
  { chapter: 1, number: 3, category: 'recall', prompt: 'What makes it difficult for Caiden to focus when he first arrives?', canonNeed: 'Confirm the exact sensory details shown in the Chapter 1 scene.' },
  { chapter: 1, number: 4, category: 'recall', prompt: 'Who becomes Caiden’s guide and companion?', canonNeed: '' },
  { chapter: 1, number: 5, category: 'inference', prompt: 'What does Caiden do early in the story that shows he is willing to keep going even when he feels uncertain?', canonNeed: 'Confirm Caiden’s specific opening actions and build evidence-based choices.' },
  { chapter: 2, number: 6, category: 'cause_effect', prompt: 'Why did Caiden step outside during the storm?', canonNeed: '' },
  { chapter: 2, number: 7, category: 'emotional_comprehension', prompt: 'How did Caiden feel when he heard the strange noise?', canonNeed: '' },
  { chapter: 2, number: 8, category: 'sequencing', prompt: 'What did Caiden do even though he felt nervous?', canonNeed: '' },
  { chapter: 2, number: 9, category: 'inference', prompt: 'When Caiden heard an unfamiliar voice, what was the best thing for him to do first?', canonNeed: '' },
  { chapter: 2, number: 10, category: 'emotional_comprehension', prompt: 'After Caiden discovers Charlie Perk, what emotions might he be feeling?', canonNeed: '' },
  { chapter: 3, number: 11, category: 'recall', prompt: 'Where does Caiden go as the adventure moves away from camp?', canonNeed: 'Confirm the transition into the cave sequence.' },
  { chapter: 3, number: 12, category: 'recall', prompt: 'Who does Caiden encounter while exploring the cave?', canonNeed: 'Confirm whether and when Job appears.' },
  { chapter: 3, number: 13, category: 'inference', prompt: 'What does Caiden discover that makes him realize the situation is bigger than he originally thought?', canonNeed: 'Supply the exact cave discovery.' },
  { chapter: 3, number: 14, category: 'sequencing', prompt: 'What happens before Caiden learns the truth about the dragon?', canonNeed: 'Confirm the book’s event order.' },
  { chapter: 3, number: 15, category: 'character_motivation', prompt: 'Why does Caiden continue deeper into the situation instead of simply turning away?', canonNeed: 'Confirm Caiden’s stated or demonstrated motivation.' },
  { chapter: 4, number: 16, category: 'recall', prompt: 'What does Caiden discover about the baby dragon?', canonNeed: 'Supply the exact discovery.' },
  { chapter: 4, number: 17, category: 'character_motivation', prompt: 'Why does the baby dragon become important to Caiden?', canonNeed: 'Confirm the story event that establishes this motivation.' },
  { chapter: 4, number: 18, category: 'inference', prompt: 'What does Caiden initially misunderstand about Leviathan and Behemoth?', canonNeed: 'Confirm Caiden’s original misunderstanding.' },
  { chapter: 4, number: 19, category: 'cause_effect', prompt: 'What new information changes Caiden’s understanding of the conflict?', canonNeed: 'Supply the confirmed reveal.' },
  { chapter: 4, number: 20, category: 'inference', prompt: 'How does Caiden’s goal change after he understands what is really happening?', canonNeed: 'Confirm Caiden’s resulting decision.' },
  { chapter: 5, number: 21, category: 'inference', prompt: 'What is Caiden trying to accomplish near the end of the story?', canonNeed: 'Confirm Caiden’s exact goal.' },
  { chapter: 5, number: 22, category: 'recall', prompt: 'How does Caiden help the baby dragon?', canonNeed: 'Supply Caiden’s exact action.' },
  { chapter: 5, number: 23, category: 'recall', prompt: 'What does Caiden do to help reunite the dragon with Leviathan and Behemoth?', canonNeed: 'Supply the real action and canon-based distractors.' },
  { chapter: 5, number: 24, category: 'character_motivation', prompt: 'Why does Caiden stop treating the situation as something he simply has to defeat?', canonNeed: 'Confirm Caiden’s motivation and the direct story evidence.' },
  { chapter: 5, number: 25, category: 'inference', prompt: 'Which action best shows how Caiden has changed since the beginning of the story?', canonNeed: 'Confirm paired story actions.' },
  { chapter: 6, number: 26, category: 'sequencing', prompt: 'What happens after Caiden resolves the conflict involving the dragons?', canonNeed: 'Confirm the immediate story resolution.' },
  { chapter: 6, number: 27, category: 'inference', prompt: 'How is Caiden different at the end of the story than he was at the beginning?', canonNeed: 'Confirm paired opening and ending evidence.' },
  { chapter: 6, number: 28, category: 'recall', prompt: 'What does Caiden discover when he returns that creates a new problem?', canonNeed: 'Confirm the finalized missing-parent reveal and wording.' },
  { chapter: 6, number: 29, category: 'inference', prompt: 'What does the ending suggest Caiden will need to do next?', canonNeed: 'Confirm the ending details needed for prediction choices.' },
  { chapter: 6, number: 30, category: 'theme', prompt: 'Which event from the story best shows what Caiden has learned about courage?', canonNeed: 'Build choices from confirmed events across the complete story.' },
];

const unresolvedVariants = (prompt: string): Record<StoryQuestGradeBand, StoryQuestionVariant> => variants({
  simple: prompt,
  middle: prompt,
  advanced: prompt,
  answers: [],
  correct: '',
  hint: 'NEEDS CANON DETAIL',
  feedback: 'NEEDS CANON DETAIL',
});

const playableChapterOne: Record<number, Record<StoryQuestGradeBand, StoryQuestionVariant>> = {
  1: variants({
    simple: 'How does Caiden feel when he first arrives at Courage Camp?',
    middle: 'How does Caiden feel when he first arrives at Courage Camp?',
    advanced: 'How does Caiden feel when he first arrives at Courage Camp?',
    answers: ['Relaxed because the camp feels familiar', 'Nervous and overwhelmed', 'Bored and ready to leave', 'Excited because he already knows everyone'],
    correct: 'Nervous and overwhelmed',
    hint: 'Think back to how the new surroundings affect Caiden when he arrives.',
    feedback: 'Right. Courage Camp is new, loud, and unfamiliar to Caiden, so he feels overwhelmed at first.',
  }),
  2: variants({
    simple: 'What makes it difficult for Caiden to focus when he first gets to camp?',
    middle: 'What makes it difficult for Caiden to focus when he first gets to camp?',
    advanced: 'What makes it difficult for Caiden to focus when he first gets to camp?',
    answers: ['He forgot why he came to camp', 'He is trying to fall asleep', 'There is a lot happening around him at once', 'Nobody at camp will speak to him'],
    correct: 'There is a lot happening around him at once',
    hint: 'Think back to what was happening around Caiden when he arrived.',
    feedback: 'Exactly. There’s a lot for Caiden’s brain to notice at the same time.',
  }),
  3: variants({
    simple: 'Who becomes Caiden’s guide as his adventure begins?',
    middle: 'Who becomes Caiden’s guide as his adventure begins?',
    advanced: 'Who becomes Caiden’s guide as his adventure begins?',
    answers: ['Leviathan', 'B-4', 'The baby dragon', 'Job'],
    correct: 'B-4',
    hint: 'Think about the companion who stays beside Caiden as the adventure begins.',
    feedback: 'That’s me! B-4 helps Caiden notice what matters and keep moving through the adventure.',
  }),
  4: variants({
    simple: 'What changes Caiden’s ordinary day at Courage Camp into something much more dangerous?',
    middle: 'What changes Caiden’s ordinary day at Courage Camp into something much more dangerous?',
    advanced: 'What changes Caiden’s ordinary day at Courage Camp into something much more dangerous?',
    answers: ['Caiden gets lost during a game', 'A storm and earthquake', 'Everyone decides to leave camp early', 'A camp competition begins'],
    correct: 'A storm and earthquake',
    hint: 'Think about the sudden event that changes everything happening at camp.',
    feedback: 'Correct. The storm and earthquake change everything and push Caiden into the larger adventure.',
  }),
  5: variants({
    simple: 'Even though Caiden feels unsure, what does he do as things around him begin to change?',
    middle: 'Even though Caiden feels unsure, what does he do as things around him begin to change?',
    advanced: 'Even though Caiden feels unsure, what does he do as things around him begin to change?',
    answers: ['He decides nothing around him matters', 'He keeps moving forward and responds to what is happening', 'He immediately leaves everyone behind and goes home', 'He ignores everything and goes to sleep'],
    correct: 'He keeps moving forward and responds to what is happening',
    hint: 'Think about whether Caiden stops or continues when the situation changes.',
    feedback: 'Exactly. Caiden doesn’t suddenly stop feeling unsure—he keeps going even while things feel uncertain.',
  }),
};

const playableChapterTwo: Record<number, Record<StoryQuestGradeBand, StoryQuestionVariant>> = {
  6: variants({
    simple: 'Why did Caiden step outside during the storm?',
    middle: 'Why did Caiden step outside during the storm?',
    advanced: 'Why did Caiden step outside during the storm?',
    answers: ['He wanted to play', 'He heard something strange', 'He lost his backpack', 'Someone told him to'],
    correct: 'He heard something strange',
    hint: 'Think about what caught Caiden’s attention during the storm.',
    feedback: 'Right. Caiden heard something strange outside and decided to find out what it was.',
  }),
  7: variants({
    simple: 'How did Caiden feel when he heard the strange noise?',
    middle: 'How did Caiden feel when he heard the strange noise?',
    advanced: 'How did Caiden feel when he heard the strange noise?',
    answers: ['Calm', 'Excited only', 'Nervous and unsure', 'Angry'],
    correct: 'Nervous and unsure',
    hint: 'Think about how Caiden felt when he did not know what was outside.',
    feedback: 'Exactly. Caiden wasn’t sure what was out there, and that made him nervous.',
  }),
  8: variants({
    simple: 'What did Caiden do even though he felt nervous?',
    middle: 'What did Caiden do even though he felt nervous?',
    advanced: 'What did Caiden do even though he felt nervous?',
    answers: ['Ignored everything', 'Stayed hidden', 'Continued exploring carefully', 'Ran away immediately'],
    correct: 'Continued exploring carefully',
    hint: 'Think about whether Caiden stopped or kept looking for the source of the sound.',
    feedback: 'Right. Caiden was nervous, but he kept exploring carefully to find out what was happening.',
  }),
  9: variants({
    simple: 'When Caiden heard an unfamiliar voice, what was the best thing for him to do first?',
    middle: 'When Caiden heard an unfamiliar voice, what was the best thing for him to do first?',
    advanced: 'When Caiden heard an unfamiliar voice, what was the best thing for him to do first?',
    answers: ['Panic', 'Ignore it completely', 'Stay alert and think carefully', 'Yell loudly'],
    correct: 'Stay alert and think carefully',
    hint: 'Think about how Caiden could learn who was speaking without rushing.',
    feedback: 'Exactly. Caiden didn’t know who the voice belonged to yet, so staying alert helped him figure out what was happening.',
  }),
  10: variants({
    simple: 'After Caiden discovers Charlie Perk, what emotions might he be feeling?',
    middle: 'After Caiden discovers Charlie Perk, what emotions might he be feeling?',
    advanced: 'After Caiden discovers Charlie Perk, what emotions might he be feeling?',
    answers: ['Relief', 'Fear', 'Confusion', 'More than one of these at the same time'],
    correct: 'More than one of these at the same time',
    hint: 'Think about whether meeting someone unexpected can bring several feelings at once.',
    feedback: 'Exactly. Meeting Charlie could bring relief, fear, and confusion all at once. We can feel more than one emotion at the same time.',
  }),
};

const questions: StoryQuestQuestion[] = approvedQuestionSpecs.map((spec) => ({
  id: `dragon-nest-c${spec.chapter}-q${spec.number}`,
  chapterId: `chapter-${spec.chapter}`,
  storyMoment: spec.number === 2
    ? 'Caiden enters Courage Camp'
    : spec.number === 4
      ? 'B-4 guides Caiden'
      : `question-${spec.number}`,
  category: spec.category,
  visualMode: 'none',
  contentStatus: playableChapterOne[spec.number] || playableChapterTwo[spec.number]
    ? 'playable'
    : 'needs_canon_detail',
  canonNeed: spec.canonNeed || undefined,
  variants: playableChapterOne[spec.number]
    ?? playableChapterTwo[spec.number]
    ?? unresolvedVariants(spec.prompt),
}));

const chapters: StoryChapter[] = chapterSpecs.map((chapter, index) => ({
  id: chapter.id,
  title: chapter.title,
  description: chapter.description,
  focus: chapter.focus,
  coverImage: chapter.coverImage,
  comicPanels: chapter.panels.map(([suffix, image, alt, narration]) => ({ id: `${chapter.id}-${suffix}`, image, alt, narration })),
  dialogue: chapter.dialogue.map(([suffix, characterName, portrait, text]) => ({ id: `${chapter.id}-${suffix}`, characterName, portrait, text })),
  guideMessage: chapter.guideMessage,
  focusClue: chapter.focusClue,
  contentStatus: chapter.contentStatus,
  questionIds: questions.filter((question) => question.chapterId === chapter.id).map((question) => question.id),
}));

export const DRAGONS_NEST_CAMPAIGN: StoryQuestCampaign = {
  id: 'dragons-nest',
  title: 'Caiden Vale and the Focus Flame',
  subtitle: 'The Dragon’s Nest',
  badge: 'Story Quest',
  description: 'Play through Caiden’s adventure, follow the clues, and strengthen your Focus Flame.',
  chapters,
  questions,
};

export function resolveStoryQuestGradeBand(gradeLevel?: string | null): StoryQuestGradeBand {
  const numeric = Number.parseInt(String(gradeLevel ?? '').replace(/\D/g, ''), 10);
  if (!Number.isFinite(numeric)) return '5-6';
  if (numeric <= 4) return '3-4';
  if (numeric <= 6) return '5-6';
  return '7+';
}

export function getQuestionVariant(question: StoryQuestQuestion, band: StoryQuestGradeBand): StoryQuestionVariant {
  return question.variants[band];
}
