import type { ZekeAdaptiveMissionFile } from '../../../types/zekeAdaptiveQuest';
import { registerZekeAdaptiveMission } from '../zekeAdaptiveBuilder';
import { makeZekeQuestion, bandContent } from '../zekeQuestionHelpers';

export const ZEKE_MISSION_2_ID = 'zeke-pass-the-ball';

const MODULE_ID = ZEKE_MISSION_2_ID;
const MODULE_TITLE = 'Pass the Ball';
const SKILL = 'Teamwork / Sharing';

export const ZEKE_MISSION_2_FILE: ZekeAdaptiveMissionFile = {
  id: MODULE_ID,
  title: "Zeke's Team Quest",
  subtitle: MODULE_TITLE,
  character: 'zeke',
  missionNumber: 2,
  skillArea: SKILL,
  skillFocus: ['Teamwork', 'Sharing', 'Trusting Teammates'],
  storySetup:
    'During a team game, Zeke gets the ball. He could try to score alone, but Maya is wide open and ready.',
  missionB4Tip: 'A good teammate knows when to shine and when to share.',
  landing: {
    eyebrow: 'MISSION 2',
    title: "Zeke's Team Quest",
    subtitle: MODULE_TITLE,
    body: 'Zeke has the ball and Maya is open — time to pick the play that helps the whole team.',
    cta: 'Start Mission',
  },
  complete: {
    title: 'Team Play Unlocked!',
    message: 'You helped Zeke notice teammates, share the spotlight, and trust the team.',
    badges: ['Team Player', 'Spotlight Sharer', 'Trust Builder'],
  },
  gradeContent: {
    'K-1': bandContent(
      'Share turns.',
      [
        makeZekeQuestion(
          {
            id: 'zkm2-k1-q1',
            question: 'What should Zeke do if his teammate is open?',
            choices: [
              'Keep it forever',
              'Pass the ball',
              'Dribble once, then check for an open teammate',
              'Throw the ball out so no one plays',
            ],
            correctIndex: 1,
            correctFeedback: 'Yes. Passing helps the team.',
            incorrectFeedback: 'Try again. Zeke is practicing teamwork.',
            hint: 'What helps your team when a friend is ready?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeZekeQuestion(
          {
            id: 'zkm2-k1-q2',
            question: 'It is Zeke\'s turn to dribble. What is sharing?',
            choices: [
              'Keep dribbling until the game ends',
              'Give others a turn with the ball',
              'Pass after checking who is ready',
              'Throw the ball away so no one gets it',
            ],
            correctIndex: 1,
            correctFeedback: 'Right. Sharing turns keeps the team playing together.',
            incorrectFeedback: 'Try again. Zeke shares so everyone gets a chance.',
            hint: 'What does sharing look like in a team game?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeZekeQuestion(
          {
            id: 'zkm2-k1-q3',
            question: 'Maya asks for the ball. What should Zeke do?',
            choices: [
              'Pass when it helps the team',
              'Say no every time',
              'Hold it too long and miss the pass window',
              'Look up and decide before passing',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Passing when it helps is strong teamwork.',
            incorrectFeedback: 'Not quite. Zeke listens and shares to help the team.',
            hint: 'When a teammate asks, what team move helps most?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
      ],
      SKILL,
    ),
    '2-3': bandContent(
      'Notice teammates.',
      [
        makeZekeQuestion(
          {
            id: 'zkm2-23-q1',
            question: 'Why is passing a strong choice?',
            choices: [
              'It gives the team a better chance',
              'It means Zeke is weak',
              'It makes the ball disappear',
              'It can create a better chance for the team',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Good teammates help the whole team win.',
            incorrectFeedback: 'Not quite. Passing can be smart, not weak.',
            hint: 'How does passing help more than one person?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeZekeQuestion(
          {
            id: 'zkm2-23-q2',
            question: 'Zeke is running fast but hears Maya call his name. What should he notice?',
            choices: [
              'Maya is open and ready for a pass',
              'The crowd wants him to stop running',
              'Maya wants to take the ball home',
              'Running can still include smart passing choices',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Noticing open teammates is a key team skill.',
            incorrectFeedback: 'Try again. Zeke looks up to see who can help the team.',
            hint: 'What might Maya\'s call mean during the game?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeZekeQuestion(
          {
            id: 'zkm2-23-q3',
            question: 'After Zeke passes and Maya scores, what should Zeke do?',
            choices: [
              'Celebrate with the team',
              'Say he should have kept the ball',
              'Walk off the court angry',
              'Take credit and ignore Maya',
            ],
            correctIndex: 0,
            correctFeedback: 'Nice. Team wins are shared wins.',
            incorrectFeedback: 'Not quite. Zeke celebrates the team, not just himself.',
            hint: 'How do good teammates react after a shared score?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
      ],
      SKILL,
    ),
    '4-5': bandContent(
      'Choose team success over showing off.',
      [
        makeZekeQuestion(
          {
            id: 'zkm2-45-q1',
            question: 'Zeke wants to be the hero, but Maya has a better shot. What should he choose?',
            choices: [
              'Pass to Maya because it helps the team',
              'Shoot anyway to prove himself',
              'Pretend he did not see her',
              'Blame Maya for being open',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Team courage is choosing the best play, not just the flashy one.',
            incorrectFeedback: 'Try again. Zeke\'s goal is team success.',
            hint: 'What choice helps the team most, even if Zeke does not score?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeZekeQuestion(
          {
            id: 'zkm2-45-q2',
            question: 'Zeke has a decent shot but two teammates are in better spots. What is the team-first choice?',
            choices: [
              'Pass to whoever has the best chance to score',
              'Take one extra second to find the highest-percentage play',
              'Hold the ball until the timer runs out',
              'Dribble in circles to look impressive',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. The best play beats the show-off play.',
            incorrectFeedback: 'Try again. Zeke picks the move that gives the team the best chance.',
            hint: 'Who on the team has the strongest chance right now?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeZekeQuestion(
          {
            id: 'zkm2-45-q3',
            question: 'The team loses even after a good pass. What should Zeke remember?',
            choices: [
              'Sharing the ball was still the right teamwork move',
              'One miss can still come from the right decision',
              'Maya failed so it was his fault for trusting her',
              'Only winners on the team deserve the ball',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Good teamwork is about the right choice, not just the final score.',
            incorrectFeedback: 'Not quite. One miss does not erase a smart team play.',
            hint: 'Does a good pass stay good even if the shot misses?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
      ],
      SKILL,
    ),
    '6-8': bandContent(
      'Make a strategic teamwork choice.',
      [
        makeZekeQuestion(
          {
            id: 'zkm2-68-q1',
            question: 'What makes Zeke\'s pass a strong leadership move?',
            choices: [
              'He notices the best option and trusts his teammate',
              'He keeps the ball so only he can score',
              'He passes to avoid taking a risky shot himself',
              'He waits until defenders collapse on him first',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Trusting teammates is part of strong leadership.',
            incorrectFeedback: 'Not quite. Leadership is not always taking the shot.',
            hint: 'What does trusting a teammate show about a leader?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeZekeQuestion(
          {
            id: 'zkm2-68-q2',
            question: 'The defense double-teams Zeke. What strategic move shows trust?',
            choices: [
              'Pass quickly to the open teammate before the trap closes',
              'Keep dribbling until he is exhausted',
              'Blame the coach for the play',
              'Stop playing so someone else has to figure it out',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Reading pressure and passing fast is smart team leadership.',
            incorrectFeedback: 'Try again. Zeke uses the trap to set someone else up.',
            hint: 'When two defenders rush Zeke, who is probably open?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeZekeQuestion(
          {
            id: 'zkm2-68-q3',
            question: 'A teammate misses after Zeke\'s pass. What helps the team recover?',
            choices: [
              'Encourage them and stay ready for the next play',
              'Criticize them in front of everyone',
              'Refuse to pass to them again',
              'Tell the group the loss was entirely on them',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Leaders build trust back up after a miss.',
            incorrectFeedback: 'Not quite. Recovery matters as much as the pass itself.',
            hint: 'What keeps a team together after one play goes wrong?',
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

registerZekeAdaptiveMission(ZEKE_MISSION_2_FILE);
