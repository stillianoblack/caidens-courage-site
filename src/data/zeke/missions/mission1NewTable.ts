import type { ZekeAdaptiveMissionFile } from '../../../types/zekeAdaptiveQuest';
import { registerZekeAdaptiveMission } from '../zekeAdaptiveBuilder';
import { makeZekeQuestion, bandContent } from '../zekeQuestionHelpers';

export const ZEKE_MISSION_1_ID = 'zeke-new-table';

const MODULE_ID = ZEKE_MISSION_1_ID;
const MODULE_TITLE = 'The New Table';
const SKILL = 'Joining In / Social Confidence';

export const ZEKE_MISSION_1_FILE: ZekeAdaptiveMissionFile = {
  id: MODULE_ID,
  title: "Zeke's Team Quest",
  subtitle: MODULE_TITLE,
  character: 'zeke',
  missionNumber: 1,
  skillArea: SKILL,
  skillFocus: ['Joining In', 'Social Confidence', 'Asking to Join'],
  storySetup:
    'Zeke walks into lunch and sees a table of kids playing a card game. There is one open seat, but nobody has noticed him yet.',
  missionB4Tip: 'Joining starts with a simple ask. Brave does not have to be loud.',
  landing: {
    eyebrow: 'MISSION 1',
    title: "Zeke's Team Quest",
    subtitle: MODULE_TITLE,
    body: 'One open seat, one card game — Zeke needs a kind way to join in.',
    cta: 'Start Mission',
  },
  complete: {
    title: 'Table Joined!',
    message: 'You helped Zeke ask kindly, read the room, and join with confidence and respect.',
    badges: ['Join-In Pro', 'Social Courage', 'Team Welcome'],
  },
  gradeContent: {
    'K-1': bandContent(
      'Ask to join kindly.',
      [
        makeZekeQuestion(
          {
            id: 'zkm1-k1-q1',
            question: 'What should Zeke say first?',
            choices: ['Can I play too?', 'Move over now', 'This game looks boring', 'I am taking that chair'],
            correctIndex: 0,
            correctFeedback: 'Yes. Friendly words help Zeke join in.',
            incorrectFeedback: 'Not quite. Zeke needs a kind way to ask.',
            hint: 'What words would feel welcome at a new table?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeZekeQuestion(
          {
            id: 'zkm1-k1-q2',
            question: 'The kids say yes. What should Zeke do next?',
            choices: [
              'Sit down and listen to how the game works',
              'Grab the cards and change the rules',
              'Tell everyone he is the winner already',
              'Walk away because they said yes too slowly',
            ],
            correctIndex: 0,
            correctFeedback: 'Nice. Joining means learning the game, not taking over.',
            incorrectFeedback: 'Try again. Zeke wants to fit in, not run the table.',
            hint: 'What helps you belong when you are new to a game?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeZekeQuestion(
          {
            id: 'zkm1-k1-q3',
            question: 'One kid looks shy at the table. What kind move can Zeke make?',
            choices: [
              'Say hi and ask their name',
              'Ignore them and only talk to the loudest kid',
              'Tell them to go sit somewhere else',
              'Copy everything they do without speaking',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. A friendly hello can help someone feel included.',
            incorrectFeedback: 'Not quite. Zeke looks for kind ways to welcome everyone.',
            hint: 'How could Zeke help a shy kid feel part of the group?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
      ],
      SKILL,
    ),
    '2-3': bandContent(
      'Use friendly words and wait for an answer.',
      [
        makeZekeQuestion(
          {
            id: 'zkm1-23-q1',
            question: 'Zeke wants to join the game. What is the best move?',
            choices: [
              'Ask politely and wait for an answer',
              'Grab the cards',
              'Tell everyone he is the boss',
              'Walk away without trying',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Asking and waiting shows respect.',
            incorrectFeedback: 'Try again. A good social move gives others a chance to respond.',
            hint: 'What shows both courage and respect?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeZekeQuestion(
          {
            id: 'zkm1-23-q2',
            question: 'The group looks busy. What friendly words could Zeke try?',
            choices: [
              'Can I join the next round?',
              'You have to let me play now',
              'Your game looks stupid',
              'Say nothing and stare until someone notices',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Friendly words plus patience help Zeke join in.',
            incorrectFeedback: 'Try again. Zeke uses kind words that give the group a choice.',
            hint: 'What could Zeke say without pushing or insulting?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeZekeQuestion(
          {
            id: 'zkm1-23-q3',
            question: 'Someone says "maybe later." What should Zeke do?',
            choices: [
              'Wait politely and try again when there is a pause',
              'Yell that it is not fair',
              'Take the cards anyway',
              'Tell the teacher they were mean without trying again',
            ],
            correctIndex: 0,
            correctFeedback: 'Right. Waiting and trying again shows social skill.',
            incorrectFeedback: 'Not quite. Zeke keeps it respectful even when the answer is not instant.',
            hint: 'What can Zeke do when the first answer is "not yet"?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
      ],
      SKILL,
    ),
    '4-5': bandContent(
      'Read the group and join respectfully.',
      [
        makeZekeQuestion(
          {
            id: 'zkm1-45-q1',
            question: 'The group is in the middle of a round. What should Zeke do?',
            choices: [
              'Wait for a pause, then ask to join the next round',
              'Interrupt and demand a turn',
              'Sit down without asking',
              'Say the rules are bad',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Zeke reads the moment and joins respectfully.',
            incorrectFeedback: 'Not quite. Timing matters when joining a group.',
            hint: 'When is the best moment to ask to join?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeZekeQuestion(
          {
            id: 'zkm1-45-q2',
            question: 'Zeke notices everyone is focused on the game. What social clue is Zeke reading?',
            choices: [
              'They need a moment before new players join',
              'They definitely hate him already',
              'They want him to grab a chair silently',
              'They are trying to make him leave school',
            ],
            correctIndex: 0,
            correctFeedback: 'Exactly. Reading the room helps Zeke join at the right time.',
            incorrectFeedback: 'Try again. Focus on the group does not always mean rejection.',
            hint: 'What does focused energy usually mean in the middle of a game?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeZekeQuestion(
          {
            id: 'zkm1-45-q3',
            question: 'The group welcomes Zeke but one kid does not smile. What is a respectful move?',
            choices: [
              'Join in and include that kid with a friendly hello',
              'Call them out for being rude',
              'Only talk to the kids who smiled first',
              'Complain that the group is not fun enough',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Zeke joins respectfully and makes space for everyone.',
            incorrectFeedback: 'Not quite. Respectful joining includes people who seem quiet or unsure.',
            hint: 'How can Zeke welcome someone who looks unsure?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
      ],
      SKILL,
    ),
    '6-8': bandContent(
      'Enter a social situation with confidence and respect.',
      [
        makeZekeQuestion(
          {
            id: 'zkm1-68-q1',
            question: 'What shows strong social confidence?',
            choices: [
              'Asking to join without pressuring the group',
              'Acting like rejection would ruin everything',
              'Taking control immediately',
              'Pretending he does not care',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Confidence can be calm, clear, and respectful.',
            incorrectFeedback: 'Not yet. Zeke needs courage and respect together.',
            hint: 'What does confidence look like without forcing your way in?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeZekeQuestion(
          {
            id: 'zkm1-68-q2',
            question: 'Zeke gets a polite "we\'re full for this round." What is the confident response?',
            choices: [
              'Say thanks and ask to join the next round',
              'Argue until someone gives up their seat',
              'Mock the group for being exclusive',
              'Pretend he never wanted to play anyway',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Calm persistence keeps dignity on both sides.',
            incorrectFeedback: 'Not quite. Confidence handles a no without drama or fake indifference.',
            hint: 'How can Zeke stay confident after a polite no?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeZekeQuestion(
          {
            id: 'zkm1-68-q3',
            question: 'Zeke sees another student hovering near the table too. What shows social leadership?',
            choices: [
              'Invite them to ask together or save them a spot if the group says yes',
              'Ignore them because spots are limited',
              'Tell them they are too late',
              'Claim the last seat and block them out',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Strong social skill includes bringing others in.',
            incorrectFeedback: 'Try again. Leadership can mean helping someone else join too.',
            hint: 'How could Zeke use his confidence to help another person?',
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

registerZekeAdaptiveMission(ZEKE_MISSION_1_FILE);
