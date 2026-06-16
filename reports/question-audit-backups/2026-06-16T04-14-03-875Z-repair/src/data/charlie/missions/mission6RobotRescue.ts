import type { CharlieAdaptiveMissionFile } from '../../../types/charlieAdaptiveQuest';
import { registerCharlieAdaptiveMission } from '../charlieAdaptiveBuilder';
import { makeCharlieQuestion, bandContent } from '../charlieQuestionHelpers';

export const CHARLIE_MISSION_6_ID = 'charlie-robot-rescue';

const MODULE_ID = CHARLIE_MISSION_6_ID;
const MODULE_TITLE = 'Robot Rescue';
const SKILL = 'Debugging';

export const CHARLIE_MISSION_6_FILE: CharlieAdaptiveMissionFile = {
  id: MODULE_ID,
  title: "Charlie Perk's Science Lab",
  subtitle: MODULE_TITLE,
  character: 'charlie',
  missionNumber: 6,
  skillArea: SKILL,
  skillFocus: ['Debugging', 'Step-by-Step Thinking', 'Problem Solving'],
  storySetup:
    'Charlie\'s mini robot keeps spinning in circles instead of driving forward. Charlie says, "Okay, tiny tornado, let\'s debug your life choices."',
  missionB4Tip:
    'Debugging is just problem-solving with receipts. Test one fix, watch what happens, then try the next.',
  scenarioAccent: 'observe-hands',
  landing: {
    eyebrow: 'MISSION 6',
    title: "Charlie Perk's Science Lab",
    subtitle: MODULE_TITLE,
    body: 'Charlie\'s robot spins in circles — time to debug one part at a time.',
    cta: 'Start Mission',
  },
  complete: {
    title: 'Debugging Badge Earned!',
    message: 'You helped Charlie troubleshoot like a scientist. Tiny tornado, debugged.',
    badges: ['Robot Fixer', 'Debug Detective', 'Step-by-Step Thinker'],
  },
  gradeContent: {
    'K-1': bandContent(
      'Check one robot part at a time when something goes wrong.',
      [
        makeCharlieQuestion(
          {
            id: 'cm6-k1-q1',
            question: 'What should Charlie check first?',
            choices: [
              'One robot part at a time',
              'Shake the robot',
              'Call it a spaghetti machine',
              'Check battery connection after checking wheels',
            ],
            correctIndex: 0,
            correctFeedback: 'One part at a time — that is how Charlie finds the problem.',
            incorrectFeedback: 'Check one piece at a time instead of shaking everything.',
            hint: 'How do you find which part is wrong?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          'K-1',
        ),
        makeCharlieQuestion(
          {
            id: 'cm6-k1-q2',
            question: 'Charlie checks the wheels. One looks loose. What should he do?',
            choices: [
              'Ask a grown-up to help tighten it safely',
              'Pull the wheel off completely',
              'Ignore it and spin faster',
              'Paint the wheel a new color',
            ],
            correctIndex: 0,
            correctFeedback: 'Found a clue! Get help to fix it safely.',
            incorrectFeedback: 'A loose wheel is worth fixing — with adult help.',
            hint: 'Charlie found something wrong — what is the safe next step?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          'K-1',
        ),
        makeCharlieQuestion(
          {
            id: 'cm6-k1-q3',
            question: 'After fixing the wheel, the robot goes straight. What did Charlie do?',
            choices: [
              'Found the problem and tested a fix',
              'Tested one fix and observed the result',
              'Gave up without trying',
              'Changed every part at once',
            ],
            correctIndex: 0,
            correctFeedback: 'Debug win! Find the problem, fix it, test again.',
            incorrectFeedback: 'Charlie found one problem and tested whether the fix worked.',
            hint: 'What steps did Charlie take to help the robot?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          'K-1',
        ),
      ],
      SKILL,
    ),
    '2-3': bandContent(
      'Test one fix at a time to learn which change helps the robot.',
      [
        makeCharlieQuestion(
          {
            id: 'cm6-23-q1',
            question: 'Why should Charlie test one fix at a time?',
            choices: [
              'So he knows which fix worked',
              'So he can compare results across each fix',
              'So he can guess faster',
              'So the wheels get dizzy',
            ],
            correctIndex: 0,
            correctFeedback: 'One fix at a time = clear receipts for what worked.',
            incorrectFeedback: 'If you change many things, you won\'t know what fixed it.',
            hint: 'How does Charlie know which fix solved the spin?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '2-3',
        ),
        makeCharlieQuestion(
          {
            id: 'cm6-23-q2',
            question: 'Charlie swaps the left and right wheel cables. The robot still spins. What did he learn?',
            choices: [
              'That fix did not solve the problem',
              'That cable swap alone was not the root issue',
              'He should test the next likely cause',
              'Debugging is useless',
            ],
            correctIndex: 0,
            correctFeedback: 'A fix that does not work is still useful data.',
            incorrectFeedback: 'When the spin continues, that fix was not the cause.',
            hint: 'The robot still spins — what does that tell Charlie about his fix?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '2-3',
        ),
        makeCharlieQuestion(
          {
            id: 'cm6-23-q3',
            question: 'Charlie writes down each fix he tries. Why?',
            choices: [
              'So he remembers what already failed or worked',
              'So he can avoid repeating the same failed step',
              'So he can choose the next test based on evidence',
              'So the notebook gets heavier',
            ],
            correctIndex: 0,
            correctFeedback: 'Debug notes keep Charlie from repeating the same try.',
            incorrectFeedback: 'Writing fixes down helps Charlie track what he already tested.',
            hint: 'What problem happens if Charlie forgets what he already tried?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '2-3',
        ),
      ],
      SKILL,
    ),
    '4-5': bandContent(
      'Use sequence and debugging to fix the spinning robot.',
      [
        makeCharlieQuestion(
          {
            id: 'cm6-45-q1',
            question: 'The robot turns right when both wheels should move forward. What should Charlie inspect?',
            choices: [
              'The wheel or motor connection',
              'The classroom clock',
              'The color of the robot',
              'The snack table',
            ],
            correctIndex: 0,
            correctFeedback: 'Spinning often means one wheel or motor is not cooperating.',
            incorrectFeedback: 'When one side misbehaves, check wheels and motor connections.',
            hint: 'What parts make a robot go forward?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '4-5',
        ),
        makeCharlieQuestion(
          {
            id: 'cm6-45-q2',
            question: 'Charlie notices the right motor wire is unplugged. What is the likely cause?',
            choices: [
              'Only the left motor is getting power, so the robot turns',
              'One side likely has weaker power or connection',
              'Motors work better when unplugged',
              'The wire is decorative',
            ],
            correctIndex: 0,
            correctFeedback: 'One motor running and one not — classic spin cause.',
            incorrectFeedback: 'If one motor has no power, the robot will turn instead of go straight.',
            hint: 'What happens when only one motor works?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '4-5',
        ),
        makeCharlieQuestion(
          {
            id: 'cm6-45-q3',
            question: 'Charlie plugs in the wire and tests again. The robot drives forward. What step is that?',
            choices: [
              'Observe the result after a fix',
              'Skip testing and celebrate',
              'Change five more parts',
              'Run one more check to confirm the fix is stable',
            ],
            correctIndex: 0,
            correctFeedback: 'Always test after a fix — that is the debug loop.',
            incorrectFeedback: 'After every fix, test and observe what happens.',
            hint: 'What should Charlie do right after plugging in the wire?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '4-5',
        ),
      ],
      SKILL,
    ),
    '6-8': bandContent(
      'Apply systematic troubleshooting to the spinning robot.',
      [
        makeCharlieQuestion(
          {
            id: 'cm6-68-q1',
            question: 'What is the strongest debugging process?',
            choices: [
              'Identify the problem, test one cause, observe the result',
              'Change five things and hope',
              'Restart once, then verify one component at a time',
              'Use observations instead of assumptions',
            ],
            correctIndex: 0,
            correctFeedback: 'Systematic debugging — identify, test one cause, observe.',
            incorrectFeedback: 'Strong debugging follows: problem → one test → observe result.',
            hint: 'What is the repeatable debug cycle?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '6-8',
        ),
        makeCharlieQuestion(
          {
            id: 'cm6-68-q2',
            question: 'Charlie\'s robot spins left. He checks: power, wheel connection, motor wire, and code. Which order is best?',
            choices: [
              'Start with simple physical checks before changing code',
              'Change code first, ignore hardware',
              'Check everything randomly',
              'Check known failure points before less likely causes',
            ],
            correctIndex: 0,
            correctFeedback: 'Start simple — loose wires beat rewriting code.',
            incorrectFeedback: 'Physical connections are often faster to check than code.',
            hint: 'What is usually quickest to inspect first?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '6-8',
        ),
        makeCharlieQuestion(
          {
            id: 'cm6-68-q3',
            question: 'Two fixes did not work. One fix made the robot go straight. What should Charlie document?',
            choices: [
              'Which fix worked and what the symptom was before and after',
              'Which test changed behavior and which did not',
              'Nothing — move on',
              'A short log so future troubleshooting is faster',
            ],
            correctIndex: 0,
            correctFeedback: 'Debug receipts — symptom, fix tried, result. Gold for next time.',
            incorrectFeedback: 'Record what worked so you can debug faster next time.',
            hint: 'What information helps Charlie or someone else fix this again?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '6-8',
        ),
      ],
      SKILL,
    ),
  },
};

registerCharlieAdaptiveMission(CHARLIE_MISSION_6_FILE);
