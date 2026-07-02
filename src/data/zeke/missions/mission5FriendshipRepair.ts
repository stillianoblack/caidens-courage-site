import type { ZekeAdaptiveMissionFile } from '../../../types/zekeAdaptiveQuest';
import { makeZekeQuestion, bandContent } from '../zekeQuestionHelpers';

export const ZEKE_MISSION_5_ID = 'zeke-friendship-repair';

const MODULE_ID = ZEKE_MISSION_5_ID;
const MODULE_TITLE = 'Friendship Repair';
const SKILL = 'Conflict Repair / Apology';

export const ZEKE_MISSION_5_FILE: ZekeAdaptiveMissionFile = {
  id: MODULE_ID,
  title: "Zeke's Team Quest",
  subtitle: MODULE_TITLE,
  character: 'zeke',
  missionNumber: 5,
  skillArea: SKILL,
  skillFocus: ['Conflict Repair', 'Apology', 'Friendship'],
  storySetup:
    'Zeke forgot to save a seat for his friend, even though he promised. His friend is upset and quiet.',
  missionB4Tip: 'Friendship repair starts with caring that someone was hurt.',
  landing: {
    eyebrow: 'MISSION 5',
    title: "Zeke's Team Quest",
    subtitle: MODULE_TITLE,
    body: 'Zeke broke a promise about saving a seat — help him repair the friendship with care and honesty.',
    cta: 'Start Mission',
  },
  complete: {
    title: 'Repair Badge Earned!',
    message: 'You practiced caring, apologizing, and rebuilding trust. Repair is how friendships come back stronger.',
    badges: ['Repair Starter', 'Trust Builder', 'Listen First'],
  },
  gradeContent: {
    'K-1': bandContent(
      'Say sorry when you hurt a friend.',
      [
        makeZekeQuestion(
          {
            id: 'zkm5-k1-q1',
            question: 'What should Zeke do first?',
            choices: [
              'Say sorry',
              'Blame the chair',
              'Say it does not matter',
              'Walk away',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Saying sorry is a good repair start.',
            incorrectFeedback: 'Try again. Zeke needs to help fix the hurt.',
            hint: 'What is the first kind move when a friend is hurt?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeZekeQuestion(
          {
            id: 'zkm5-k1-q2',
            question: 'Zeke\'s friend is still quiet. What helps next?',
            choices: [
              'Ask if they want to talk',
              'Make a joke about seats',
              'Ignore them and keep playing',
              'Say they should not be upset',
            ],
            correctIndex: 0,
            correctFeedback: 'Nice. Zeke shows he cares by checking in.',
            incorrectFeedback: 'Try again. Zeke wants to help his friend feel heard.',
            hint: 'What shows Zeke cares after saying sorry?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeZekeQuestion(
          {
            id: 'zkm5-k1-q3',
            question: 'What is repair?',
            choices: [
              'Helping fix the hurt',
              'Checking in and asking what would help now',
              'Blaming the chair',
              'Running away',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Repair means helping fix what happened.',
            incorrectFeedback: 'Not quite. Repair is about caring and fixing the hurt.',
            hint: 'What does Zeke do when a friend feels hurt?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
      ],
      SKILL,
    ),
    '2-3': bandContent(
      'Apologize and listen when a friend is upset.',
      [
        makeZekeQuestion(
          {
            id: 'zkm5-23-q1',
            question: 'What makes Zeke\'s apology better?',
            choices: [
              'Listening to how his friend feels',
              'Saying sorry while running away',
              'Explaining why his friend should not care',
              'Changing the subject fast',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Listening helps repair the friendship.',
            incorrectFeedback: 'Not quite. Repair needs listening, not just words.',
            hint: 'What helps an apology feel real?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeZekeQuestion(
          {
            id: 'zkm5-23-q2',
            question: 'Zeke says sorry but keeps playing his game. What is missing?',
            choices: [
              'Really listening to his friend',
              'Saying sorry louder',
              'Buying a new chair',
              'Walking away faster',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Sorry plus listening shows Zeke cares.',
            incorrectFeedback: 'Try again. Words alone are not enough for repair.',
            hint: 'What should Zeke do after saying sorry?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeZekeQuestion(
          {
            id: 'zkm5-23-q3',
            question: 'Your friend says they felt left out. What should Zeke do?',
            choices: [
              'Listen and ask what would help',
              'Tell them to cheer up',
              'Change the subject',
              'Walk away',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Listening opens the door to repair.',
            incorrectFeedback: 'Not quite. Zeke needs to hear how his friend feels.',
            hint: 'What helps when someone says they felt left out?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
      ],
      SKILL,
    ),
    '4-5': bandContent(
      'Repair with responsibility when trust breaks.',
      [
        makeZekeQuestion(
          {
            id: 'zkm5-45-q1',
            question: 'What should Zeke say?',
            choices: [
              'I said I would save you a seat, and I did not. I\'m sorry.',
              'You are too sensitive',
              'I forgot, so it does not count',
              'Other people made me do it',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Zeke owns the specific mistake.',
            incorrectFeedback: 'Try again. Good repair takes responsibility.',
            hint: 'What kind of apology names what actually happened?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeZekeQuestion(
          {
            id: 'zkm5-45-q2',
            question: 'A friend is upset because Zeke broke a promise. What matters most?',
            choices: [
              'Owning what he did not do',
              'Explaining why promises do not count',
              'Blaming the busy schedule',
              'Expecting instant forgiveness',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Owning the mistake is the heart of repair.',
            incorrectFeedback: 'Try again. Zeke needs to take responsibility first.',
            hint: 'What shows Zeke understands the harm?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeZekeQuestion(
          {
            id: 'zkm5-45-q3',
            question: 'Which apology is too vague?',
            choices: [
              '"Sorry if you were upset" without owning the mistake',
              'Naming exactly what Zeke did not do',
              'Listening to how the friend feels',
              'Planning to follow through next time',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Vague apologies dodge responsibility.',
            incorrectFeedback: 'Not quite. A strong apology names the specific harm.',
            hint: 'Which apology skips taking real responsibility?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
      ],
      SKILL,
    ),
    '6-8': bandContent(
      'Rebuild trust after a mistake.',
      [
        makeZekeQuestion(
          {
            id: 'zkm5-68-q1',
            question: 'How can Zeke rebuild trust?',
            choices: [
              'Own the mistake, listen, and follow through differently next time',
              'Expect forgiveness immediately',
              'Avoid the friend until it disappears',
              'Make a joke instead of addressing it',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Trust rebuilds through repeated reliable actions.',
            incorrectFeedback: 'Not quite. Trust needs repair plus follow-through.',
            hint: 'What helps trust come back after a broken promise?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeZekeQuestion(
          {
            id: 'zkm5-68-q2',
            question: 'Zeke apologized but made the same mistake again. What does trust need now?',
            choices: [
              'Consistent follow-through over time',
              'A louder apology',
              'Time alone until they forget',
              'A joke to lighten the mood',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Trust grows when actions match words.',
            incorrectFeedback: 'Not yet. One sorry is not enough if the pattern repeats.',
            hint: 'What proves repair is real?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeZekeQuestion(
          {
            id: 'zkm5-68-q3',
            question: 'What shows repair is working?',
            choices: [
              'The friend feels heard and sees change over time',
              'Both friends feel heard and notice changed behavior',
              'Zeke keeps showing up with consistent follow-through',
              'Only words, no changed actions',
            ],
            correctIndex: 0,
            correctFeedback: 'Exactly. Repair shows up in how people feel and what happens next.',
            incorrectFeedback: 'Try again. Real repair includes listening and follow-through.',
            hint: 'How do you know a friendship is healing?',
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
