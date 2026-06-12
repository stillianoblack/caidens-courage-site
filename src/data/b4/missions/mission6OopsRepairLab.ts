import type { B4AdaptiveMissionFile } from '../../../types/b4AdaptiveQuest';
import { registerB4AdaptiveMission } from '../b4AdaptiveBuilder';
import { makeB4Question, bandContent } from '../b4QuestionHelpers';

export const B4_MISSION_6_ID = 'b4-oops-repair-lab';

const MODULE_ID = B4_MISSION_6_ID;
const MODULE_TITLE = 'Oops Repair Lab';
const SKILL = 'Repair / Accountability';

export const B4_MISSION_6_FILE: B4AdaptiveMissionFile = {
  id: MODULE_ID,
  title: 'B-4 Focus Missions',
  subtitle: MODULE_TITLE,
  character: 'b4',
  missionNumber: 6,
  skillArea: SKILL,
  skillFocus: ['Repair', 'Accountability', 'Apology'],
  storySetup:
    'B-4 opens the Oops Repair Lab after someone makes a mistake. The lab does not erase mistakes. It helps repair them.',
  missionB4Tip: 'Mistakes happen. Repair is how we come back.',
  landing: {
    eyebrow: 'MISSION 6',
    title: 'B-4 Focus Missions',
    subtitle: MODULE_TITLE,
    body: 'Someone made a mistake — help B-4 choose repair moves that rebuild trust.',
    cta: 'Start Mission',
  },
  complete: {
    title: 'Repair Badge Earned!',
    message: 'You practiced owning mistakes and fixing harm. Repair is stronger than pretending.',
    badges: ['Repair Builder', 'Trust Fixer', 'Accountability Ace'],
  },
  gradeContent: {
    'K-1': bandContent(
      'Say sorry and help fix what your mistake hurt.',
      [
        makeB4Question(
          {
            id: 'b4m6-k1-q1',
            question: 'You knocked over someone\'s blocks. What helps repair it?',
            choices: [
              'Say sorry and help rebuild',
              'Run away',
              'Say the blocks jumped',
              'Laugh at the mess',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Repair means helping fix what happened.',
            incorrectFeedback: 'Try again. B-4 wants a choice that helps repair.',
            hint: 'What helps after you knock something over?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeB4Question(
          {
            id: 'b4m6-k1-q2',
            question: 'You spilled juice on a friend\'s paper. What helps?',
            choices: [
              'Say sorry and help clean up',
              'Hide the cup behind your back',
              'Say the juice was thirsty',
              'Walk away really fast',
            ],
            correctIndex: 0,
            correctFeedback: 'Good repair. Sorry plus help shows you care.',
            incorrectFeedback: 'Try again. B-4 wants sorry and a helpful action.',
            hint: 'What can you do after a spill?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeB4Question(
          {
            id: 'b4m6-k1-q3',
            question: 'What is repair?',
            choices: [
              'Fixing what your mistake hurt',
              'Pretending it never happened',
              'Blaming someone else',
              'Running until everyone forgets',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Repair means helping fix what happened.',
            incorrectFeedback: 'Not quite. Repair is about fixing harm, not hiding it.',
            hint: 'What does the Oops Repair Lab help you do?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
      ],
      SKILL,
    ),
    '2-3': bandContent(
      'Own the mistake and apologize with honesty.',
      [
        makeB4Question(
          {
            id: 'b4m6-23-q1',
            question: 'A student says something unkind. What should they do next?',
            choices: [
              'Own it and apologize',
              'Pretend nobody heard',
              'Say "just kidding" and walk away',
              'Blame the chair',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Owning the mistake helps rebuild trust.',
            incorrectFeedback: 'Not quite. B-4 does not erase the mistake; B-4 repairs it.',
            hint: 'What comes after saying something unkind?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeB4Question(
          {
            id: 'b4m6-23-q2',
            question: 'You accidentally cut in line. What should you do?',
            choices: [
              'Say sorry and go to the back',
              'Act like you were there first',
              'Stand still and say nothing',
              'Blame the person behind you',
            ],
            correctIndex: 0,
            correctFeedback: 'Good repair. Owning it shows you respect others.',
            incorrectFeedback: 'Try again. B-4 wants honesty, not hiding.',
            hint: 'What helps after you cut in line?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeB4Question(
          {
            id: 'b4m6-23-q3',
            question: 'Someone says "just kidding" after being mean. Does that fix it?',
            choices: [
              'No — you still need to apologize',
              'Yes — jokes erase everything',
              'Only if you say it three times',
              'Yes — if you run away fast',
            ],
            correctIndex: 0,
            correctFeedback: 'Right. A real apology does not hide behind "just kidding."',
            incorrectFeedback: 'Not quite. Mean words still need repair even as a joke.',
            hint: 'Does "just kidding" undo hurt feelings?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
      ],
      SKILL,
    ),
    '4-5': bandContent(
      'Repair harm with action, not just words.',
      [
        makeB4Question(
          {
            id: 'b4m6-45-q1',
            question: 'What makes an apology stronger?',
            choices: [
              'A specific action to repair the harm',
              'Saying it as fast as possible',
              'Making the other person apologize too',
              'Explaining why it was not a big deal',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Strong repair includes what you will do differently.',
            incorrectFeedback: 'Try again. Repair needs action, not just words.',
            hint: 'What turns sorry into real repair?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeB4Question(
          {
            id: 'b4m6-45-q2',
            question: 'You borrowed something without asking and broke it. Best repair?',
            choices: [
              'Tell them, apologize, and offer to replace or fix it',
              'Hide the broken piece in your locker',
              'Say it was already broken when you found it',
              'Wait and hope they forget',
            ],
            correctIndex: 0,
            correctFeedback: 'Strong repair. Honesty plus action rebuilds trust.',
            incorrectFeedback: 'Not quite. B-4 wants honesty and a plan to fix the harm.',
            hint: 'What shows you take responsibility?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeB4Question(
          {
            id: 'b4m6-45-q3',
            question: 'What makes repair real?',
            choices: [
              'Changing your behavior next time',
              'Saying sorry once really fast',
              'Waiting until an adult notices',
              'Explaining why the other person overreacted',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. The best repair says: I see it, I own it, I will try differently.',
            incorrectFeedback: 'Try again. Real repair includes a better next move.',
            hint: 'What shows you learned from the mistake?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
      ],
      SKILL,
    ),
    '6-8': bandContent(
      'Practice accountability without shame.',
      [
        makeB4Question(
          {
            id: 'b4m6-68-q1',
            question: 'Why is accountability different from shame?',
            choices: [
              'Accountability focuses on repair and better choices',
              'Accountability means you are a bad person',
              'Shame always fixes behavior',
              'Repair is only needed if adults notice',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Accountability helps you grow without attacking who you are.',
            incorrectFeedback: 'Not quite. B-4 separates the person from the behavior.',
            hint: 'What does accountability focus on?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeB4Question(
          {
            id: 'b4m6-68-q2',
            question: 'You posted something hurtful online. What is the best repair?',
            choices: [
              'Delete it, apologize privately, and make amends',
              'Like your own post so it looks popular',
              'Say "it was just a joke" in the comments',
              'Block everyone who was upset',
            ],
            correctIndex: 0,
            correctFeedback: 'Strong repair. Remove harm, own it, and make it right.',
            incorrectFeedback: 'Not quite. B-4 wants real accountability, not damage control.',
            hint: 'How do you repair harm that spread online?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeB4Question(
          {
            id: 'b4m6-68-q3',
            question: 'A friend says "I don\'t accept your apology." What helps?',
            choices: [
              'Respect their feelings and show change over time',
              'Demand they forgive you right now',
              'Say sorry louder until they agree',
              'Tell them they are being too sensitive',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Repair sometimes takes time and consistent action.',
            incorrectFeedback: 'Not quite. B-4 knows trust is rebuilt through actions, not pressure.',
            hint: 'What if someone is not ready to forgive yet?',
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

registerB4AdaptiveMission(B4_MISSION_6_FILE);
