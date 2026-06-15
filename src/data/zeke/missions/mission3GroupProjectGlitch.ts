import type { ZekeAdaptiveMissionFile } from '../../../types/zekeAdaptiveQuest';
import { registerZekeAdaptiveMission } from '../zekeAdaptiveBuilder';
import { makeZekeQuestion, bandContent } from '../zekeQuestionHelpers';

export const ZEKE_MISSION_3_ID = 'zeke-group-project-glitch';

const MODULE_ID = ZEKE_MISSION_3_ID;
const MODULE_TITLE = 'The Group Project Glitch';
const SKILL = 'Communication / Team Roles';

export const ZEKE_MISSION_3_FILE: ZekeAdaptiveMissionFile = {
  id: MODULE_ID,
  title: "Zeke's Team Quest",
  subtitle: MODULE_TITLE,
  character: 'zeke',
  missionNumber: 3,
  skillArea: SKILL,
  skillFocus: ['Communication', 'Team Roles', 'Group Problem-Solving'],
  storySetup:
    'Zeke\'s group has a poster to finish. Everyone starts talking at once, two kids want to draw, and nobody knows who is writing the title.',
  missionB4Tip: 'Clear jobs make teamwork smoother.',
  landing: {
    eyebrow: 'MISSION 3',
    title: "Zeke's Team Quest",
    subtitle: MODULE_TITLE,
    body: 'Too many voices, not enough roles — Zeke needs a plan before the poster falls apart.',
    cta: 'Start Mission',
  },
  complete: {
    title: 'Group Glitch Fixed!',
    message: 'You helped Zeke organize roles, take turns, and get the team moving together.',
    badges: ['Role Organizer', 'Team Communicator', 'Project Fixer'],
  },
  gradeContent: {
    'K-1': bandContent(
      'Take turns.',
      [
        makeZekeQuestion(
          {
            id: 'zkm3-k1-q1',
            question: 'What helps the group work together?',
            choices: [
              'Have one speaker at a time and assign roles',
              'Take turns talking',
              'Raise a hand and wait for your turn',
              'Tear up the project page',
            ],
            correctIndex: 1,
            correctFeedback: 'Yes. Taking turns helps everyone be heard.',
            incorrectFeedback: 'Try again. Zeke wants the group to work together.',
            hint: 'What helps people share ideas without chaos?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeZekeQuestion(
          {
            id: 'zkm3-k1-q2',
            question: 'Two kids want to color at the same time. What should Zeke suggest?',
            choices: [
              'You go first, then me',
              'Fight for the crayons',
              'Nobody gets to color',
              'Set turns for shared materials',
            ],
            correctIndex: 0,
            correctFeedback: 'Nice. Turn-taking keeps the project calm.',
            incorrectFeedback: 'Try again. Zeke helps the group share supplies fairly.',
            hint: 'How can two people use one thing without fighting?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeZekeQuestion(
          {
            id: 'zkm3-k1-q3',
            question: 'Someone keeps talking over others. What can Zeke say?',
            choices: [
              'Let\'s take turns so everyone can share',
              'Talk louder than them',
              'Tell the teacher immediately without trying',
              'Give up and do nothing',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Kind words about turns help the whole group.',
            incorrectFeedback: 'Not quite. Zeke uses calm words to fix the glitch.',
            hint: 'What simple sentence helps everyone get a turn?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
      ],
      SKILL,
    ),
    '2-3': bandContent(
      'Choose jobs.',
      [
        makeZekeQuestion(
          {
            id: 'zkm3-23-q1',
            question: 'What should Zeke suggest?',
            choices: [
              'Let\'s pick jobs for each person',
              'I will do everything myself',
              'Nobody gets to help',
              'Let\'s argue about the glue',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Jobs help the team know what to do.',
            incorrectFeedback: 'Not quite. A team needs a clear plan.',
            hint: 'What helps when nobody knows their part?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeZekeQuestion(
          {
            id: 'zkm3-23-q2',
            question: 'Three kids want to draw. What job plan helps?',
            choices: [
              'One draws, one writes title, one gathers supplies',
              'All three draw the same letter at once',
              'Split sections so each person has a role',
              'Skip the poster and go to recess early',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Different jobs use everyone\'s help.',
            incorrectFeedback: 'Try again. Zeke splits jobs so the poster gets finished.',
            hint: 'What jobs does a poster project need?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeZekeQuestion(
          {
            id: 'zkm3-23-q3',
            question: 'Someone is not sure what job to pick. What can Zeke do?',
            choices: [
              'Ask what they like doing and match a job',
              'Tell them they cannot help',
              'Give them the hardest job as punishment',
              'Ignore them until the teacher notices',
            ],
            correctIndex: 0,
            correctFeedback: 'Right. Matching jobs to interests helps the team.',
            incorrectFeedback: 'Not quite. Zeke helps everyone find a useful role.',
            hint: 'How can Zeke help someone choose a job they can do well?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
      ],
      SKILL,
    ),
    '4-5': bandContent(
      'Organize roles.',
      [
        makeZekeQuestion(
          {
            id: 'zkm3-45-q1',
            question: 'The group is stuck because everyone wants the same task. What is the best solution?',
            choices: [
              'Divide roles based on what the project needs',
              'Use a quick team vote after hearing each idea',
              'Stop working until the teacher fixes it',
              'Make three people do the same job',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Good teams match roles to the goal.',
            incorrectFeedback: 'Try again. Zeke needs a fair structure.',
            hint: 'What should decide who does what?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeZekeQuestion(
          {
            id: 'zkm3-45-q2',
            question: 'The poster needs a title, drawings, and facts. What should Zeke help the group do?',
            choices: [
              'Match each part to a job before anyone starts',
              'Start drawing and argue later',
              'Let one person redo everyone else\'s work',
              'Copy another group\'s poster exactly',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Planning roles first prevents the glitch from growing.',
            incorrectFeedback: 'Not quite. Zeke organizes before the chaos spreads.',
            hint: 'When should the team decide who does each part?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeZekeQuestion(
          {
            id: 'zkm3-45-q3',
            question: 'One teammate finishes early and has nothing to do. What is a good team move?',
            choices: [
              'Ask what still needs help and reassign if needed',
              'Ask if they can help with the next needed part',
              'Send them to bother another group',
              'Take credit for their finished part',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Flexible roles keep the whole team contributing.',
            incorrectFeedback: 'Try again. Finished early does not mean done helping.',
            hint: 'What can someone do when their job is finished first?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
      ],
      SKILL,
    ),
    '6-8': bandContent(
      'Facilitate group collaboration.',
      [
        makeZekeQuestion(
          {
            id: 'zkm3-68-q1',
            question: 'How can Zeke help without taking over?',
            choices: [
              'Ask what needs to be done and help the group assign roles',
              'Decide everyone\'s role without asking',
              'Do all the important parts himself',
              'Criticize the group for being messy',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Zeke facilitates instead of controlling.',
            incorrectFeedback: 'Not quite. Strong leaders guide the team without grabbing all the power.',
            hint: 'How can Zeke lead by creating clarity, not commands?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeZekeQuestion(
          {
            id: 'zkm3-68-q2',
            question: 'Two teammates disagree about the layout. What facilitation move works?',
            choices: [
              'Help them name the goal and pick a solution together',
              'Side with the louder person immediately',
              'Rewrite the poster alone overnight',
              'Tell them the project is ruined',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Facilitation turns conflict into a shared decision.',
            incorrectFeedback: 'Try again. Zeke helps the group solve the disagreement, not win it.',
            hint: 'What question brings people back to the project goal?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeZekeQuestion(
          {
            id: 'zkm3-68-q3',
            question: 'The group falls behind because nobody tracked deadlines. What should Zeke suggest?',
            choices: [
              'Quick check-in on who owns what and what is left',
              'Blame the teacher for assigning groups',
              'Drop the hardest section entirely',
              'Let one person carry the whole grade for everyone',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. A clear check-in gets the team back on track.',
            incorrectFeedback: 'Not quite. Zeke creates clarity instead of panic or blame.',
            hint: 'What short meeting could fix a behind-schedule group?',
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

registerZekeAdaptiveMission(ZEKE_MISSION_3_FILE);
