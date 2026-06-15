import type { CharlieAdaptiveMissionFile } from '../../../types/charlieAdaptiveQuest';
import { registerCharlieAdaptiveMission } from '../charlieAdaptiveBuilder';
import { makeCharlieQuestion, bandContent } from '../charlieQuestionHelpers';

export const CHARLIE_MISSION_4_ID = 'charlie-volcano-trouble';

const MODULE_ID = CHARLIE_MISSION_4_ID;
const MODULE_TITLE = 'Volcano Trouble';
const SKILL = 'Problem Solving / Iteration';

export const CHARLIE_MISSION_4_FILE: CharlieAdaptiveMissionFile = {
  id: MODULE_ID,
  title: "Charlie Perk's Science Lab",
  subtitle: MODULE_TITLE,
  character: 'charlie',
  missionNumber: 4,
  skillArea: SKILL,
  skillFocus: ['Problem Solving', 'Iteration', 'Experimentation'],
  storySetup:
    'Charlie builds a baking soda volcano, but the eruption is tiny. It gives one sad bubble and quits. Charlie refuses to let a volcano be this dramatic and boring.',
  missionB4Tip: 'Failed experiments are not failures. They are data wearing a messy hat.',
  scenarioAccent: 'rain-cloud',
  landing: {
    eyebrow: 'MISSION 4',
    title: "Charlie Perk's Science Lab",
    subtitle: MODULE_TITLE,
    body: 'One sad bubble is not a volcano — help Charlie iterate toward a better eruption.',
    cta: 'Start Mission',
  },
  complete: {
    title: 'Iteration Badge Earned!',
    message: 'You helped Charlie treat a tiny bubble as data, not defeat. Volcanoes can do better.',
    badges: ['Volcano Fixer', 'Data Collector', 'Try-Again Scientist'],
  },
  gradeContent: {
    'K-1': bandContent(
      'Try again safely when Charlie\'s volcano needs a better eruption.',
      [
        makeCharlieQuestion(
          {
            id: 'cm4-k1-q1',
            question: 'What should Charlie do next?',
            choices: [
              'Try again with help',
              'Throw the volcano away',
              'Do one small change and test again',
              'Dump random supplies in at once',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes! Scientists try again — especially with a grown-up nearby.',
            incorrectFeedback: 'A tiny bubble means try again safely, not give up.',
            hint: 'What do scientists do when an experiment does not work yet?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          'K-1',
        ),
        makeCharlieQuestion(
          {
            id: 'cm4-k1-q2',
            question: 'Charlie\'s volcano made one tiny bubble. Is that a failure?',
            choices: [
              'No — it tells Charlie what to try next',
              'No — one small result can still guide the next test',
              'No — it means the setup needs a better next step',
              'No — even tiny bubbles are useful evidence',
            ],
            correctIndex: 0,
            correctFeedback: 'Small results are still data. Charlie can learn from them.',
            incorrectFeedback: 'Even tiny bubbles teach Charlie something useful.',
            hint: 'Did Charlie learn anything from the tiny eruption?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          'K-1',
        ),
        makeCharlieQuestion(
          {
            id: 'cm4-k1-q3',
            question: 'Charlie wants a bigger reaction. Who should help him stay safe?',
            choices: [
              'A teacher or grown-up',
              'Nobody — pour everything fast',
              'The volcano itself',
              'A teacher or lab helper nearby',
            ],
            correctIndex: 0,
            correctFeedback: 'Grown-ups help keep science exciting and safe.',
            incorrectFeedback: 'Chemical reactions need a safe helper nearby.',
            hint: 'Who keeps experiments safe in the classroom?',
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
      'Change one thing at a time to improve Charlie\'s volcano.',
      [
        makeCharlieQuestion(
          {
            id: 'cm4-23-q1',
            question: 'What is the smart way to improve the volcano?',
            choices: [
              'Change one ingredient amount at a time',
              'Change everything at once',
              'Stop measuring',
              'Change one measured amount at a time',
            ],
            correctIndex: 0,
            correctFeedback: 'One change at a time — then Charlie knows what helped.',
            incorrectFeedback: 'If you change everything, you won\'t know what fixed it.',
            hint: 'How can Charlie tell which change made the difference?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '2-3',
        ),
        makeCharlieQuestion(
          {
            id: 'cm4-23-q2',
            question: 'Charlie adds a little more vinegar and gets more bubbles. What should he do?',
            choices: [
              'Remember that change worked and try the next small tweak',
              'Add every liquid in the room',
              'Stop testing because one bubble is enough',
              'Record the result and discuss the next test',
            ],
            correctIndex: 0,
            correctFeedback: 'Iteration means keep small improvements going.',
            incorrectFeedback: 'When one change helps, note it and keep testing carefully.',
            hint: 'Charlie got more bubbles — what is the smart next step?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '2-3',
        ),
        makeCharlieQuestion(
          {
            id: 'cm4-23-q3',
            question: 'Why should Charlie not change vinegar AND baking soda at the same time?',
            choices: [
              'He would not know which change caused the result',
              'Volcanoes only allow one ingredient total',
              'Measuring is boring',
              'Bubbles hate pairs of changes',
            ],
            correctIndex: 0,
            correctFeedback: 'One variable at a time keeps the test fair.',
            incorrectFeedback: 'Change one thing so you know what actually worked.',
            hint: 'What problem happens if two things change together?',
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
      'Measure ingredients and compare amounts for a stronger eruption.',
      [
        makeCharlieQuestion(
          {
            id: 'cm4-45-q1',
            question: 'Why should Charlie measure the baking soda and vinegar?',
            choices: [
              'So he can compare what works best',
              'So he can repeat the same test later',
              'So he can share clear results with teammates',
              'So testing is no longer needed',
            ],
            correctIndex: 0,
            correctFeedback: 'Measurements turn guesses into useful comparisons.',
            incorrectFeedback: 'Measuring helps Charlie compare one test to the next.',
            hint: 'Why do scientists write down amounts?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '4-5',
        ),
        makeCharlieQuestion(
          {
            id: 'cm4-45-q2',
            question: 'Test A: 1 spoon baking soda, small bubble. Test B: 2 spoons, bigger bubble. What did Charlie learn?',
            choices: [
              'More baking soda might improve the reaction',
              'He should repeat the test to confirm the pattern',
              'He may need to test vinegar next in a separate round',
              'Amount changes can never affect bubbles',
            ],
            correctIndex: 0,
            correctFeedback: 'Comparing measured tests gives Charlie real data.',
            incorrectFeedback: 'Look at the amounts — what changed between Test A and B?',
            hint: 'What was different between the two measured tests?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '4-5',
        ),
        makeCharlieQuestion(
          {
            id: 'cm4-45-q3',
            question: 'Charlie keeps a chart of each volcano try. Why is that useful?',
            choices: [
              'He can see which amounts gave the best eruption',
              'Charts make volcanoes erupt automatically',
              'Charts replace safety rules',
              'Charts help him choose the next revision',
            ],
            correctIndex: 0,
            correctFeedback: 'A chart is iteration memory — Charlie can spot what works.',
            incorrectFeedback: 'Recording each try helps Charlie compare results over time.',
            hint: 'What can Charlie do with a list of past tests?',
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
      'Control variables while testing for a stronger volcano eruption.',
      [
        makeCharlieQuestion(
          {
            id: 'cm4-68-q1',
            question: 'Charlie wants a stronger eruption. What should he keep the same?',
            choices: [
              'All variables except the one he is testing',
              'Nothing at all',
              'Only the volcano name',
              'The funniest guess',
            ],
            correctIndex: 0,
            correctFeedback: 'Control variables — change one, hold the rest steady.',
            incorrectFeedback: 'Keep everything the same except the single thing you are testing.',
            hint: 'What makes an experiment controlled and fair?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '6-8',
        ),
        makeCharlieQuestion(
          {
            id: 'cm4-68-q2',
            question: 'Charlie tests more vinegar while keeping baking soda and cup size the same. What is he doing?',
            choices: [
              'Testing one independent variable while controlling others',
              'Changing every variable at once',
              'Avoiding measurement on purpose',
              'Running an unfair test',
            ],
            correctIndex: 0,
            correctFeedback: 'That is controlled testing — one change, everything else fixed.',
            incorrectFeedback: 'He is only changing vinegar while holding other factors steady.',
            hint: 'What is Charlie changing, and what is he keeping fixed?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '6-8',
        ),
        makeCharlieQuestion(
          {
            id: 'cm4-68-q3',
            question: 'Three tries with the same weak bubble. What is the best scientific response?',
            choices: [
              'Analyze the data, adjust one variable, and test again',
              'Keep one setup detail the same and test a new single change',
              'Ask for help reviewing the data before the next try',
              'Change every variable at once and guess',
            ],
            correctIndex: 0,
            correctFeedback: 'Repeated weak results are data — time to iterate thoughtfully.',
            incorrectFeedback: 'Weak repeats mean review your data and change one thing.',
            hint: 'What do scientists do with repeated disappointing data?',
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

registerCharlieAdaptiveMission(CHARLIE_MISSION_4_FILE);
