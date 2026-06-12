import type { CharlieAdaptiveMissionFile } from '../../../types/charlieAdaptiveQuest';
import { registerCharlieAdaptiveMission } from '../charlieAdaptiveBuilder';
import { makeCharlieQuestion, bandContent } from '../charlieQuestionHelpers';

export const CHARLIE_MISSION_5_ID = 'charlie-missing-plant';

const MODULE_ID = CHARLIE_MISSION_5_ID;
const MODULE_TITLE = 'The Missing Plant';
const SKILL = 'Cause and Effect';

export const CHARLIE_MISSION_5_FILE: CharlieAdaptiveMissionFile = {
  id: MODULE_ID,
  title: "Charlie Perk's Science Lab",
  subtitle: MODULE_TITLE,
  character: 'charlie',
  missionNumber: 5,
  skillArea: SKILL,
  skillFocus: ['Cause and Effect', 'Observation', 'Investigation'],
  storySetup:
    'Two classroom plants started the same. One is thriving. One looks like it just heard bad news. Charlie investigates what changed.',
  missionB4Tip:
    'When two things have different results, look for what changed. Cause and effect love leaving clues.',
  scenarioAccent: 'butterfly-pollination',
  landing: {
    eyebrow: 'MISSION 5',
    title: "Charlie Perk's Science Lab",
    subtitle: MODULE_TITLE,
    body: 'One plant is thriving and one is wilting — what changed between them?',
    cta: 'Start Mission',
  },
  complete: {
    title: 'Cause & Effect Badge Earned!',
    message: 'You helped Charlie connect what changed to what happened. Plants do not wilt for drama.',
    badges: ['Plant Detective', 'Cause Finder', 'Careful Observer'],
  },
  gradeContent: {
    'K-1': bandContent(
      'Check basic plant needs when one classroom plant looks unhappy.',
      [
        makeCharlieQuestion(
          {
            id: 'cm5-k1-q1',
            question: 'What does Charlie check first?',
            choices: [
              'If the plant got water and light',
              'If the plant likes jokes',
              'If the pencil is tired',
              'If the wall is green',
            ],
            correctIndex: 0,
            correctFeedback: 'Good start! Plants need water and light to stay happy.',
            incorrectFeedback: 'Think about what plants need every day.',
            hint: 'What helps plants grow?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          'K-1',
        ),
        makeCharlieQuestion(
          {
            id: 'cm5-k1-q2',
            question: 'One plant has dry soil. What might have happened?',
            choices: [
              'It did not get enough water',
              'It ate too much lunch',
              'It stayed up too late watching TV',
              'It turned into a pencil',
            ],
            correctIndex: 0,
            correctFeedback: 'Dry soil is a clue — plants need water.',
            incorrectFeedback: 'Dry soil often means the plant needs a drink.',
            hint: 'What does dry soil tell Charlie?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          'K-1',
        ),
        makeCharlieQuestion(
          {
            id: 'cm5-k1-q3',
            question: 'Charlie waters the dry plant. What is he testing?',
            choices: [
              'Whether water helps the sad plant',
              'Whether plants can fly',
              'Whether soil likes colors',
              'Whether desks need water',
            ],
            correctIndex: 0,
            correctFeedback: 'Charlie is checking cause and effect — water might help.',
            incorrectFeedback: 'Watering tests if missing water caused the problem.',
            hint: 'Charlie found dry soil — what is he trying to fix?',
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
      'Compare light and water between the two classroom plants.',
      [
        makeCharlieQuestion(
          {
            id: 'cm5-23-q1',
            question: 'One plant is near the window and one is in the dark corner. What should Charlie notice?',
            choices: [
              'Light may be making a difference',
              'The dark corner is cooler at games',
              'The window plant is showing off',
              'The plants are racing',
            ],
            correctIndex: 0,
            correctFeedback: 'Light is a big clue when two plants started the same.',
            incorrectFeedback: 'Compare where each plant sits — light matters.',
            hint: 'What is different about where the two plants live?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '2-3',
        ),
        makeCharlieQuestion(
          {
            id: 'cm5-23-q2',
            question: 'The happy plant gets watered on schedule. The sad one was skipped twice. What might be the cause?',
            choices: [
              'Missing water could be hurting the sad plant',
              'Plants prefer being ignored',
              'Water only works on Mondays',
              'The happy plant is just luckier at cards',
            ],
            correctIndex: 0,
            correctFeedback: 'Cause and effect — less water can lead to a wilted plant.',
            incorrectFeedback: 'Compare watering — what changed for the sad plant?',
            hint: 'What care difference did Charlie find?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '2-3',
        ),
        makeCharlieQuestion(
          {
            id: 'cm5-23-q3',
            question: 'Charlie moves the sad plant closer to the window for one week. Why?',
            choices: [
              'To test if more light helps it recover',
              'To make the plant famous',
              'To hide it from the teacher',
              'To see if plants like field trips',
            ],
            correctIndex: 0,
            correctFeedback: 'Testing one change — that is how Charlie checks cause and effect.',
            incorrectFeedback: 'Charlie is testing whether light was the missing cause.',
            hint: 'What one thing is Charlie changing to help the plant?',
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
      'Identify cause and effect from differences in water, light, and soil.',
      [
        makeCharlieQuestion(
          {
            id: 'cm5-45-q1',
            question: 'What evidence helps Charlie explain the wilted plant?',
            choices: [
              'Differences in water, light, or soil',
              'The plant\'s favorite song',
              'Charlie\'s lunch choice',
              'The color of the desk',
            ],
            correctIndex: 0,
            correctFeedback: 'Environmental differences are real cause-and-effect clues.',
            incorrectFeedback: 'Look for what changed in water, light, or soil.',
            hint: 'What plant needs might be different between the two?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '4-5',
        ),
        makeCharlieQuestion(
          {
            id: 'cm5-45-q2',
            question: 'The wilted plant\'s soil is dry AND it sits in shade. What should Charlie do first?',
            choices: [
              'Test one change at a time — water OR light',
              'Change water, light, soil, and pot all at once',
              'Decide the plant is hopeless',
              'Only measure desk height',
            ],
            correctIndex: 0,
            correctFeedback: 'Two possible causes means test one fix at a time.',
            incorrectFeedback: 'If two things differ, change one at a time to find the cause.',
            hint: 'How can Charlie tell whether water or light is the main cause?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '4-5',
        ),
        makeCharlieQuestion(
          {
            id: 'cm5-45-q3',
            question: 'After Charlie adds water, the plant perks up a little. What does that suggest?',
            choices: [
              'Lack of water was at least part of the cause',
              'Water never affects plants',
              'The plant was pretending',
              'Light does not matter at all',
            ],
            correctIndex: 0,
            correctFeedback: 'A response to water is cause-and-effect evidence.',
            incorrectFeedback: 'When the plant improves after water, water was likely part of the problem.',
            hint: 'What happened after Charlie changed the water?',
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
      'Plan a controlled investigation of environmental factors.',
      [
        makeCharlieQuestion(
          {
            id: 'cm5-68-q1',
            question: 'What is the best investigation plan?',
            choices: [
              'Compare environmental conditions and change one factor at a time',
              'Move both plants randomly every hour',
              'Guess based on leaf drama',
              'Stop observing after one day',
            ],
            correctIndex: 0,
            correctFeedback: 'Systematic comparison — that is strong cause-and-effect science.',
            incorrectFeedback: 'Compare conditions and test one factor at a time.',
            hint: 'How do scientists isolate what caused a difference?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '6-8',
        ),
        makeCharlieQuestion(
          {
            id: 'cm5-68-q2',
            question: 'Charlie records light hours, water amount, and soil moisture for both plants. Why?',
            choices: [
              'To compare conditions and spot which factor changed',
              'To write a plant report card',
              'To prove plants have opinions',
              'To avoid testing anything',
            ],
            correctIndex: 0,
            correctFeedback: 'Data comparison reveals which factor likely caused the wilt.',
            incorrectFeedback: 'Recording conditions helps Charlie see what differed.',
            hint: 'What can Charlie do with measurements from both plants?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '6-8',
        ),
        makeCharlieQuestion(
          {
            id: 'cm5-68-q3',
            question: 'A classmate says the sad plant is "just dramatic." What is Charlie\'s best response?',
            choices: [
              'Show the data on water and light differences',
              'Agree without checking anything',
              'Ignore both plants',
              'Rename the plant Drama Queen and stop',
            ],
            correctIndex: 0,
            correctFeedback: 'Evidence beats labels — Charlie has measurements.',
            incorrectFeedback: 'Cause and effect needs data, not nicknames.',
            hint: 'How can Charlie back up his explanation with evidence?',
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

registerCharlieAdaptiveMission(CHARLIE_MISSION_5_FILE);
