import type { B4AdaptiveMissionFile } from '../../../types/b4AdaptiveQuest';
import { makeB4Question, bandContent } from '../b4QuestionHelpers';

export const B4_MISSION_5_ID = 'b4-calm-down-countdown';

const MODULE_ID = B4_MISSION_5_ID;
const MODULE_TITLE = 'Calm-Down Countdown';
const SKILL = 'Self-Regulation / Calming Strategies';

export const B4_MISSION_5_FILE: B4AdaptiveMissionFile = {
  id: MODULE_ID,
  title: 'B-4 Focus Missions',
  subtitle: MODULE_TITLE,
  character: 'b4',
  missionNumber: 5,
  skillArea: SKILL,
  skillFocus: ['Self-Regulation', 'Calming Strategies', 'Pause'],
  storySetup:
    'B-4 starts a calm-down countdown after a big feeling alert. The mission is to choose what helps the body calm before making the next choice.',
  missionB4Tip: 'Big feelings are not bad. They just need a safe landing.',
  landing: {
    eyebrow: 'MISSION 5',
    title: 'B-4 Focus Missions',
    subtitle: MODULE_TITLE,
    body: 'A big feeling alert is blinking — help B-4 pick calm-down moves before the next choice.',
    cta: 'Start Mission',
  },
  complete: {
    title: 'Calm-Down Badge Earned!',
    message: 'You practiced calming the body before solving the problem. Calm first, solve second.',
    badges: ['Calm Counter', 'Breath Boss', 'Pause Pro'],
  },
  gradeContent: {
    'K-1': bandContent(
      'Count and breathe when big feelings show up.',
      [
        makeB4Question(
          {
            id: 'b4m5-k1-q1',
            question: 'What can B-4 do to calm a big feeling?',
            choices: [
              'Count slowly and breathe',
              'Make the feeling race',
              'Say "go away" to the feeling',
              'Knock over the chair',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Counting and breathing can help the feeling slow down.',
            incorrectFeedback: 'Try again. B-4 needs a calm-down move.',
            hint: 'What helps a big feeling slow down?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeB4Question(
          {
            id: 'b4m5-k1-q2',
            question: 'Your body feels wiggly and jumpy. What can help?',
            choices: [
              'Take slow breaths with B-4',
              'Run in circles faster',
              'Hold your breath until you float',
              'Shake your lunchbox at the wall',
            ],
            correctIndex: 0,
            correctFeedback: 'Nice. Slow breaths tell your body it can settle.',
            incorrectFeedback: 'Try again. B-4 wants a move that helps the body feel safe.',
            hint: 'What does B-4 do when the body feels jumpy?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeB4Question(
          {
            id: 'b4m5-k1-q3',
            question: 'B-4 says "3… 2… 1… breathe." Why does that help?',
            choices: [
              'It gives your body time to calm down',
              'It helps feelings settle enough to make a good choice',
              'It gives your thinking brain time to catch up',
              'It helps you handle upset feelings more safely',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. The countdown gives your body a safe landing.',
            incorrectFeedback: 'Not quite. Counting and breathing help the feeling slow down.',
            hint: 'What does a countdown give your body?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
      ],
      SKILL,
    ),
    '2-3': bandContent(
      'Use calming tools before words or actions take over.',
      [
        makeB4Question(
          {
            id: 'b4m5-23-q1',
            question: 'A student feels upset and wants to yell. What should happen first?',
            choices: [
              'Wait and hope the feeling gets smaller',
              'Calm the body before talking',
              'Ask for help after one calming breath',
              'Break something to show the feeling',
            ],
            correctIndex: 1,
            correctFeedback: 'Correct. The body needs calm before the words work well.',
            incorrectFeedback: 'Not quite. B-4 calms the alarm before solving the problem.',
            hint: 'What needs to happen before talking?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeB4Question(
          {
            id: 'b4m5-23-q2',
            question: 'Your hands are in tight fists. What calming tool might help?',
            choices: [
              'Squeeze your hands, then open them slowly',
              'Take a breath, then slowly unclench your fingers',
              'Wait and do nothing even if your body stays tight',
              'Hit your desk to let feelings out',
            ],
            correctIndex: 0,
            correctFeedback: 'Good tool. Squeeze and release can help tight fists loosen.',
            incorrectFeedback: 'Try again. B-4 picks a tool that calms the body, not fires it up.',
            hint: 'What can you do with tight fists to help them relax?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeB4Question(
          {
            id: 'b4m5-23-q3',
            question: 'A friend is upset. What is the best first move?',
            choices: [
              'Stay calm and ask if they want space or help',
              'Tell them to stop crying right now',
              'Copy their upset face to match',
              'Walk away and pretend you did not see',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Calm first helps you be a good helper.',
            incorrectFeedback: 'Not quite. B-4 calms down before trying to fix things.',
            hint: 'How can you help when someone else is upset?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
      ],
      SKILL,
    ),
    '4-5': bandContent(
      'Pause before reacting when feelings run hot.',
      [
        makeB4Question(
          {
            id: 'b4m5-45-q1',
            question: 'Why is it helpful to pause before responding?',
            choices: [
              'It gives the thinking brain time to come back online',
              'It makes the other person lose',
              'It helps the feeling shrink so you can think',
              'It helps you respond, not react',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Pausing gives your brain more control over the next choice.',
            incorrectFeedback: 'Try again. A pause helps your thinking brain return.',
            hint: 'What does a pause give your brain?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeB4Question(
          {
            id: 'b4m5-45-q2',
            question: 'A text message makes you angry. What is the best first move?',
            choices: [
              'Put the phone down and pause',
              'Reply immediately while mad',
              'Send ten angry messages',
              'Put the phone down and take a short reset break',
            ],
            correctIndex: 0,
            correctFeedback: 'Smart pause. Your brain catches up when you step back.',
            incorrectFeedback: 'Not yet. B-4 pauses before the words go flying.',
            hint: 'What helps before you type or talk?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeB4Question(
          {
            id: 'b4m5-45-q3',
            question: 'What does "pause" mean in a calm-down?',
            choices: [
              'Stop and breathe before you act',
              'Pause, breathe, and choose words carefully',
              'Pretend the feeling is not real',
              'Wait until the other person apologizes first',
            ],
            correctIndex: 0,
            correctFeedback: 'Exactly. Pause is a bridge between feeling and choice.',
            incorrectFeedback: 'Try again. A pause is a short stop to help your brain catch up.',
            hint: 'What happens during a helpful pause?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
      ],
      SKILL,
    ),
    '6-8': bandContent(
      'Regulate before problem-solving when frustration is high.',
      [
        makeB4Question(
          {
            id: 'b4m5-68-q1',
            question: 'A student is too frustrated to hear feedback. What is the best first step?',
            choices: [
              'Regulate before discussing the problem',
              'Keep explaining until they agree',
              'Correct them in front of everyone',
              'Tell them feelings do not matter',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Regulation opens the door to learning.',
            incorrectFeedback: 'Not yet. Feedback works better after the nervous system settles.',
            hint: 'What needs to happen before feedback can land?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeB4Question(
          {
            id: 'b4m5-68-q2',
            question: 'A group project conflict starts while everyone is stressed. What first?',
            choices: [
              'Take a short break so everyone can regulate',
              'Argue louder until someone wins',
              'Assign blame and keep working',
              'Quit the project immediately',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Regulated brains solve problems better than fired-up ones.',
            incorrectFeedback: 'Not quite. B-4 helps everyone calm before problem-solving.',
            hint: 'What helps a stressed group think clearly?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeB4Question(
          {
            id: 'b4m5-68-q3',
            question: 'Why regulate before discussing a problem?',
            choices: [
              'A calmer brain can actually hear and learn',
              'Feelings should be ignored in school',
              'Regulation means you can feel upset and still choose wisely',
              'It lets you win the argument faster',
            ],
            correctIndex: 0,
            correctFeedback: 'Exactly. You cannot coach a brain that feels under attack.',
            incorrectFeedback: 'Try again. Regulation helps the brain feel safe enough to learn.',
            hint: 'What does a calm nervous system make possible?',
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
