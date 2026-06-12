import type { CharlieAdaptiveMissionFile } from '../../../types/charlieAdaptiveQuest';
import { registerCharlieAdaptiveMission } from '../charlieAdaptiveBuilder';
import { makeCharlieQuestion, bandContent } from '../charlieQuestionHelpers';

export const CHARLIE_MISSION_3_ID = 'charlie-mystery-sound';

const MODULE_ID = CHARLIE_MISSION_3_ID;
const MODULE_TITLE = 'The Mystery Sound';
const SKILL = 'Active Listening / Attention';

export const CHARLIE_MISSION_3_FILE: CharlieAdaptiveMissionFile = {
  id: MODULE_ID,
  title: "Charlie Perk's Science Lab",
  subtitle: MODULE_TITLE,
  character: 'charlie',
  missionNumber: 3,
  skillArea: SKILL,
  skillFocus: ['Active Listening', 'Attention', 'Pattern Recognition'],
  storySetup:
    'During science club, a weird squeak keeps interrupting the room. Charlie wants to investigate before everyone decides the cabinets are haunted.',
  missionB4Tip:
    'Patterns are clues wearing tiny detective hats. Notice when something happens, not just that it happens.',
  scenarioAccent: 'woodpecker',
  landing: {
    eyebrow: 'MISSION 3',
    title: "Charlie Perk's Science Lab",
    subtitle: MODULE_TITLE,
    body: 'A squeak keeps interrupting science club — listen for patterns before blaming haunted cabinets.',
    cta: 'Start Mission',
  },
  complete: {
    title: 'Listening Badge Earned!',
    message: 'You helped Charlie listen carefully and follow the pattern. Ghost cabinets denied.',
    badges: ['Sound Detective', 'Pattern Spotter', 'Careful Listener'],
  },
  gradeContent: {
    'K-1': bandContent(
      'Listen carefully and notice where the mystery squeak comes from.',
      [
        makeCharlieQuestion(
          {
            id: 'cm3-k1-q1',
            question: 'What should Charlie do when he hears the squeak?',
            choices: [
              'Stop and listen carefully',
              'Scream "ghost cabinet"',
              'Cover every window',
              'Blame his backpack',
            ],
            correctIndex: 0,
            correctFeedback: 'Great listening! Charlie pauses before he guesses.',
            incorrectFeedback: 'Scientists listen first — loud guesses can wait.',
            hint: 'What should your ears do before your mouth?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          'K-1',
        ),
        makeCharlieQuestion(
          {
            id: 'cm3-k1-q2',
            question: 'The squeak sounds like it comes from the back corner. What should Charlie do?',
            choices: [
              'Look toward where the sound came from',
              'Close his eyes and run',
              'Make a louder squeak',
              'Ignore the sound completely',
            ],
            correctIndex: 0,
            correctFeedback: 'Nice! Ears and eyes work together in science club.',
            incorrectFeedback: 'Listen, then look where the sound seems to come from.',
            hint: 'After listening, what sense helps Charlie find the source?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          'K-1',
        ),
        makeCharlieQuestion(
          {
            id: 'cm3-k1-q3',
            question: 'Charlie hears the squeak again. What is he collecting?',
            choices: [
              'Clues about the sound',
              'Lunch menus',
              'New jokes',
              'Extra homework',
            ],
            correctIndex: 0,
            correctFeedback: 'Every squeak is a clue — Charlie is building evidence.',
            incorrectFeedback: 'Sounds can be clues when you pay attention.',
            hint: 'What is Charlie trying to solve?',
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
      'Notice when the mystery squeak happens to find patterns.',
      [
        makeCharlieQuestion(
          {
            id: 'cm3-23-q1',
            question: 'What can help Charlie solve the sound?',
            choices: [
              'Notice when it happens',
              'Guess without listening',
              'Make a louder sound',
              'Leave the room forever',
            ],
            correctIndex: 0,
            correctFeedback: 'Timing is a clue! When it squeaks matters.',
            incorrectFeedback: 'Listen for when the sound shows up — that is a pattern.',
            hint: 'What question helps turn a noise into a clue?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '2-3',
        ),
        makeCharlieQuestion(
          {
            id: 'cm3-23-q2',
            question: 'The squeak happens right after someone opens a cabinet. What should Charlie notice?',
            choices: [
              'The sound might be connected to the cabinet',
              'Cabinets are always haunted',
              'Opening things is illegal in science club',
              'The squeak only happens on Tuesdays in space',
            ],
            correctIndex: 0,
            correctFeedback: 'Good pattern spotting — the cabinet might be part of the mystery.',
            incorrectFeedback: 'When two things happen together, notice the connection.',
            hint: 'What happens right before the squeak?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '2-3',
        ),
        makeCharlieQuestion(
          {
            id: 'cm3-23-q3',
            question: 'Charlie writes down each time he hears the squeak. Why?',
            choices: [
              'So he can spot a pattern',
              'So the sound gets embarrassed',
              'So science club ends faster',
              'So nobody has to listen',
            ],
            correctIndex: 0,
            correctFeedback: 'Notes turn random squeaks into useful patterns.',
            incorrectFeedback: 'Writing down when things happen helps you see patterns.',
            hint: 'How do scientists remember when a clue appears?',
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
      'Track sound patterns and connect them to possible causes.',
      [
        makeCharlieQuestion(
          {
            id: 'cm3-45-q1',
            question: 'Charlie hears the squeak every time the fan turns on. What does that tell him?',
            choices: [
              'The fan may be connected to the sound',
              'The sound loves science club',
              'The floor is telling jokes',
              'The fan is definitely innocent',
            ],
            correctIndex: 0,
            correctFeedback: 'Pattern found! The fan and the squeak may be linked.',
            incorrectFeedback: 'When the squeak and the fan happen together, that is a clue.',
            hint: 'What happens at the same time as the squeak?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '4-5',
        ),
        makeCharlieQuestion(
          {
            id: 'cm3-45-q2',
            question: 'The squeak only happens when the fan wobbles. What is Charlie tracking?',
            choices: [
              'A pattern between movement and sound',
              'How many pencils are on the table',
              'Who has the loudest voice',
              'Whether ghosts prefer fans',
            ],
            correctIndex: 0,
            correctFeedback: 'Movement plus sound — that is pattern evidence.',
            incorrectFeedback: 'Charlie is linking when the fan wobbles to when it squeaks.',
            hint: 'What two things keep happening together?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '4-5',
        ),
        makeCharlieQuestion(
          {
            id: 'cm3-45-q3',
            question: 'A friend says the cabinet is haunted. What pattern evidence does Charlie have?',
            choices: [
              'The squeak matches the fan turning on, not the cabinet opening',
              'The cabinet has a spooky label',
              'Nobody likes the cabinet',
              'The cabinet is the tallest furniture',
            ],
            correctIndex: 0,
            correctFeedback: 'Evidence beats spooky guesses — the fan pattern is stronger.',
            incorrectFeedback: 'Charlie\'s notes point to the fan, not a ghost.',
            hint: 'What pattern did Charlie actually record?',
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
      'Use pattern evidence to identify and test the cause of the squeak.',
      [
        makeCharlieQuestion(
          {
            id: 'cm3-68-q1',
            question: 'What is the best evidence-based next step?',
            choices: [
              'Test whether the sound stops when the fan is off',
              'Assume the cabinet is haunted',
              'Ignore the pattern',
              'Ask everyone to talk louder',
            ],
            correctIndex: 0,
            correctFeedback: 'Testing the pattern — that is how scientists confirm a cause.',
            incorrectFeedback: 'A good next step tests whether the fan really causes the squeak.',
            hint: 'How can Charlie check if the fan is the cause?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '6-8',
        ),
        makeCharlieQuestion(
          {
            id: 'cm3-68-q2',
            question: 'Charlie turns off the fan and the squeak stops. What can he conclude?',
            choices: [
              'The fan was likely connected to the sound',
              'The cabinet ghost took a break',
              'Science club should never use fans',
              'Patterns are not useful',
            ],
            correctIndex: 0,
            correctFeedback: 'When changing one thing stops the sound, you found a strong clue.',
            incorrectFeedback: 'Stopping the fan stopped the squeak — that is useful evidence.',
            hint: 'What happened when Charlie changed the fan?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '6-8',
        ),
        makeCharlieQuestion(
          {
            id: 'cm3-68-q3',
            question: 'Why is "notice when it happens" stronger than "it happens sometimes"?',
            choices: [
              'Timing helps link the sound to a specific cause',
              'Timing makes the sound scarier',
              'Timing means you can ignore the sound',
              'Timing only matters for music class',
            ],
            correctIndex: 0,
            correctFeedback: 'When is the clue — patterns need timing, not just existence.',
            incorrectFeedback: 'Knowing when a sound happens helps you find what triggers it.',
            hint: 'What extra detail turns a noise into evidence?',
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

registerCharlieAdaptiveMission(CHARLIE_MISSION_3_FILE);
