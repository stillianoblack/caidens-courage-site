import type { CharlieAdaptiveMissionFile } from '../../../types/charlieAdaptiveQuest';
import { registerCharlieAdaptiveMission } from '../charlieAdaptiveBuilder';
import { makeCharlieQuestion, bandContent } from '../charlieQuestionHelpers';

export const CHARLIE_MISSION_7_ID = 'charlie-marshmallow-tower';

const MODULE_ID = CHARLIE_MISSION_7_ID;
const MODULE_TITLE = 'The Marshmallow Tower';
const SKILL = 'Teamwork / Iteration';

export const CHARLIE_MISSION_7_FILE: CharlieAdaptiveMissionFile = {
  id: MODULE_ID,
  title: "Charlie Perk's Science Lab",
  subtitle: MODULE_TITLE,
  character: 'charlie',
  missionNumber: 7,
  skillArea: SKILL,
  skillFocus: ['Teamwork', 'Iteration', 'Design Thinking'],
  storySetup:
    'Charlie\'s team must build the tallest tower using marshmallows and sticks. The first version leans like it heard a secret.',
  missionB4Tip:
    'A wobbly first try is not embarrassing. It is the design telling you where to improve.',
  scenarioAccent: 'ant-teamwork',
  landing: {
    eyebrow: 'MISSION 7',
    title: "Charlie Perk's Science Lab",
    subtitle: MODULE_TITLE,
    body: 'Marshmallows, sticks, and a wobbly tower — build, test, and improve together.',
    cta: 'Start Mission',
  },
  complete: {
    title: 'Teamwork Badge Earned!',
    message: 'You helped Charlie\'s team iterate without panic. Wobbly towers are just early drafts.',
    badges: ['Tower Builder', 'Team Player', 'Design Improver'],
  },
  gradeContent: {
    'K-1': bandContent(
      'Try again together when the marshmallow tower falls.',
      [
        makeCharlieQuestion(
          {
            id: 'cm7-k1-q1',
            question: 'What should Charlie\'s team do if the tower falls?',
            choices: [
              'Try again together',
              'Pause and rebuild with one change',
              'Blame the marshmallow',
              'Eat the whole tower',
            ],
            correctIndex: 0,
            correctFeedback: 'Teams try again — falling is just round one.',
            incorrectFeedback: 'A fall means rebuild together, not give up.',
            hint: 'What do good teammates do when a tower falls?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          'K-1',
        ),
        makeCharlieQuestion(
          {
            id: 'cm7-k1-q2',
            question: 'One teammate holds the base while another adds sticks. What are they doing?',
            choices: [
              'Working together to keep the tower steady',
              'Hiding marshmallows from the teacher',
              'Competing to eat the fastest',
              'Ignoring the tower completely',
            ],
            correctIndex: 0,
            correctFeedback: 'Teamwork! Different jobs help one tower.',
            incorrectFeedback: 'They are helping each other build — that is teamwork.',
            hint: 'Are they helping each other or working alone?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          'K-1',
        ),
        makeCharlieQuestion(
          {
            id: 'cm7-k1-q3',
            question: 'The tower leans a little. What should the team do?',
            choices: [
              'Notice the wobble and fix the bottom',
              'Add more height right away',
              'Knock it down for fun',
              'Pretend it is not leaning',
            ],
            correctIndex: 0,
            correctFeedback: 'Fix the base before going taller — smart team move.',
            incorrectFeedback: 'A wobble means check the bottom before building up.',
            hint: 'Where should a steady tower start?',
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
      'Build, test, and improve the marshmallow tower as a team.',
      [
        makeCharlieQuestion(
          {
            id: 'cm7-23-q1',
            question: 'What helps the team improve the tower?',
            choices: [
              'Notice what made it fall',
              'Build the same thing again without looking',
              'Argue about whose marshmallow is best',
              'Close their eyes',
            ],
            correctIndex: 0,
            correctFeedback: 'Fall forensics — what made it tip is the clue.',
            incorrectFeedback: 'Look at why it fell before building the same way again.',
            hint: 'What should the team study after a collapse?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '2-3',
        ),
        makeCharlieQuestion(
          {
            id: 'cm7-23-q2',
            question: 'Charlie suggests a wider base. His teammate adds diagonal sticks. What is happening?',
            choices: [
              'The team is combining ideas to make a stronger design',
              'They are ignoring each other',
              'They are building two separate towers',
              'They forgot the assignment',
            ],
            correctIndex: 0,
            correctFeedback: 'Shared ideas beat solo guessing — teamwork plus iteration.',
            incorrectFeedback: 'They are both improving the design together.',
            hint: 'Are they working on one tower or fighting about marshmallows?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '2-3',
        ),
        makeCharlieQuestion(
          {
            id: 'cm7-23-q3',
            question: 'Version 1 fell. Version 2 stood taller but wobbled. What should Version 3 focus on?',
            choices: [
              'Stability before adding more height',
              'Being the tallest immediately',
              'Using fewer sticks on purpose',
              'Stopping after Version 1',
            ],
            correctIndex: 0,
            correctFeedback: 'Stable first, tall second — iteration in action.',
            incorrectFeedback: 'Version 2 wobbled — fix stability before going higher.',
            hint: 'What problem did Version 2 still have?',
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
      'Use team feedback to strengthen the tower design.',
      [
        makeCharlieQuestion(
          {
            id: 'cm7-45-q1',
            question: 'Why should Charlie test a small tower before making it taller?',
            choices: [
              'To find weak spots early',
              'To make the sticks nervous',
              'To avoid teamwork',
              'To learn what fails before full height attempts',
            ],
            correctIndex: 0,
            correctFeedback: 'Small tests reveal weak spots before the big wobble.',
            incorrectFeedback: 'Test small first so you find problems early.',
            hint: 'What can a short test tower teach the team?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '4-5',
        ),
        makeCharlieQuestion(
          {
            id: 'cm7-45-q2',
            question: 'A teammate notices the middle joint is loose. What should the team do?',
            choices: [
              'Use the feedback and reinforce that joint',
              'Ignore the comment and build higher',
              'Argue until time runs out',
              'Start over without talking',
            ],
            correctIndex: 0,
            correctFeedback: 'Good teams use feedback — that is iteration fuel.',
            incorrectFeedback: 'Teammate feedback is a clue — use it to improve.',
            hint: 'What should the team do with useful feedback?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '4-5',
        ),
        makeCharlieQuestion(
          {
            id: 'cm7-45-q3',
            question: 'The team\'s tallest try fell. Their medium try stayed up. What is the smart next step?',
            choices: [
              'Build on the stable medium design and improve it',
              'Only chase height without stability',
              'Stop iterating',
              'Document what was stable in the medium try',
            ],
            correctIndex: 0,
            correctFeedback: 'Stable design plus small improvements — classic iteration.',
            incorrectFeedback: 'Start from what stayed up, then improve carefully.',
            hint: 'Which try gave the team useful data to build on?',
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
      'Prototype, test, and revise the marshmallow tower design.',
      [
        makeCharlieQuestion(
          {
            id: 'cm7-68-q1',
            question: 'What is the best design strategy?',
            choices: [
              'Build a prototype, test it, revise the design',
              'Start with one idea, then revise from test results',
              'Make it tall before making it stable',
              'Ignore feedback',
            ],
            correctIndex: 0,
            correctFeedback: 'Prototype → test → revise. Engineering in marshmallow form.',
            incorrectFeedback: 'Strong design means prototype, test, then revise.',
            hint: 'What is the engineering cycle for a wobbly tower?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '6-8',
        ),
        makeCharlieQuestion(
          {
            id: 'cm7-68-q2',
            question: 'Charlie\'s team documents each version: height, wobble, and what changed. Why?',
            choices: [
              'To compare prototypes and choose the best next revision',
              'To impress the marshmallows',
              'To avoid building anything',
              'Because towers require poetry',
            ],
            correctIndex: 0,
            correctFeedback: 'Version notes turn wobbles into design decisions.',
            incorrectFeedback: 'Documenting versions helps the team pick smart revisions.',
            hint: 'What can the team learn from comparing versions?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '6-8',
        ),
        makeCharlieQuestion(
          {
            id: 'cm7-68-q3',
            question: 'One teammate wants height, another wants stability. What is the best team move?',
            choices: [
              'Test a prototype that balances both, then revise',
              'Split up and build competing towers silently',
              'Only build for height',
              'Give up because ideas differ',
            ],
            correctIndex: 0,
            correctFeedback: 'Different goals become one tested prototype — teamwork wins.',
            incorrectFeedback: 'Combine ideas into one prototype, test, then revise together.',
            hint: 'How can two different goals become one design plan?',
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

registerCharlieAdaptiveMission(CHARLIE_MISSION_7_FILE);
