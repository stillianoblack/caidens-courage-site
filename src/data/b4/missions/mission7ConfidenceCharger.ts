import type { B4AdaptiveMissionFile } from '../../../types/b4AdaptiveQuest';
import { registerB4AdaptiveMission } from '../b4AdaptiveBuilder';
import { makeB4Question, bandContent } from '../b4QuestionHelpers';

export const B4_MISSION_7_ID = 'b4-confidence-charger';

const MODULE_ID = B4_MISSION_7_ID;
const MODULE_TITLE = 'Confidence Charger';
const SKILL = 'Confidence / Growth Mindset';

export const B4_MISSION_7_FILE: B4AdaptiveMissionFile = {
  id: MODULE_ID,
  title: 'B-4 Focus Missions',
  subtitle: MODULE_TITLE,
  character: 'b4',
  missionNumber: 7,
  skillArea: SKILL,
  skillFocus: ['Confidence', 'Growth Mindset', 'Self-Talk'],
  storySetup:
    'B-4\'s Confidence Charger is low. It charges when someone notices effort, tries again, and uses helpful self-talk.',
  missionB4Tip: 'Confidence grows when you try again, not when things are easy.',
  landing: {
    eyebrow: 'MISSION 7',
    title: 'B-4 Focus Missions',
    subtitle: MODULE_TITLE,
    body: 'The Confidence Charger is running low — pick words and moves that help you keep going.',
    cta: 'Start Mission',
  },
  complete: {
    title: 'Confidence Charger Full!',
    message: 'You practiced helpful self-talk and noticing progress. Confidence charges with effort.',
    badges: ['Try-Again Hero', 'Growth Thinker', 'Self-Talk Star'],
  },
  gradeContent: {
    'K-1': bandContent(
      'Try again when something feels hard.',
      [
        makeB4Question(
          {
            id: 'b4m7-k1-q1',
            question: 'A puzzle is hard. What can B-4 say?',
            choices: [
              'I can try one more piece',
              'I am bad at everything',
              'This puzzle is my enemy',
              'I will never try again',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Trying one more piece is brave and helpful.',
            incorrectFeedback: 'Try again. B-4 needs words that help you keep going.',
            hint: 'What words help when a puzzle is tricky?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeB4Question(
          {
            id: 'b4m7-k1-q2',
            question: 'Your block tower fell down. What can B-4 say?',
            choices: [
              'Try again, one block at a time',
              'Towers are impossible forever',
              'The blocks are being mean',
              'I quit building things',
            ],
            correctIndex: 0,
            correctFeedback: 'Nice. One block at a time charges confidence.',
            incorrectFeedback: 'Try again. B-4 wants words that help you rebuild.',
            hint: 'What helps after a tower falls?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeB4Question(
          {
            id: 'b4m7-k1-q3',
            question: 'What charges the Confidence Charger?',
            choices: [
              'Trying again even when it is hard',
              'Never making any mistakes',
              'Only doing easy things',
              'Waiting until someone else does it',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Effort and trying again fill the charger.',
            incorrectFeedback: 'Not quite. Confidence grows when you try, not when you quit.',
            hint: 'What makes B-4\'s charger light up?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
      ],
      SKILL,
    ),
    '2-3': bandContent(
      'Use encouraging words when mistakes happen.',
      [
        makeB4Question(
          {
            id: 'b4m7-23-q1',
            question: 'A student makes a mistake while reading. What self-talk helps?',
            choices: [
              'Mistakes help me learn',
              'I should stop reading forever',
              'Everyone is better than me',
              'The book is rude',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Helpful self-talk keeps the brain open to learning.',
            incorrectFeedback: 'Not quite. B-4 chooses words that help, not hurt.',
            hint: 'What can you tell yourself after a reading mistake?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeB4Question(
          {
            id: 'b4m7-23-q2',
            question: 'A math problem feels tricky. What self-talk helps?',
            choices: [
              'I can figure this out step by step',
              'I am terrible at math forever',
              'Math is my arch-enemy',
              'I should never ask questions',
            ],
            correctIndex: 0,
            correctFeedback: 'Good self-talk. Step by step keeps your brain in the game.',
            incorrectFeedback: 'Try again. B-4 wants words that help you keep trying.',
            hint: 'What words help when math feels hard?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeB4Question(
          {
            id: 'b4m7-23-q3',
            question: 'Someone says "You can\'t do it." What helps in your head?',
            choices: [
              'I can practice and improve',
              'They are right, so I should quit',
              'I will never try hard things',
              'Only perfect people can learn',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Practice is how skills grow.',
            incorrectFeedback: 'Not quite. B-4 knows effort beats doubt.',
            hint: 'What thought helps when someone doubts you?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
      ],
      SKILL,
    ),
    '4-5': bandContent(
      'Notice progress instead of only seeing mistakes.',
      [
        makeB4Question(
          {
            id: 'b4m7-45-q1',
            question: 'How can a student build confidence after struggling?',
            choices: [
              'Notice one piece of progress',
              'Only focus on what went wrong',
              'Compare themselves to everyone',
              'Quit before feedback',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Progress is proof that effort is working.',
            incorrectFeedback: 'Try again. Confidence needs evidence, not comparison.',
            hint: 'What helps after a tough struggle?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeB4Question(
          {
            id: 'b4m7-45-q2',
            question: 'You failed the first attempt at a presentation. What is growth mindset?',
            choices: [
              'Learn from it and practice again',
              'I am just bad at this forever',
              'Presentations are impossible for me',
              'Pretend it went perfectly',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. A first attempt is data, not a final grade.',
            incorrectFeedback: 'Try again. Growth mindset means learning from the attempt.',
            hint: 'What do you do after a rough first try?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeB4Question(
          {
            id: 'b4m7-45-q3',
            question: 'Comparing yourself to everyone hurts confidence. What is better?',
            choices: [
              'Notice your own progress',
              'Quit so you never compare again',
              'Only do things you already win at',
              'Copy what everyone else does',
            ],
            correctIndex: 0,
            correctFeedback: 'Right. Your progress is your proof.',
            incorrectFeedback: 'Not quite. B-4 tracks your growth, not someone else\'s.',
            hint: 'What builds confidence without comparison?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
      ],
      SKILL,
    ),
    '6-8': bandContent(
      'Challenge negative self-talk with honest, helpful thoughts.',
      [
        makeB4Question(
          {
            id: 'b4m7-68-q1',
            question: 'A student thinks, "I always mess up." What is a stronger replacement thought?',
            choices: [
              'This is hard, but I can improve with practice',
              'I should never try difficult things',
              'Everyone is judging me forever',
              'If I am not perfect, I failed',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Strong self-talk is honest and hopeful.',
            incorrectFeedback: 'Not quite. B-4 wants a thought that is realistic and helpful.',
            hint: 'What thought is fair and still hopeful?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeB4Question(
          {
            id: 'b4m7-68-q2',
            question: 'Thought: "Everyone else gets this except me." What is a better replacement?',
            choices: [
              'I am still learning, and that is okay',
              'I should never ask questions',
              'I must be the only confused person ever',
              'If I struggle, I do not belong here',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Learning takes time for everyone, even when it looks easy.',
            incorrectFeedback: 'Try again. B-4 wants self-talk that is fair, not harsh.',
            hint: 'What is a kinder, truer thought?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeB4Question(
          {
            id: 'b4m7-68-q3',
            question: 'How does effort relate to confidence?',
            choices: [
              'Effort builds skill over time',
              'Effort means you are weak',
              'Confidence only comes from talent',
              'Trying hard proves you are failing',
            ],
            correctIndex: 0,
            correctFeedback: 'Exactly. Helpful self-talk is not fake. It is fair.',
            incorrectFeedback: 'Not quite. Effort is how confidence gets earned.',
            hint: 'What does practice do for your skills?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
      ],
      SKILL,
    ),
  },
};

registerB4AdaptiveMission(B4_MISSION_7_FILE);
