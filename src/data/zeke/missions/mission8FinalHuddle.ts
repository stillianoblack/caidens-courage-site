import type { ZekeAdaptiveMissionFile } from '../../../types/zekeAdaptiveQuest';
import { registerZekeAdaptiveMission } from '../zekeAdaptiveBuilder';
import { makeZekeQuestion, bandContent } from '../zekeQuestionHelpers';

export const ZEKE_MISSION_8_ID = 'zeke-final-huddle';

const MODULE_ID = ZEKE_MISSION_8_ID;
const MODULE_TITLE = 'The Final Huddle';
const SKILL = 'Group Reflection / Team Growth';

export const ZEKE_MISSION_8_FILE: ZekeAdaptiveMissionFile = {
  id: MODULE_ID,
  title: "Zeke's Team Quest",
  subtitle: MODULE_TITLE,
  character: 'zeke',
  missionNumber: 8,
  skillArea: SKILL,
  skillFocus: ['Group Reflection', 'Team Growth', 'Feedback'],
  storySetup:
    'After a tough team challenge, Zeke calls a final huddle. Some teammates are proud, some are frustrated, and one person feels ignored.',
  missionB4Tip: 'Teams grow when people can share how they feel.',
  landing: {
    eyebrow: 'MISSION 8',
    title: "Zeke's Team Quest",
    subtitle: MODULE_TITLE,
    body: 'The challenge is over — help Zeke lead a huddle where the team reflects, listens, and grows together.',
    cta: 'Start Mission',
  },
  complete: {
    title: 'Huddle Badge Earned!',
    message: 'You practiced team reflection and turning feedback into growth. Strong teams learn together.',
    badges: ['Huddle Leader', 'Growth Mindset', 'Team Listener'],
  },
  gradeContent: {
    'K-1': bandContent(
      'Share one feeling after a team challenge.',
      [
        makeZekeQuestion(
          {
            id: 'zkm8-k1-q1',
            question: 'What can each teammate share?',
            choices: [
              'One feeling about the game',
              'A mean comment',
              'A random animal sound',
              'Nothing ever',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Sharing one feeling helps the team understand each other.',
            incorrectFeedback: 'Try again. A huddle helps people share safely.',
            hint: 'What is safe to share in a team huddle?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeZekeQuestion(
          {
            id: 'zkm8-k1-q2',
            question: 'Zeke asks how everyone feels. What is a good answer?',
            choices: [
              'I felt proud when we worked together',
              'A mean comment about someone',
              'A random animal sound',
              'Nothing at all',
            ],
            correctIndex: 0,
            correctFeedback: 'Nice. Sharing a real feeling helps the team connect.',
            incorrectFeedback: 'Try again. A huddle is for honest, kind sharing.',
            hint: 'What kind of answer helps the team understand each other?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeZekeQuestion(
          {
            id: 'zkm8-k1-q3',
            question: 'What does a huddle help the team do?',
            choices: [
              'Understand how everyone feels',
              'Blame each other',
              'Never talk about the game',
              'Only celebrate winning',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Huddles help teammates understand each other.',
            incorrectFeedback: 'Not quite. A huddle is for sharing and learning.',
            hint: 'Why does Zeke call a huddle after the challenge?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
      ],
      SKILL,
    ),
    '2-3': bandContent(
      'Say what went well and what to improve.',
      [
        makeZekeQuestion(
          {
            id: 'zkm8-23-q1',
            question: 'What should Zeke ask in the huddle?',
            choices: [
              'What went well, and what can we improve?',
              'Who should we blame?',
              'Who was the worst?',
              'Can we never talk about this?',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. That question helps the team learn.',
            incorrectFeedback: 'Not quite. Zeke wants reflection, not blame.',
            hint: 'What question helps a team learn from a challenge?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeZekeQuestion(
          {
            id: 'zkm8-23-q2',
            question: 'The team lost but tried hard. What should Zeke ask?',
            choices: [
              'What went well, and what can we improve?',
              'Who messed up the most?',
              'Who should we blame?',
              'Can we never talk about this?',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Reflection looks for learning, not blame.',
            incorrectFeedback: 'Try again. Zeke wants the team to grow from the experience.',
            hint: 'What helps a team learn even after a tough result?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeZekeQuestion(
          {
            id: 'zkm8-23-q3',
            question: 'One teammate says they felt left out. What helps?',
            choices: [
              'Listen and think how to include them next time',
              'Tell them they are wrong',
              'Change the subject',
              'Say winning matters more',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Listening helps the team repair and improve.',
            incorrectFeedback: 'Not quite. Team reflection includes honest feedback.',
            hint: 'What should the team do when someone shares a hard feeling?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
      ],
      SKILL,
    ),
    '4-5': bandContent(
      'Reflect as a team when feelings differ.',
      [
        makeZekeQuestion(
          {
            id: 'zkm8-45-q1',
            question: 'One teammate says they felt ignored. What should the team do?',
            choices: [
              'Listen and plan how to include them next time',
              'Tell them they are wrong',
              'Change the subject',
              'Say winning matters more',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Listening helps the team repair and improve.',
            incorrectFeedback: 'Try again. Team reflection includes honest feedback.',
            hint: 'How should the team respond to someone who felt ignored?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeZekeQuestion(
          {
            id: 'zkm8-45-q2',
            question: 'Some teammates are proud, some frustrated. What should Zeke do?',
            choices: [
              'Let everyone share and listen',
              'Only let the captain talk',
              'Pretend it was perfect',
              'Blame the frustrated ones',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Different feelings can all belong in a huddle.',
            incorrectFeedback: 'Try again. Reflection needs room for every voice.',
            hint: 'What helps when teammates feel different things?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeZekeQuestion(
          {
            id: 'zkm8-45-q3',
            question: 'What is team reflection?',
            choices: [
              'Looking back to learn, not to blame',
              'Finding who to punish',
              'Avoiding hard topics',
              'Only celebrating wins',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Reflection turns experience into growth.',
            incorrectFeedback: 'Not quite. Zeke wants learning, not blame.',
            hint: 'What is the goal of a team huddle?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
      ],
      SKILL,
    ),
    '6-8': bandContent(
      'Use feedback to improve group dynamics.',
      [
        makeZekeQuestion(
          {
            id: 'zkm8-68-q1',
            question: 'What makes a team reflection useful?',
            choices: [
              'Honest feedback connected to a clear next action',
              'Everyone pretending it was perfect',
              'Only the captain talking',
              'Avoiding uncomfortable topics',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Reflection should lead to a better next move.',
            incorrectFeedback: 'Not quite. Strong teams use feedback to improve.',
            hint: 'What turns reflection into real team growth?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeZekeQuestion(
          {
            id: 'zkm8-68-q2',
            question: 'A teammate shares they felt ignored during the challenge. Best team response?',
            choices: [
              'Listen, validate, and plan a concrete next step',
              'Dismiss their experience',
              'Change topic quickly',
              'Prioritize winning over belonging',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Feedback becomes growth when it leads to action.',
            incorrectFeedback: 'Not yet. Strong teams listen and adjust.',
            hint: 'How should a team handle honest feedback about inclusion?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeZekeQuestion(
          {
            id: 'zkm8-68-q3',
            question: 'What turns reflection into growth?',
            choices: [
              'Honest feedback linked to a clear next action',
              'Pretending everything was fine',
              'Only the captain talking',
              'Avoiding uncomfortable topics',
            ],
            correctIndex: 0,
            correctFeedback: 'Exactly. The best teams turn hard feedback into a better plan.',
            incorrectFeedback: 'Try again. Useful reflection connects feelings to next steps.',
            hint: 'What makes a huddle more than just talking?',
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

registerZekeAdaptiveMission(ZEKE_MISSION_8_FILE);
