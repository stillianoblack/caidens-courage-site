import type { ZekeAdaptiveMissionFile } from '../../../types/zekeAdaptiveQuest';
import { registerZekeAdaptiveMission } from '../zekeAdaptiveBuilder';
import { makeZekeQuestion, bandContent } from '../zekeQuestionHelpers';

export const ZEKE_MISSION_7_ID = 'zeke-team-captain-test';

const MODULE_ID = ZEKE_MISSION_7_ID;
const MODULE_TITLE = 'The Team Captain Test';
const SKILL = 'Leadership / Inclusion';

export const ZEKE_MISSION_7_FILE: ZekeAdaptiveMissionFile = {
  id: MODULE_ID,
  title: "Zeke's Team Quest",
  subtitle: MODULE_TITLE,
  character: 'zeke',
  missionNumber: 7,
  skillArea: SKILL,
  skillFocus: ['Leadership', 'Inclusion', 'Teamwork'],
  storySetup:
    'Zeke is chosen as team captain. He wants to win, but he also notices one kid is always picked last.',
  missionB4Tip: 'A team gets stronger when more people feel like they belong.',
  landing: {
    eyebrow: 'MISSION 7',
    title: "Zeke's Team Quest",
    subtitle: MODULE_TITLE,
    body: 'Zeke is team captain — help him lead with fairness and make sure everyone belongs.',
    cta: 'Start Mission',
  },
  complete: {
    title: 'Captain Badge Earned!',
    message: 'You practiced inclusive leadership. Strong teams make space for everyone to contribute.',
    badges: ['Inclusion Captain', 'Fair Leader', 'Belonging Builder'],
  },
  gradeContent: {
    'K-1': bandContent(
      'Include others so everyone belongs.',
      [
        makeZekeQuestion(
          {
            id: 'zkm7-k1-q1',
            question: 'What kind choice can Zeke make?',
            choices: [
              'Invite the student to play',
              'Leave them out',
              'Say only fast kids matter',
              'Pick the same friends every time',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Including others is strong teamwork.',
            incorrectFeedback: 'Try again. Zeke wants everyone to feel included.',
            hint: 'What kind move helps someone feel part of the team?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeZekeQuestion(
          {
            id: 'zkm7-k1-q2',
            question: 'A kid is standing alone at the edge of the game. What can Zeke do?',
            choices: [
              'Invite them to join',
              'Pick only his best friends',
              'Say fast kids only',
              'Ignore them',
            ],
            correctIndex: 0,
            correctFeedback: 'Nice. Zeke makes room for one more teammate.',
            incorrectFeedback: 'Try again. A captain helps people belong.',
            hint: 'What does Zeke do when someone is left out?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeZekeQuestion(
          {
            id: 'zkm7-k1-q3',
            question: 'Why include everyone?',
            choices: [
              'Teams get stronger when more people belong',
              'Only fast kids should play',
              'Leaving people out is fine',
              'Same friends every time is best',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Belonging makes the whole team stronger.',
            incorrectFeedback: 'Not quite. Inclusion helps the team, not just one person.',
            hint: 'What happens when more people feel they belong?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
      ],
      SKILL,
    ),
    '2-3': bandContent(
      'Invite someone in with kind words.',
      [
        makeZekeQuestion(
          {
            id: 'zkm7-23-q1',
            question: 'What should Zeke say?',
            choices: [
              'Come join us. We need another teammate.',
              'You probably cannot play',
              'Maybe next year',
              'Only my friends can join',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Zeke invites them in with respect.',
            incorrectFeedback: 'Not quite. A leader makes space for others.',
            hint: 'What are kind words that invite someone in?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeZekeQuestion(
          {
            id: 'zkm7-23-q2',
            question: 'The kid picked last looks nervous. What helps?',
            choices: [
              'Zeke asks them to join the team',
              'Say they probably cannot play',
              'Pick the same friends again',
              'Walk away from the game',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. A warm invite can change someone\'s whole day.',
            incorrectFeedback: 'Try again. Zeke can invite with respect.',
            hint: 'What helps a nervous teammate feel welcome?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeZekeQuestion(
          {
            id: 'zkm7-23-q3',
            question: 'What is part of a captain\'s job?',
            choices: [
              'Help everyone feel they can contribute',
              'Win by leaving people out',
              'Rotate turns so different teammates contribute',
              'Let one person do everything',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Captains help the whole team show up.',
            incorrectFeedback: 'Not quite. Leadership includes making space for others.',
            hint: 'What does a good captain do for the team?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
      ],
      SKILL,
    ),
    '4-5': bandContent(
      'Lead fairly and notice strengths.',
      [
        makeZekeQuestion(
          {
            id: 'zkm7-45-q1',
            question: 'How can Zeke be a fair captain?',
            choices: [
              'Notice strengths and give everyone a role',
              'Only pass to his closest friends',
              'Ignore quieter teammates',
              'Let one person do everything',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Fair leaders see strengths across the team.',
            incorrectFeedback: 'Try again. Leadership means helping everyone contribute.',
            hint: 'What does fair leadership look like?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeZekeQuestion(
          {
            id: 'zkm7-45-q2',
            question: 'Zeke only passes to his closest friends. What is the problem?',
            choices: [
              'It limits the team\'s ideas and growth',
              'Fair chances help uncover hidden strengths',
              'Fairness does not matter in games',
              'Winning is all that counts',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Fair captains spread chances across the team.',
            incorrectFeedback: 'Try again. A captain helps everyone contribute.',
            hint: 'Why is playing favorites a leadership problem?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeZekeQuestion(
          {
            id: 'zkm7-45-q3',
            question: 'A quiet teammate has a good idea. What should Zeke do?',
            choices: [
              'Ask for their idea and give them a role',
              'Ignore quieter voices',
              'Set a quick structure so each voice is heard',
              'Do everything himself',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Good leaders look for hidden strengths.',
            incorrectFeedback: 'Not quite. Zeke needs to make space for every voice.',
            hint: 'How can a captain help quieter teammates contribute?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
      ],
      SKILL,
    ),
    '6-8': bandContent(
      'Use inclusive leadership on the team.',
      [
        makeZekeQuestion(
          {
            id: 'zkm7-68-q1',
            question: 'What is inclusive leadership?',
            choices: [
              'Creating conditions where everyone can contribute',
              'Winning while ignoring people',
              'Building clear roles and fair opportunities',
              'Making every decision alone',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Inclusive leaders build belonging and performance.',
            incorrectFeedback: 'Not quite. Inclusion is not separate from strong leadership.',
            hint: 'What does inclusive leadership create for the team?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeZekeQuestion(
          {
            id: 'zkm7-68-q2',
            question: 'Zeke wants to win but sees someone always picked last. Best leadership move?',
            choices: [
              'Create chances for them to contribute and belong',
              'Win while ignoring them',
              'Design plays that include newer teammates too',
              'Make all decisions alone',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Belonging and strong teams go together.',
            incorrectFeedback: 'Not yet. Inclusive leadership builds better teams.',
            hint: 'How can Zeke lead without leaving people out?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeZekeQuestion(
          {
            id: 'zkm7-68-q3',
            question: 'What is belonging on a team?',
            choices: [
              'Everyone feels they can contribute something meaningful',
              'Only stars matter',
              'Inclusion slows teams down',
              'Captains decide everything alone',
            ],
            correctIndex: 0,
            correctFeedback: 'Exactly. Belonging is part of how strong teams work.',
            incorrectFeedback: 'Try again. Belonging helps teams perform and grow.',
            hint: 'What does it mean to belong on a team?',
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

registerZekeAdaptiveMission(ZEKE_MISSION_7_FILE);
