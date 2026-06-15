import type { CharlieAdaptiveMissionFile } from '../../../types/charlieAdaptiveQuest';
import { registerCharlieAdaptiveMission } from '../charlieAdaptiveBuilder';
import { makeCharlieQuestion, bandContent } from '../charlieQuestionHelpers';

export const CHARLIE_MISSION_1_ID = 'charlie-mystery-footprints';

const MODULE_ID = CHARLIE_MISSION_1_ID;
const MODULE_TITLE = 'The Mystery Footprints';
const SKILL = 'Observation';

export const CHARLIE_MISSION_1_FILE: CharlieAdaptiveMissionFile = {
  id: MODULE_ID,
  title: "Charlie Perk's Science Lab",
  subtitle: MODULE_TITLE,
  character: 'charlie',
  missionNumber: 1,
  skillArea: SKILL,
  skillFocus: ['Observation', 'Evidence', 'Curiosity'],
  storySetup:
    'Charlie discovers strange footprints near the school garden. Something has been snacking on the lettuce, and Charlie wants to solve the mystery without blaming the class hamster again.',
  missionB4Tip: 'Scientists look first. Guess later. Observation comes before explanation.',
  scenarioAccent: 'muddy-footprints',
  landing: {
    eyebrow: 'MISSION 1',
    title: "Charlie Perk's Science Lab",
    subtitle: MODULE_TITLE,
    body: 'Strange footprints and nibbled lettuce — time to observe before anyone blames the hamster.',
    cta: 'Start Mission',
  },
  complete: {
    title: 'Observation Badge Earned!',
    message: 'You helped Charlie look closely and protect the clues. Real scientists observe first.',
    badges: ['Nature Detective', 'Clue Spotter', 'Evidence First'],
  },
  gradeContent: {
    'K-1': bandContent(
      'Notice details in the garden mystery before making guesses.',
      [
        makeCharlieQuestion(
          {
            id: 'cm1-k1-q1',
            question: 'What should Charlie do first?',
            choices: [
              'Look closely at the footprints',
              'Look from the path and avoid disturbing clues',
              'Blame the hamster',
              'Step on the footprints',
            ],
            correctIndex: 0,
            correctFeedback: 'Nice scientist move. Charlie looks before he guesses.',
            incorrectFeedback: 'Not yet. Scientists protect clues before they make guesses.',
            hint: 'What do scientists do before they guess?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          'K-1',
        ),
        makeCharlieQuestion(
          {
            id: 'cm1-k1-q2',
            question: 'Charlie sees the footprints go toward the lettuce. What did he notice?',
            choices: [
              'The tracks lead to the snack spot',
              'The lettuce is singing',
              'The garden is on vacation',
              'The tracks are faint and need closer observation',
            ],
            correctIndex: 0,
            correctFeedback: 'Good eyes! The path tells Charlie where the mystery visitor went.',
            incorrectFeedback: 'Look again — where do the tracks point?',
            hint: 'Follow the footprints with your eyes.',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          'K-1',
        ),
        makeCharlieQuestion(
          {
            id: 'cm1-k1-q3',
            question: 'Charlie finds a tiny feather near the footprints. What should he do?',
            choices: [
              'Show a grown-up the clue without touching it',
              'Mark the spot and show a grown-up',
              'Leave it where it is and document it',
              'Use it as a pencil',
            ],
            correctIndex: 0,
            correctFeedback: 'Smart move. Clues stay safer when a grown-up helps.',
            incorrectFeedback: 'Clues work best when you protect them and get help.',
            hint: 'How can Charlie keep the feather safe as evidence?',
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
      'Compare clues from the garden scene to solve the footprint mystery.',
      [
        makeCharlieQuestion(
          {
            id: 'cm1-23-q1',
            question: 'What clue should Charlie compare?',
            choices: [
              'The shape of the footprints',
              "The color of Charlie's shoes",
              'The lunch menu',
              'The sound of the bell',
            ],
            correctIndex: 0,
            correctFeedback: 'Exactly. Comparing shapes helps Charlie find a better clue.',
            incorrectFeedback: 'Close, but Charlie needs evidence from the scene.',
            hint: 'Which clue came from the garden itself?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '2-3',
        ),
        makeCharlieQuestion(
          {
            id: 'cm1-23-q2',
            question: 'Charlie finds big footprints AND small footprints. What should he compare?',
            choices: [
              'The size and shape of each set',
              'Which footprint is louder',
              'Which one tastes better',
              'Which one is newer than tomorrow',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes! Size and shape help Charlie figure out who visited.',
            incorrectFeedback: 'Scientists compare what they can see and measure.',
            hint: 'What can Charlie actually observe about each set of tracks?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '2-3',
        ),
        makeCharlieQuestion(
          {
            id: 'cm1-23-q3',
            question: 'The footprints have three pointy marks. What might that mean?',
            choices: [
              'The animal might have three toes or claws',
              'The animal definitely wears sneakers',
              'The garden made the marks for fun',
              'Three footprints means three hamsters',
            ],
            correctIndex: 0,
            correctFeedback: 'Nice comparing! Track shapes hint at how many toes or claws made them.',
            incorrectFeedback: 'Look at the shape — what body part could leave pointy marks?',
            hint: 'What part of an animal touches the ground?',
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
      'Record observations before guessing who left the garden footprints.',
      [
        makeCharlieQuestion(
          {
            id: 'cm1-45-q1',
            question: 'Why should Charlie write down what he sees?',
            choices: [
              'So he can compare evidence later',
              'So the footprints look cooler',
              'So he can skip the mystery',
              'So the garden feels famous',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Notes help Charlie remember the evidence.',
            incorrectFeedback: 'Not quite. Good notes help scientists avoid guessing too fast.',
            hint: 'Why do scientists keep notebooks?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '4-5',
        ),
        makeCharlieQuestion(
          {
            id: 'cm1-45-q2',
            question: 'Charlie draws the footprint shape in his notebook. Why is that smart?',
            choices: [
              'So he can compare it to animal track guides later',
              'So the drawing wins an art contest',
              'So the footprints disappear',
              'So he can compare clues after leaving the scene',
            ],
            correctIndex: 0,
            correctFeedback: 'Recording shapes lets Charlie match evidence to real animals.',
            incorrectFeedback: 'Drawings are useful when you need to compare clues later.',
            hint: 'What can Charlie do with a drawing after he leaves the garden?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '4-5',
        ),
        makeCharlieQuestion(
          {
            id: 'cm1-45-q3',
            question: 'Before guessing who made the tracks, what else should Charlie record?',
            choices: [
              'Where the tracks start and end',
              'His favorite sandwich',
              'How loud the hallway is',
              'The hamster\'s mood',
            ],
            correctIndex: 0,
            correctFeedback: 'Location matters — it shows where the visitor went and why.',
            incorrectFeedback: 'Scientists note where clues begin and where they lead.',
            hint: 'What path information would help solve the mystery?',
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
      'Build strong conclusions from multiple pieces of garden evidence.',
      [
        makeCharlieQuestion(
          {
            id: 'cm1-68-q1',
            question: 'What makes Charlie\'s conclusion stronger?',
            choices: [
              'Multiple pieces of matching evidence',
              'The funniest theory',
              'The first idea he has',
              'A guess from across the playground',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Strong conclusions need evidence that lines up.',
            incorrectFeedback: 'Not yet. Charlie needs evidence, not just a fun theory.',
            hint: 'What turns a guess into a solid conclusion?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '6-8',
        ),
        makeCharlieQuestion(
          {
            id: 'cm1-68-q2',
            question: 'Charlie finds footprints, nibbled lettuce, and a trail of seeds. What strengthens his case?',
            choices: [
              'All three clues point to the same kind of visitor',
              'Three clues means three separate mysteries',
              'Seeds mean someone planted a garden inside the garden',
              'Lettuce crumbs prove the hamster is guilty',
            ],
            correctIndex: 0,
            correctFeedback: 'When evidence lines up, the theory gets much stronger.',
            incorrectFeedback: 'Look for clues that support the same explanation.',
            hint: 'Do these clues tell one story or three unrelated ones?',
          },
          SKILL,
          MODULE_ID,
          MODULE_TITLE,
          '6-8',
        ),
        makeCharlieQuestion(
          {
            id: 'cm1-68-q3',
            question: 'A classmate says, "Definitely the hamster!" What should Charlie ask?',
            choices: [
              'What evidence supports that theory?',
              'Who has the funniest guess?',
              'Can we vote on it?',
              'Does the hamster look guilty?',
            ],
            correctIndex: 0,
            correctFeedback: 'Evidence questions keep science fair — even for hamsters.',
            incorrectFeedback: 'A strong scientist asks what proof backs up a claim.',
            hint: 'How do you test whether a guess is actually supported?',
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

registerCharlieAdaptiveMission(CHARLIE_MISSION_1_FILE);
