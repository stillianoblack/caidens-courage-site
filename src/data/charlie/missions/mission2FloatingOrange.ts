import type { CharlieAdaptiveMissionFile } from '../../../types/charlieAdaptiveQuest';
import { makeCharlieQuestion, bandContent } from '../charlieQuestionHelpers';

export const CHARLIE_MISSION_2_ID = 'charlie-floating-orange';

const MODULE_ID = CHARLIE_MISSION_2_ID;
const MODULE_TITLE = 'The Floating Orange';
const SKILL = 'Prediction / Hypothesis';

export const CHARLIE_MISSION_2_FILE: CharlieAdaptiveMissionFile = {
  id: MODULE_ID,
  title: "Charlie Perk's Science Lab",
  subtitle: MODULE_TITLE,
  character: 'charlie',
  missionNumber: 2,
  skillArea: SKILL,
  skillFocus: ['Prediction', 'Hypothesis', 'Testing Ideas'],
  storySetup:
    'Charlie drops an orange into water. It floats. Then he peels it, drops it again, and makes a face like the orange just revealed a secret.',
  missionB4Tip:
    'A good experiment changes one thing at a time. That way your brain knows what caused the result.',
  scenarioAccent: 'frog-pond',
  landing: {
    eyebrow: 'MISSION 2',
    title: "Charlie Perk's Science Lab",
    subtitle: MODULE_TITLE,
    body: 'An orange floats, then sinks after peeling — what changed, and what will happen next?',
    cta: 'Start Mission',
  },
  complete: {
    title: 'Hypothesis Badge Earned!',
    message: 'You helped Charlie predict, test, and learn what changed. Science loves a good surprise.',
    badges: ['Prediction Pro', 'Test Thinker', 'Variable Spotter'],
  },
  gradeContent: {
    'K-1': bandContent(
      'Notice what changed when Charlie peeled the orange.',
      [
        makeCharlieQuestion(
          {
            id: 'cm2-k1-q1',
            question: 'What changed in Charlie\'s experiment?',
            choices: [
              'The bowl was in the same place',
              'The orange peel came off',
              'Charlie used the same water',
              'Nothing changed at all',
            ],
            correctIndex: 1,
            correctFeedback: 'Right! Peeling the orange is what Charlie changed.',
            incorrectFeedback: 'Look at the orange — what did Charlie do differently?',
            hint: 'What did Charlie do to the orange before the second drop?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          'K-1',
        ),
        makeCharlieQuestion(
          {
            id: 'cm2-k1-q2',
            question: 'The whole orange floated. The peeled orange sank. What should Charlie notice?',
            choices: [
              'The orange acted differently after peeling',
              'The water got tired',
              'One test is not enough to prove it every time',
              'Peeling made the bowl bigger',
            ],
            correctIndex: 0,
            correctFeedback: 'Nice noticing! Something about peeling changed what happened.',
            incorrectFeedback: 'Compare the two drops — what was different?',
            hint: 'Did the orange do the same thing both times?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          'K-1',
        ),
        makeCharlieQuestion(
          {
            id: 'cm2-k1-q3',
            question: 'Charlie wants to try again. What should he change?',
            choices: [
              'Try a different bowl and different water together',
              'Wait and hope the result changes by itself',
              'Only one thing, like peeling or not peeling',
              'Skip testing and guess',
            ],
            correctIndex: 2,
            correctFeedback: 'Smart! Change one thing so Charlie knows what mattered.',
            incorrectFeedback: 'Scientists change one thing at a time.',
            hint: 'How can Charlie tell what caused the result?',
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
      'Make predictions before testing what the peeled orange will do.',
      [
        makeCharlieQuestion(
          {
            id: 'cm2-23-q1',
            question: 'What should Charlie do before dropping the peeled orange?',
            choices: [
              'Make a prediction',
              'Repeat the test with one small change',
              'Ask a classmate to help check the setup',
              'Start a new mystery',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes! A prediction is a scientist\'s best guess before testing.',
            incorrectFeedback: 'Scientists predict first, then test to see if they were right.',
            hint: 'What do you do before an experiment to guess the outcome?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '2-3',
        ),
        makeCharlieQuestion(
          {
            id: 'cm2-23-q2',
            question: 'Charlie predicts the peeled orange will sink. Why is that a good prediction?',
            choices: [
              'It is based on what he already saw happen',
              'It is the silliest guess',
              'It ignores the first test',
              'It changes two things at once',
            ],
            correctIndex: 0,
            correctFeedback: 'Good predictions use clues from earlier tests.',
            incorrectFeedback: 'The best guesses use what you already observed.',
            hint: 'What did the first peeled drop tell Charlie?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '2-3',
        ),
        makeCharlieQuestion(
          {
            id: 'cm2-23-q3',
            question: 'The peeled orange sank again. What should Charlie do next?',
            choices: [
              'Think about why peeling might matter',
              'Pause and choose one new thing to test',
              'Say water is broken',
              'Write the result down and test again',
            ],
            correctIndex: 0,
            correctFeedback: 'Repeated results mean it is time to wonder why.',
            incorrectFeedback: 'When the same thing happens again, ask what caused it.',
            hint: 'The orange sank twice — what should Charlie wonder about?',
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
      'Connect peel and air pockets to why the orange floats or sinks.',
      [
        makeCharlieQuestion(
          {
            id: 'cm2-45-q1',
            question: 'Why might the unpeeled orange float better?',
            choices: [
              'The orange is more colorful before peeling',
              'The bowl is extra full',
              'The peel can trap tiny pockets of air',
              'Floating depends on luck each time',
            ],
            correctIndex: 2,
            correctFeedback: 'Exactly. Air pockets in the peel help it stay up.',
            incorrectFeedback: 'Think about what the peel might hold that helps things float.',
            hint: 'What inside the peel could help the orange stay on top?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '4-5',
        ),
        makeCharlieQuestion(
          {
            id: 'cm2-45-q2',
            question: 'When Charlie removes the peel, what might he also remove?',
            choices: [
              'Some of the air pockets that helped it float',
              'The orange\'s ability to be round',
              'All the water in the bowl',
              'The classroom lights',
            ],
            correctIndex: 0,
            correctFeedback: 'Peeling can let water in and push out helpful air pockets.',
            incorrectFeedback: 'What did the peel hold that changed when it came off?',
            hint: 'What was inside the peel that helped the first orange float?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '4-5',
        ),
        makeCharlieQuestion(
          {
            id: 'cm2-45-q3',
            question: 'Charlie tests a peeled orange and an unpeeled orange in the same bowl. Why is that fair?',
            choices: [
              'Only the peel is different — everything else stays the same',
              'He used two different bowls on purpose',
              'He changed the water and the peel',
              'He only tested once',
            ],
            correctIndex: 0,
            correctFeedback: 'Fair tests change one thing so you know what caused the result.',
            incorrectFeedback: 'A fair test keeps everything the same except what you are testing.',
            hint: 'What is the only thing Charlie changed between the two oranges?',
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
      'Identify variables and form hypotheses about buoyancy.',
      [
        makeCharlieQuestion(
          {
            id: 'cm2-68-q1',
            question: 'What variable did Charlie change?',
            choices: [
              'Whether the orange had a peel',
              'How much water was in the bowl',
              'The temperature of the water',
              'Whether both oranges were the same size',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. The peel is the variable Charlie controlled.',
            incorrectFeedback: 'A variable is the one thing you change on purpose.',
            hint: 'What was different between the floating test and the sinking test?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '6-8',
        ),
        makeCharlieQuestion(
          {
            id: 'cm2-68-q2',
            question: 'Which hypothesis best fits Charlie\'s results?',
            choices: [
              'The orange floated because Charlie watched carefully',
              'Peeling changes how water and air interact with the orange',
              'The peel helps trap air, which affects whether the orange floats',
              'The result cannot be explained with evidence',
            ],
            correctIndex: 2,
            correctFeedback: 'Strong hypothesis — it explains both the float and the sink.',
            incorrectFeedback: 'A good hypothesis explains the evidence from both tests.',
            hint: 'What could the peel do that changes floating?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '6-8',
        ),
        makeCharlieQuestion(
          {
            id: 'cm2-68-q3',
            question: 'Charlie wants to test his hypothesis again. What should stay constant?',
            choices: [
              'The same bowl, water level, and orange size',
              'A different fruit, bowl, and room each time',
              'Only the hypothesis — change everything else',
              'Use the same setup so the result is comparable',
            ],
            correctIndex: 0,
            correctFeedback: 'Controlling variables keeps the test fair and repeatable.',
            incorrectFeedback: 'Keep everything the same except the one thing you are testing.',
            hint: 'What should NOT change if Charlie repeats the experiment?',
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
