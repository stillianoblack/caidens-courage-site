import type { ZekeAdaptiveMissionFile } from '../../../types/zekeAdaptiveQuest';
import { registerZekeAdaptiveMission } from '../zekeAdaptiveBuilder';
import { makeZekeQuestion, bandContent } from '../zekeQuestionHelpers';

export const ZEKE_MISSION_6_ID = 'zeke-courage-challenge';

const MODULE_ID = ZEKE_MISSION_6_ID;
const MODULE_TITLE = 'The Courage Challenge';
const SKILL = 'Trying Something New / Confidence';

export const ZEKE_MISSION_6_FILE: ZekeAdaptiveMissionFile = {
  id: MODULE_ID,
  title: "Zeke's Team Quest",
  subtitle: MODULE_TITLE,
  character: 'zeke',
  missionNumber: 6,
  skillArea: SKILL,
  skillFocus: ['Courage', 'Confidence', 'Trying Something New'],
  storySetup:
    'Zeke wants to try out for the talent show, but his stomach flips when he sees the signup sheet. His brain says, "Maybe we become invisible today."',
  missionB4Tip: 'Brave can start with one tiny step.',
  landing: {
    eyebrow: 'MISSION 6',
    title: "Zeke's Team Quest",
    subtitle: MODULE_TITLE,
    body: 'The talent show signup sheet is waiting — help Zeke take a brave step even when his stomach flips.',
    cta: 'Start Mission',
  },
  complete: {
    title: 'Courage Badge Earned!',
    message: 'You practiced taking brave steps even when nervous. Courage is direction, not fearlessness.',
    badges: ['Brave Stepper', 'Nerves Boss', 'Try-Out Hero'],
  },
  gradeContent: {
    'K-1': bandContent(
      'Try a small brave step when something feels scary.',
      [
        makeZekeQuestion(
          {
            id: 'zkm6-k1-q1',
            question: 'What brave step can Zeke take?',
            choices: [
              'Put his name on the signup sheet',
              'Tear the paper down',
              'Take one breath and ask for support',
              'Say nobody should try',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Signing up can be a brave first step.',
            incorrectFeedback: 'Try again. Courage means one helpful step.',
            hint: 'What is one small brave move Zeke can make?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeZekeQuestion(
          {
            id: 'zkm6-k1-q2',
            question: 'Zeke\'s stomach feels flip-floppy. What can he do?',
            choices: [
              'Wait and hope the nerves fade',
              'Take one slow breath and think',
              'Ask a friend to stand with him at signup',
              'Rip up the signup sheet',
            ],
            correctIndex: 1,
            correctFeedback: 'Nice. A breath can help Zeke take the next step.',
            incorrectFeedback: 'Try again. Zeke needs a move that helps, not hides.',
            hint: 'What helps when your body feels nervous?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeZekeQuestion(
          {
            id: 'zkm6-k1-q3',
            question: 'What is one tiny brave step?',
            choices: [
              'Writing his name down',
              'Doing the whole show right now',
              'Trying one small step even while nervous',
              'Laughing at people who try',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. One small step is still courage.',
            incorrectFeedback: 'Not quite. Brave can start tiny.',
            hint: 'What is the smallest step toward trying out?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
      ],
      SKILL,
    ),
    '2-3': bandContent(
      'Practice before trying something new.',
      [
        makeZekeQuestion(
          {
            id: 'zkm6-23-q1',
            question: 'What helps Zeke feel more ready?',
            choices: [
              'Practice once with someone he trusts',
              'Think of one practice step and schedule it',
              'Tell everyone he is already perfect',
              'Quit before trying',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Practice makes brave choices easier.',
            incorrectFeedback: 'Not quite. Zeke can prepare instead of avoid.',
            hint: 'What helps courage get warmed up?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeZekeQuestion(
          {
            id: 'zkm6-23-q2',
            question: 'Zeke feels nervous before the talent show. What helps?',
            choices: [
              'Practicing with a trusted friend',
              'Planning a short practice with a trusted person',
              'Telling everyone he is perfect',
              'Quitting before trying',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Practice builds confidence for the real try.',
            incorrectFeedback: 'Try again. Zeke can prepare instead of avoid.',
            hint: 'What gets Zeke ready without skipping the try?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeZekeQuestion(
          {
            id: 'zkm6-23-q3',
            question: 'What does practice do for courage?',
            choices: [
              'Helps courage get warmed up',
              'Can still include nerves while building skill',
              'Makes trying not count',
              'Proves you should not try',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Practice makes the brave step feel more possible.',
            incorrectFeedback: 'Not quite. Practice supports courage; it does not erase nerves.',
            hint: 'Why practice before something scary?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
      ],
      SKILL,
    ),
    '4-5': bandContent(
      'Handle nervous feelings while still trying.',
      [
        makeZekeQuestion(
          {
            id: 'zkm6-45-q1',
            question: 'Zeke feels nervous but still wants to try. What should he remember?',
            choices: [
              'Nervous does not mean stop',
              'Nervous means he will fail',
              'Brave people can feel nervous and still act',
              'He should only try easy things',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Nervous feelings can come with brave choices.',
            incorrectFeedback: 'Try again. Courage can include nervousness.',
            hint: 'What is true about nervous feelings and trying?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeZekeQuestion(
          {
            id: 'zkm6-45-q2',
            question: 'Zeke\'s hands are shaky before signup. What is a helpful move?',
            choices: [
              'Breathe and take the one step anyway',
              'Wait until fear disappears',
              'Pretend he does not care',
              'Only do things that feel easy',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Zeke can move forward even with shaky hands.',
            incorrectFeedback: 'Not yet. Waiting for zero fear often means never trying.',
            hint: 'What helps when nerves show up but Zeke still wants to try?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeZekeQuestion(
          {
            id: 'zkm6-45-q3',
            question: 'Nervous feelings show up. What is true?',
            choices: [
              'Brave people can feel nervous and still try',
              'Nervous can mean "go slowly" instead of "stop"',
              'Only fearless people try new things',
              'Trying easy things is the only courage',
            ],
            correctIndex: 0,
            correctFeedback: 'Exactly. Nervous is not a stop sign.',
            incorrectFeedback: 'Try again. Courage and nervousness can happen together.',
            hint: 'Can you be nervous and brave at the same time?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
      ],
      SKILL,
    ),
    '6-8': bandContent(
      'Move toward values despite fear.',
      [
        makeZekeQuestion(
          {
            id: 'zkm6-68-q1',
            question: 'What shows real courage?',
            choices: [
              'Taking a value-based step even while nervous',
              'Choosing a small value-based step now',
              'Acting like nothing matters',
              'Avoiding anything with risk',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Courage is action guided by values, not the absence of fear.',
            incorrectFeedback: 'Not quite. Brave choices can happen while fear is still present.',
            hint: 'What does courage look like when fear is still there?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeZekeQuestion(
          {
            id: 'zkm6-68-q2',
            question: 'Zeke wants to perform but fear says "skip it." What helps?',
            choices: [
              'Choosing the step that matches what he values',
              'Acting on what matters even while fear is present',
              'Acting like it does not matter',
              'Avoiding every risk',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Values can guide Zeke past the fear voice.',
            incorrectFeedback: 'Not yet. Courage follows what matters, not what feels easiest.',
            hint: 'What helps Zeke act when fear is loud?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeZekeQuestion(
          {
            id: 'zkm6-68-q3',
            question: 'What is courage?',
            choices: [
              'Direction toward what matters, even with fear present',
              'Having zero fear',
              'Performing only for others',
              'Continuing toward goals while managing nerves',
            ],
            correctIndex: 0,
            correctFeedback: 'Exactly. Courage is not fearlessness. It is direction.',
            incorrectFeedback: 'Try again. Real courage moves toward values despite fear.',
            hint: 'How is courage different from having no fear?',
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

registerZekeAdaptiveMission(ZEKE_MISSION_6_FILE);
