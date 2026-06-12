import type { B4AdaptiveMissionFile } from '../../../types/b4AdaptiveQuest';
import { registerB4AdaptiveMission } from '../b4AdaptiveBuilder';
import { makeB4Question, bandContent } from '../b4QuestionHelpers';

export const B4_MISSION_1_ID = 'b4-mood-scanner';

const MODULE_ID = B4_MISSION_1_ID;
const MODULE_TITLE = 'Mood Scanner';
const SKILL = 'Emotional Awareness';

export const B4_MISSION_1_FILE: B4AdaptiveMissionFile = {
  id: MODULE_ID,
  title: 'B-4 Focus Missions',
  subtitle: MODULE_TITLE,
  character: 'b4',
  missionNumber: 1,
  skillArea: SKILL,
  skillFocus: ['Emotional Awareness', 'Feeling Identification', 'Self-Awareness'],
  storySetup:
    "B-4's mood scanner starts blinking because someone's feelings are getting big. B-4 needs help naming the feeling before choosing what to do next.",
  missionB4Tip: 'Name the feeling first. Feelings are easier to handle when they have a name.',
  landing: {
    eyebrow: 'MISSION 1',
    title: 'B-4 Focus Missions',
    subtitle: MODULE_TITLE,
    body: "B-4's mood scanner is blinking — time to name the feeling before the alarm gets louder.",
    cta: 'Start Mission',
  },
  complete: {
    title: 'Mood Scanner Calibrated!',
    message: 'You helped B-4 name feelings from body and situation clues. Labels make big feelings easier to handle.',
    badges: ['Feeling Spotter', 'Mood Scanner', 'Emotion Detective'],
  },
  gradeContent: {
    'K-1': bandContent(
      'Name simple feelings from body and face clues.',
      [
        makeB4Question(
          {
            id: 'b4m1-k1-q1',
            question: 'B-4 sees a kid with tight fists and a frown. What feeling might they have?',
            choices: ['Angry', 'Sleepy', 'Silly', 'Hungry for crayons'],
            correctIndex: 0,
            correctFeedback: 'Yes. Tight fists and a frown can be clues that someone feels angry.',
            incorrectFeedback: 'Not quite. B-4 looks at body clues to help name the feeling.',
            hint: 'What do tight fists and a frown usually mean?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeB4Question(
          {
            id: 'b4m1-k1-q2',
            question: 'B-4 sees a kid smiling big and bouncing on their toes. What feeling might they have?',
            choices: ['Happy', 'Angry', 'Sleepy', 'Confused'],
            correctIndex: 0,
            correctFeedback: 'Nice scan. Smiles and bouncing often mean happy.',
            incorrectFeedback: 'Look again at the body clues — smiling and bouncing usually point somewhere else.',
            hint: 'What feeling goes with a big smile?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeB4Question(
          {
            id: 'b4m1-k1-q3',
            question: 'A kid has quiet tears and a droopy face. What feeling might B-4 name?',
            choices: ['Sad', 'Excited', 'Silly', 'Proud'],
            correctIndex: 0,
            correctFeedback: 'Correct. Tears and a droopy face can mean sad.',
            incorrectFeedback: 'Try again. Quiet tears are a clue B-4 uses to name the feeling.',
            hint: 'What feeling sometimes shows up with tears?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
      ],
      SKILL,
    ),
    '2-3': bandContent(
      'Connect feelings to what is happening in a situation.',
      [
        makeB4Question(
          {
            id: 'b4m1-23-q1',
            question:
              'A student loses a game and says, "I don\'t care," but their eyes look watery. What might be happening?',
            choices: [
              'They may feel disappointed',
              'They are definitely bored',
              'They forgot what games are',
              'They are turning into a robot',
            ],
            correctIndex: 0,
            correctFeedback: 'Exactly. Sometimes people hide disappointment by acting like they do not care.',
            incorrectFeedback: 'Try again. B-4 looks for clues underneath the words.',
            hint: 'What feeling might hide behind "I don\'t care"?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeB4Question(
          {
            id: 'b4m1-23-q2',
            question: 'A friend will not share a toy and a kid stomps their foot. What feeling fits the situation?',
            choices: ['Frustrated', 'Sleepy', 'Proud', 'Calm'],
            correctIndex: 0,
            correctFeedback: 'Yes. Getting blocked from something you want can feel frustrating.',
            incorrectFeedback: 'Not quite. B-4 matches the situation to the feeling.',
            hint: 'What feeling shows up when something does not go your way?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeB4Question(
          {
            id: 'b4m1-23-q3',
            question: 'A new student sits alone at lunch looking at the floor. What might they feel?',
            choices: ['Lonely or nervous', 'Extra hungry', 'Like a superhero', 'Nothing at all'],
            correctIndex: 0,
            correctFeedback: 'Good read. New situations can bring lonely or nervous feelings.',
            incorrectFeedback: 'Look at the situation — being new and alone can bring strong feelings.',
            hint: 'How might it feel to be new and sitting alone?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
      ],
      SKILL,
    ),
    '4-5': bandContent(
      'Notice when more than one feeling shows up at the same time.',
      [
        makeB4Question(
          {
            id: 'b4m1-45-q1',
            question: 'A student feels excited about presenting but also nervous. What should B-4 remember?',
            choices: [
              'People can feel more than one emotion at once',
              'Only one feeling is allowed',
              'Nervous means they should quit',
              'Excited feelings cancel everything else',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Mixed feelings are normal, especially before something important.',
            incorrectFeedback: 'Not quite. Two feelings can show up at the same time.',
            hint: 'Can excited and nervous both be true?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeB4Question(
          {
            id: 'b4m1-45-q2',
            question: 'A student wins a prize but notices a friend looks upset. What might they feel?',
            choices: [
              'Happy and worried at the same time',
              'Only happy forever',
              'No feelings at all',
              'Angry at the prize',
            ],
            correctIndex: 0,
            correctFeedback: 'Right. You can feel glad for yourself and care about a friend too.',
            incorrectFeedback: 'Mixed feelings are normal when good things and hard moments overlap.',
            hint: 'Can you feel good about winning and care about a friend?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeB4Question(
          {
            id: 'b4m1-45-q3',
            question: 'A student is proud of their project but embarrassed to share it. What is true?',
            choices: [
              'Proud and embarrassed can both show up together',
              'Embarrassed means the project is bad',
              'Proud feelings erase nervous feelings',
              'They should hide the project forever',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Mixed feelings are normal — especially when something matters to you.',
            incorrectFeedback: 'Not quite. Two real feelings can share the same moment.',
            hint: 'Can you feel proud and shy about the same thing?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
      ],
      SKILL,
    ),
    '6-8': bandContent(
      'Identify emotional triggers and how intense a feeling became.',
      [
        makeB4Question(
          {
            id: 'b4m1-68-q1',
            question: 'A student snaps at a friend after being corrected in front of the group. What should B-4 check first?',
            choices: [
              'What triggered the reaction and how intense the feeling became',
              'Whether the student is just rude',
              'Whether the friend deserved it',
              'Whether everyone should ignore it',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Triggers and intensity help explain what happened before choosing a response.',
            incorrectFeedback: 'Not yet. B-4 investigates the trigger before judging the behavior.',
            hint: 'What happened right before the snap?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeB4Question(
          {
            id: 'b4m1-68-q2',
            question: 'A student had a rough morning and then a small comment sets them off. What does B-4 notice?',
            choices: [
              'Earlier stress can make the next trigger feel bigger',
              'Small comments never matter',
              'Feelings reset every hour automatically',
              'The student chose to overreact on purpose',
            ],
            correctIndex: 0,
            correctFeedback: 'Exactly. Built-up stress can turn a small spark into a big flare.',
            incorrectFeedback: 'Try again. B-4 tracks what happened before the reaction got intense.',
            hint: 'Can a hard morning change how big the next feeling feels?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeB4Question(
          {
            id: 'b4m1-68-q3',
            question: 'A student\'s reaction feels way bigger than the situation. What should B-4 check?',
            choices: [
              'How intense the feeling got and what else was already going on',
              'Whether the situation was funny',
              'Whether feelings should be ignored',
              'Whether someone else caused it on purpose',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Intensity plus context helps you understand before you respond.',
            incorrectFeedback: 'Not yet. B-4 looks at intensity and background stress first.',
            hint: 'What else might be fueling a big reaction?',
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

registerB4AdaptiveMission(B4_MISSION_1_FILE);
