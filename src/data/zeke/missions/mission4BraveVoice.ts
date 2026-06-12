import type { ZekeAdaptiveMissionFile } from '../../../types/zekeAdaptiveQuest';
import { registerZekeAdaptiveMission } from '../zekeAdaptiveBuilder';
import { makeZekeQuestion, bandContent } from '../zekeQuestionHelpers';

export const ZEKE_MISSION_4_ID = 'zeke-brave-voice';

const MODULE_ID = ZEKE_MISSION_4_ID;
const MODULE_TITLE = 'The Brave Voice';
const SKILL = 'Speaking Up Respectfully';

export const ZEKE_MISSION_4_FILE: ZekeAdaptiveMissionFile = {
  id: MODULE_ID,
  title: "Zeke's Team Quest",
  subtitle: MODULE_TITLE,
  character: 'zeke',
  missionNumber: 4,
  skillArea: SKILL,
  skillFocus: ['Speaking Up', 'Respectful Courage', 'Protecting Others'],
  storySetup:
    'Zeke hears someone making a joke that hurts another student\'s feelings. Everyone laughs, but Zeke notices the student looking down.',
  missionB4Tip: 'A brave voice can be calm and kind.',
  landing: {
    eyebrow: 'MISSION 4',
    title: "Zeke's Team Quest",
    subtitle: MODULE_TITLE,
    body: 'A joke landed wrong and someone is hurting — Zeke needs a brave voice that protects without exploding.',
    cta: 'Start Mission',
  },
  complete: {
    title: 'Brave Voice Activated!',
    message: 'You helped Zeke speak up with calm courage and support someone who was hurt.',
    badges: ['Brave Voice', 'Kind Protector', 'Upstander'],
  },
  gradeContent: {
    'K-1': bandContent(
      'Use kind words.',
      [
        makeZekeQuestion(
          {
            id: 'zkm4-k1-q1',
            question: 'What can Zeke say?',
            choices: ['That was not kind', 'Say something mean back', 'Laugh louder', 'Run away and hide forever'],
            correctIndex: 0,
            correctFeedback: 'Yes. Zeke can use kind, brave words.',
            incorrectFeedback: 'Try again. Brave words can help someone feel safe.',
            hint: 'What short sentence tells the truth without being mean back?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeZekeQuestion(
          {
            id: 'zkm4-k1-q2',
            question: 'The hurt student looks sad. What kind move can Zeke make?',
            choices: [
              'Check on them with a gentle "Are you okay?"',
              'Point at them so everyone looks',
              'Copy the mean joke',
              'Walk past like nothing happened',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. A gentle check-in shows Zeke cares.',
            incorrectFeedback: 'Try again. Zeke uses kind words to help someone feel safe.',
            hint: 'How can Zeke show care without making a big scene?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeZekeQuestion(
          {
            id: 'zkm4-k1-q3',
            question: 'Zeke wants to help stop the joke. What brave words work?',
            choices: [
              'Please stop. That hurts feelings.',
              'Say a bigger mean joke back',
              'Shout until the cafeteria shakes',
              'Hide under the lunch table',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Brave can be calm and clear.',
            incorrectFeedback: 'Not quite. Zeke stops harm with kind strength, not more harm.',
            hint: 'What words stop the joke without starting a fight?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
      ],
      SKILL,
    ),
    '2-3': bandContent(
      'Speak up for kindness.',
      [
        makeZekeQuestion(
          {
            id: 'zkm4-23-q1',
            question: 'What is a brave way to help?',
            choices: [
              'Say, "Let\'s not make fun of them."',
              'Join the joke',
              'Point and laugh',
              'Pretend nobody got hurt',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Zeke speaks up without attacking.',
            incorrectFeedback: 'Not quite. Zeke\'s brave voice protects people.',
            hint: 'What sentence redirects the group toward kindness?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeZekeQuestion(
          {
            id: 'zkm4-23-q2',
            question: 'Some kids keep giggling. What can Zeke add?',
            choices: [
              'That joke is not okay. Let\'s talk about something else.',
              'Keep laughing so he fits in',
              'Make fun of the person who made the joke publicly',
              'Run to the principal without saying anything first',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Zeke stays brave and changes the direction.',
            incorrectFeedback: 'Try again. Zeke protects without embarrassing or escalating.',
            hint: 'How can Zeke redirect without making things worse?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeZekeQuestion(
          {
            id: 'zkm4-23-q3',
            question: 'The student who was teased walks away. What should Zeke do?',
            choices: [
              'Go with them or invite them back respectfully',
              'Stay with the group that laughed',
              'Text everyone about what happened',
              'Pretend he did not notice them leave',
            ],
            correctIndex: 0,
            correctFeedback: 'Right. Support can mean walking alongside someone.',
            incorrectFeedback: 'Not quite. Zeke follows up with action, not silence.',
            hint: 'How can Zeke show the hurt student they are not alone?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
      ],
      SKILL,
    ),
    '4-5': bandContent(
      'Respectfully redirect.',
      [
        makeZekeQuestion(
          {
            id: 'zkm4-45-q1',
            question: 'What should Zeke do if he wants to redirect the group?',
            choices: [
              'Calmly say the joke is not okay and change the direction',
              'Embarrass the person who made the joke',
              'Start a bigger argument',
              'Ignore the hurt student',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Redirecting can stop harm without making the room explode.',
            incorrectFeedback: 'Try again. Zeke needs courage and control.',
            hint: 'What response stops harm and keeps dignity?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeZekeQuestion(
          {
            id: 'zkm4-45-q2',
            question: 'The joke-maker says "It was just funny." What is a respectful reply?',
            choices: [
              'Funny can still hurt someone. Let\'s stop.',
              'You\'re a terrible person forever',
              'Fine, keep going then',
              'Laugh harder to avoid conflict',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Zeke names the harm without attacking the person.',
            incorrectFeedback: 'Not quite. Respectful courage protects both sides.',
            hint: 'How can Zeke disagree without insulting anyone?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeZekeQuestion(
          {
            id: 'zkm4-45-q3',
            question: 'Zeke wants to support the student who was hurt without making a scene. What works?',
            choices: [
              'Ask quietly if they want help or company',
              'Announce their feelings to the whole cafeteria',
              'Challenge everyone to a debate',
              'Post about it online before talking to anyone',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Quiet support can be powerful and respectful.',
            incorrectFeedback: 'Try again. Zeke protects privacy while still showing up.',
            hint: 'What support feels safe for someone who is already embarrassed?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
      ],
      SKILL,
    ),
    '6-8': bandContent(
      'Use courage to challenge harm without escalating.',
      [
        makeZekeQuestion(
          {
            id: 'zkm4-68-q1',
            question: 'What response shows courage and social skill?',
            choices: [
              'Name the harm respectfully and support the student',
              'Publicly shame everyone involved',
              'Stay silent because it is easier',
              'Make a harsher joke back',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Zeke challenges harm while keeping the situation from escalating.',
            incorrectFeedback: 'Not quite. Courage should reduce harm, not create more.',
            hint: 'What protects the hurt student without starting a bigger fight?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeZekeQuestion(
          {
            id: 'zkm4-68-q2',
            question: 'The group gets tense after Zeke speaks up. What keeps dignity on both sides?',
            choices: [
              'Stay calm and focus on the hurt, not attacking the joker',
              'Keep arguing until someone cries',
              'DARE people to keep joking',
              'Threaten to expose everyone\'s secrets',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Calm focus on harm beats public shaming.',
            incorrectFeedback: 'Try again. Zeke reduces tension, not fuels it.',
            hint: 'What keeps the conversation about the hurt, not revenge?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeZekeQuestion(
          {
            id: 'zkm4-68-q3',
            question: 'Later, Zeke talks to the student who made the joke. What shows mature courage?',
            choices: [
              'Explain why the joke hurt and ask them to repair it',
              'Ghost them forever with no conversation',
              'Gather a crowd to confront them again',
              'Pretend nothing happened so popularity stays intact',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Repair conversations take courage and respect.',
            incorrectFeedback: 'Not quite. Mature courage can include a direct, private follow-up.',
            hint: 'What might help the joker understand impact without humiliation?',
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

registerZekeAdaptiveMission(ZEKE_MISSION_4_FILE);
