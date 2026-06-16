import type { B4AdaptiveMissionFile } from '../../../types/b4AdaptiveQuest';
import { registerB4AdaptiveMission } from '../b4AdaptiveBuilder';
import { makeB4Question, bandContent } from '../b4QuestionHelpers';

export const B4_MISSION_2_ID = 'b4-body-signal-detective';

const MODULE_ID = B4_MISSION_2_ID;
const MODULE_TITLE = 'Body Signal Detective';
const SKILL = 'Body Awareness / Self-Regulation';

export const B4_MISSION_2_FILE: B4AdaptiveMissionFile = {
  id: MODULE_ID,
  title: 'B-4 Focus Missions',
  subtitle: MODULE_TITLE,
  character: 'b4',
  missionNumber: 2,
  skillArea: SKILL,
  skillFocus: ['Body Awareness', 'Self-Regulation', 'Calming Strategies'],
  storySetup:
    'B-4\'s dashboard lights up with body signals: fast heartbeat, wiggly legs, tight shoulders, and a buzzing brain. B-4 needs help matching signals to support moves.',
  missionB4Tip: 'Your body sends messages. Slow breathing helps B-4 turn down the alarm.',
  landing: {
    eyebrow: 'MISSION 2',
    title: 'B-4 Focus Missions',
    subtitle: MODULE_TITLE,
    body: 'Body signals are lighting up B-4\'s dashboard — match the clue to the right calming move.',
    cta: 'Start Mission',
  },
  complete: {
    title: 'Body Signal Badge Earned!',
    message: 'You helped B-4 read body clues and pick moves that turn down the alarm.',
    badges: ['Body Signal Reader', 'Calm-Down Captain', 'Early Alert Expert'],
  },
  gradeContent: {
    'K-1': bandContent(
      'Notice simple body clues and pick a calming move.',
      [
        makeB4Question(
          {
            id: 'b4m2-k1-q1',
            question: 'If your heart beats fast and your body feels jumpy, what can help?',
            choices: [
              'Ask for help after trying one breath',
              'Take slow breaths',
              'Do the easiest calm step first',
              'Keep making your body more jumpy',
            ],
            correctIndex: 1,
            correctFeedback: 'Yes. Slow breaths can help your body calm down.',
            incorrectFeedback: 'Try again. B-4 wants a move that helps the body feel safe.',
            hint: 'What helps a jumpy body slow down?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeB4Question(
          {
            id: 'b4m2-k1-q2',
            question: 'B-4 sees butterflies in a kid\'s tummy before show-and-tell. What body clue is that?',
            choices: [
              'A nervous tummy clue',
              'A hungry-for-pizza clue',
              'A robot-startup clue',
              'A nothing-is-happening clue',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Tummy butterflies often mean nervous.',
            incorrectFeedback: 'Not quite. B-4 reads tummy feelings as body clues.',
            hint: 'What feeling can show up in your stomach?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeB4Question(
          {
            id: 'b4m2-k1-q3',
            question: 'A kid yawns and their eyes feel heavy. What body signal might B-4 name?',
            choices: ['Tired', 'Angry', 'Excited', 'Silly'],
            correctIndex: 0,
            correctFeedback: 'Yes. Yawns and heavy eyes are tired body signals.',
            incorrectFeedback: 'Look again — yawns and heavy eyes point to a different signal.',
            hint: 'What does your body do when it needs rest?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
      ],
      SKILL,
    ),
    '2-3': bandContent(
      'Match body signals to the feelings they often mean.',
      [
        makeB4Question(
          {
            id: 'b4m2-23-q1',
            question: 'A student\'s shoulders are tight before reading aloud. What feeling might match that signal?',
            choices: ['Nervous', 'Unsure what to do next', 'Extra hungry', 'Too sparkly'],
            correctIndex: 0,
            correctFeedback: 'Correct. Tight shoulders can be a clue that someone feels nervous.',
            incorrectFeedback: 'Not quite. B-4 uses body clues to understand feelings.',
            hint: 'What feeling shows up before speaking in front of others?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeB4Question(
          {
            id: 'b4m2-23-q2',
            question: 'After an unfair call in a game, a kid\'s jaw is clenched and fists are tight. What feeling fits?',
            choices: ['Frustrated or angry', 'Sleepy', 'Proud', 'Bored'],
            correctIndex: 0,
            correctFeedback: 'Yes. Clenched jaw and tight fists often match frustrated or angry feelings.',
            incorrectFeedback: 'Try again. B-4 matches the body signal to the situation.',
            hint: 'What feeling shows up when something feels unfair?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeB4Question(
          {
            id: 'b4m2-23-q3',
            question: 'A student slumps their shoulders after making a mistake. What feeling might B-4 detect?',
            choices: ['Disappointed or sad', 'Extra excited', 'Hungry', 'Confused about lunch'],
            correctIndex: 0,
            correctFeedback: 'Good match. Slumped shoulders can mean disappointed or sad.',
            incorrectFeedback: 'Not quite. B-4 reads posture as a body clue.',
            hint: 'How might your body look after a mistake?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
      ],
      SKILL,
    ),
    '4-5': bandContent(
      'Choose regulation strategies based on body signals.',
      [
        makeB4Question(
          {
            id: 'b4m2-45-q1',
            question: 'A student feels hot, tense, and ready to argue. What is the best first reset?',
            choices: [
              'Pause and take space before responding',
              'Send the text immediately',
              'Argue faster',
              'Pretend nothing happened',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. A pause gives the brain time to catch up with the feeling.',
            incorrectFeedback: 'Not yet. The best move helps the body cool down first.',
            hint: 'What helps a hot, tense body before words fly?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeB4Question(
          {
            id: 'b4m2-45-q2',
            question: 'A student cannot sit still — legs bouncing, fingers tapping. What reset fits the signal?',
            choices: [
              'A short movement break',
              'Hold breath until dizzy',
              'Stare at the ceiling for an hour',
              'Ignore the body completely',
            ],
            correctIndex: 0,
            correctFeedback: 'Right. A quick move can help restless energy settle.',
            incorrectFeedback: 'Not quite. B-4 matches the reset to the body signal.',
            hint: 'What helps when your body has extra wiggly energy?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeB4Question(
          {
            id: 'b4m2-45-q3',
            question: 'A student\'s brain feels buzzy and they cannot think straight. What should B-4 suggest first?',
            choices: [
              'Slow breathing to settle the nervous system',
              'Speed-read everything twice as fast',
              'Add five more tasks',
              'Wait until the buzz gets louder',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Breathing helps a buzzing brain get back online.',
            incorrectFeedback: 'Try again. B-4 picks a reset that calms the alarm first.',
            hint: 'What helps when your brain feels overloaded?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
      ],
      SKILL,
    ),
    '6-8': bandContent(
      'Understand early warning signs before emotions escalate.',
      [
        makeB4Question(
          {
            id: 'b4m2-68-q1',
            question: 'Why should someone notice body signals early?',
            choices: [
              'Early signals help prevent a bigger reaction',
              'Waiting until feelings peak gives more control',
              'Ignoring signals helps them fade faster',
              'Body signals only matter after someone else notices',
            ],
            correctIndex: 0,
            correctFeedback: 'Exactly. Early signals give you more choices before emotions take over.',
            incorrectFeedback: 'Try again. B-4 uses early signals to protect future choices.',
            hint: 'What do you gain by catching a signal early?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeB4Question(
          {
            id: 'b4m2-68-q2',
            question: 'B-4 notices a student\'s voice getting louder and their face heating up. What is this?',
            choices: [
              'An early warning sign before escalation',
              'Proof they are fine',
              'A sign to ignore everything',
              'A random glitch with no meaning',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Voice and heat changes are early alerts — act before the peak.',
            incorrectFeedback: 'Not quite. B-4 treats rising signals as early warnings.',
            hint: 'What happens when feelings start climbing?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeB4Question(
          {
            id: 'b4m2-68-q3',
            question: 'A student catches their shoulders creeping up and jaw tightening. What is the smart next move?',
            choices: [
              'Use a reset before the reaction gets bigger',
              'Wait until they snap, then fix it',
              'Tell themselves feelings are not real',
              'Push through without noticing',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Early resets protect your choices before emotions take the wheel.',
            incorrectFeedback: 'Try again. B-4 acts on early signals, not after the explosion.',
            hint: 'When is the best time to use a reset?',
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

registerB4AdaptiveMission(B4_MISSION_2_FILE);
