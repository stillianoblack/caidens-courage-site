import type { B4AdaptiveMissionFile } from '../../../types/b4AdaptiveQuest';
import { makeB4Question, bandContent } from '../b4QuestionHelpers';

export const B4_MISSION_8_ID = 'b4-focus-flame-finale';

const MODULE_ID = B4_MISSION_8_ID;
const MODULE_TITLE = 'The Focus Flame Finale';
const SKILL = 'Reflection / Integrated SEL';

export const B4_MISSION_8_FILE: B4AdaptiveMissionFile = {
  id: MODULE_ID,
  title: 'B-4 Focus Missions',
  subtitle: MODULE_TITLE,
  character: 'b4',
  missionNumber: 8,
  skillArea: SKILL,
  skillFocus: ['Reflection', 'Integrated SEL', 'Self-Regulation'],
  storySetup:
    'B-4\'s Focus Flame glows when the learner combines feeling awareness, body signals, brave choice, calm-down move, and reflection.',
  missionB4Tip: 'Feel it. Name it. Choose one helper move.',
  landing: {
    eyebrow: 'MISSION 8',
    title: 'B-4 Focus Missions',
    subtitle: MODULE_TITLE,
    body: 'The Focus Flame is ready — put all your SEL skills together for the finale.',
    cta: 'Start Mission',
  },
  complete: {
    title: 'Focus Flame Lit!',
    message: 'You combined feelings, body signals, brave choices, and reflection. That is the full cycle.',
    badges: ['Focus Flame Keeper', 'SEL Integrator', 'Reflection Pro'],
  },
  gradeContent: {
    'K-1': bandContent(
      'Pick a feeling and a helper move.',
      [
        makeB4Question(
          {
            id: 'b4m8-k1-q1',
            question: 'You feel mad. What can help your Focus Flame?',
            choices: [
              'Name the feeling and take a breath',
              'Do the easiest calm step first',
              'Pretend feelings are not real',
              'Ignore everyone and shut down',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Name it and breathe. That helps the flame stay steady.',
            incorrectFeedback: 'Try again. B-4 wants a safe helper move.',
            hint: 'What two things help when you feel mad?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeB4Question(
          {
            id: 'b4m8-k1-q2',
            question: 'You feel sad. What is a good first helper move?',
            choices: [
              'Wait and hope sadness goes away by itself',
              'Tell a grown-up or take a breath',
              'Do one small calming step, then ask for help',
              'Throw things so people notice you are sad',
            ],
            correctIndex: 1,
            correctFeedback: 'Good move. Naming sadness and getting help keeps the flame steady.',
            incorrectFeedback: 'Try again. B-4 wants a safe helper move for sad feelings.',
            hint: 'What helps when sadness shows up?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeB4Question(
          {
            id: 'b4m8-k1-q3',
            question: 'What does B-4\'s Focus Flame need?',
            choices: [
              'Feelings and helper moves working together',
              'Only being happy all the time',
              'Having feelings and using helper moves',
              'Ignoring every body signal',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Feel it, name it, choose a helper move.',
            incorrectFeedback: 'Not quite. The flame needs feelings plus helpful choices.',
            hint: 'What keeps the Focus Flame glowing?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
      ],
      SKILL,
    ),
    '2-3': bandContent(
      'Match feelings to helpful strategies.',
      [
        makeB4Question(
          {
            id: 'b4m8-23-q1',
            question: 'A student feels nervous before a turn. What is the best match?',
            choices: [
              'Take a breath and ask for one small step',
              'Quit immediately',
              'Laugh at someone else',
              'Ask for one small step, then keep going',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Calm plus a small step helps the student begin.',
            incorrectFeedback: 'Not quite. B-4 matches the feeling to a helpful strategy.',
            hint: 'What feeling-strategy match helps nervousness?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeB4Question(
          {
            id: 'b4m8-23-q2',
            question: 'You feel frustrated during a game. What matches best?',
            choices: [
              'Take a breath and try again',
              'Blame the game and stop trying',
              'Blame the rules',
              'Quit right away and avoid trying again',
            ],
            correctIndex: 0,
            correctFeedback: 'Good match. Calm plus try-again keeps the flame steady.',
            incorrectFeedback: 'Try again. B-4 matches frustration to a helpful strategy.',
            hint: 'What helps when frustration shows up in a game?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeB4Question(
          {
            id: 'b4m8-23-q3',
            question: 'Name the feeling plus a helper move equals…',
            choices: [
              'A steadier Focus Flame',
              'A plan for handling hard moments',
              'Feeling more ready for the next challenge',
              'Automatic winning',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Small steps help brave feelings wake up.',
            incorrectFeedback: 'Not quite. Feelings plus helper moves keep the flame steady.',
            hint: 'What happens when you name a feeling and pick a helper?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
      ],
      SKILL,
    ),
    '4-5': bandContent(
      'Reflect on your choice and what happened next.',
      [
        makeB4Question(
          {
            id: 'b4m8-45-q1',
            question: 'After calming down, what reflection helps most?',
            choices: [
              'What worked, and what can I try next time?',
              'Who can I blame?',
              'How can I avoid every hard thing?',
              'Why did this ruin everything?',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Reflection helps your next choice get stronger.',
            incorrectFeedback: 'Try again. Reflection should help you learn, not get stuck.',
            hint: 'What question helps you learn from the moment?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeB4Question(
          {
            id: 'b4m8-45-q2',
            question: 'After a tough conversation, what reflection question helps?',
            choices: [
              'What feeling did I have and what helped?',
              'Who was the worst person in the room?',
              'What words helped me stay respectful?',
              'Why are feelings so annoying?',
            ],
            correctIndex: 0,
            correctFeedback: 'Good reflection. That turns the experience into a tool.',
            incorrectFeedback: 'Try again. Reflection should help your next choice, not blame.',
            hint: 'What helps you learn from a hard conversation?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeB4Question(
          {
            id: 'b4m8-45-q3',
            question: 'Brave choice plus calm body equals…',
            choices: [
              'A better next decision',
              'An automatic perfect day',
              'More practice choosing a better next step',
              'Proof that feelings are useless',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Calm and brave together make stronger choices.',
            incorrectFeedback: 'Not quite. B-4 combines skills for better next moves.',
            hint: 'What happens when courage meets a calm body?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
      ],
      SKILL,
    ),
    '6-8': bandContent(
      'Use the full regulation cycle from signal to reflection.',
      [
        makeB4Question(
          {
            id: 'b4m8-68-q1',
            question: 'Which full cycle shows strong self-regulation?',
            choices: [
              'Notice signal, name feeling, pause, choose strategy, reflect',
              'React fast, explain later, avoid repair',
              'Ignore feeling, push harder, shut down',
              'Blame someone, quit, move on',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. That is a full Focus Flame regulation cycle.',
            incorrectFeedback: 'Not quite. B-4 is looking for the complete regulation sequence.',
            hint: 'What is the full sequence B-4 taught you?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeB4Question(
          {
            id: 'b4m8-68-q2',
            question: 'Which step comes right after "pause" in the regulation cycle?',
            choices: [
              'Choose a strategy',
              'Blame someone else',
              'Pretend nothing happened',
              'Quit the activity',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. After pause, you pick a helpful strategy.',
            incorrectFeedback: 'Not quite. Pause comes before choosing what to do next.',
            hint: 'What happens after you pause and breathe?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeB4Question(
          {
            id: 'b4m8-68-q3',
            question: 'Why practice the full regulation cycle?',
            choices: [
              'It builds habits for future hard moments',
              'Repeated practice builds stronger habits',
              'It helps you recover faster when upset happens',
              'It replaces asking for help',
            ],
            correctIndex: 0,
            correctFeedback: 'Exactly. Self-regulation is a sequence you can practice.',
            incorrectFeedback: 'Try again. The cycle is a skill you build over time.',
            hint: 'Why does B-4 want you to practice the whole sequence?',
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
