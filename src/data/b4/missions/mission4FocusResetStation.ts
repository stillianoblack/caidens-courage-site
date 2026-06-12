import type { B4AdaptiveMissionFile } from '../../../types/b4AdaptiveQuest';
import { registerB4AdaptiveMission } from '../b4AdaptiveBuilder';
import { makeB4Question, bandContent } from '../b4QuestionHelpers';

export const B4_MISSION_4_ID = 'b4-focus-reset-station';

const MODULE_ID = B4_MISSION_4_ID;
const MODULE_TITLE = 'Focus Reset Station';
const SKILL = 'Focus / Attention Reset';

export const B4_MISSION_4_FILE: B4AdaptiveMissionFile = {
  id: MODULE_ID,
  title: 'B-4 Focus Missions',
  subtitle: MODULE_TITLE,
  character: 'b4',
  missionNumber: 4,
  skillArea: SKILL,
  skillFocus: ['Focus', 'Attention Reset', 'Self-Regulation'],
  storySetup:
    'B-4\'s Focus Reset Station has three buttons: Breathe, Move, and Start Small. The learner needs to pick the right reset before jumping back in.',
  missionB4Tip: 'One breath can be the start button for your brain.',
  landing: {
    eyebrow: 'MISSION 4',
    title: 'B-4 Focus Missions',
    subtitle: MODULE_TITLE,
    body: 'Three reset buttons await — Breathe, Move, Start Small. Pick the right one before jumping back in.',
    cta: 'Start Mission',
  },
  complete: {
    title: 'Focus Reset Complete!',
    message: 'You matched focus problems to the right reset moves. Returning to focus is a skill — not magic.',
    badges: ['Focus Restarter', 'Reset Navigator', 'Start-Small Specialist'],
  },
  gradeContent: {
    'K-1': bandContent(
      'Use simple reset moves when your brain or body feels too busy.',
      [
        makeB4Question(
          {
            id: 'b4m4-k1-q1',
            question: 'Your brain feels busy. What can help you focus again?',
            choices: ['Take one slow breath', 'Spin forever', 'Throw your pencil', 'Close the book and quit'],
            correctIndex: 0,
            correctFeedback: 'Yes. One slow breath can help your brain reset.',
            incorrectFeedback: 'Try again. B-4 wants a calm focus move.',
            hint: 'What is the gentlest way to slow your brain down?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeB4Question(
          {
            id: 'b4m4-k1-q2',
            question: 'Your body feels wiggly and you cannot sit still. Which reset button fits?',
            choices: [
              'Move — a quick stretch or wiggle break',
              'Breathe — hold your breath for ten minutes',
              'Start Small — write the whole report now',
              'Quit — focus is impossible forever',
            ],
            correctIndex: 0,
            correctFeedback: 'Right. A short move can help wiggly energy settle.',
            incorrectFeedback: 'Not quite. B-4 matches the reset to the body signal.',
            hint: 'Which button helps a wiggly body?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
        makeB4Question(
          {
            id: 'b4m4-k1-q3',
            question: 'A task feels hard to start. What does the Start Small button mean?',
            choices: [
              'Pick one tiny first step',
              'Do everything at once',
              'Wait until it feels easy',
              'Hide the task under a chair',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. One tiny step is how Start Small works.',
            incorrectFeedback: 'Try again. Start Small means the first step is tiny, not the whole job.',
            hint: 'What is the smallest way to begin?',
          },
          SKILL,
          MODULE_ID,
          'K-1',
        ),
      ],
      SKILL,
    ),
    '2-3': bandContent(
      'Choose a reset based on what is pulling your attention away.',
      [
        makeB4Question(
          {
            id: 'b4m4-23-q1',
            question: 'A student keeps looking around the room. What reset could help?',
            choices: [
              'Look at the first question and start there',
              'Try to finish everything at once',
              'Watch everyone else',
              'Complaining about the chair',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Starting with one question makes focus easier.',
            incorrectFeedback: 'Not quite. B-4 chooses one small target.',
            hint: 'What is one small place to point your eyes?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeB4Question(
          {
            id: 'b4m4-23-q2',
            question: 'Noise outside the window keeps pulling a student\'s attention away. What reset helps?',
            choices: [
              'Take a breath and refocus on one task item',
              'Stare out the window harder',
              'Yell at the window',
              'Give up on all work',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Breathe, then aim at one small target.',
            incorrectFeedback: 'Try again. B-4 picks a reset that brings attention back gently.',
            hint: 'What helps you return to one thing after a distraction?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
        makeB4Question(
          {
            id: 'b4m4-23-q3',
            question: 'A student keeps thinking about recess instead of work. What reset fits?',
            choices: [
              'One slow breath, then look at the next step',
              'Plan recess for the rest of class',
              'Run to recess now',
              'Ignore the work forever',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. A breath plus one next step brings focus back.',
            incorrectFeedback: 'Not quite. B-4 uses a small reset, then one target.',
            hint: 'What is the smallest way back to the task?',
          },
          SKILL,
          MODULE_ID,
          '2-3',
        ),
      ],
      SKILL,
    ),
    '4-5': bandContent(
      'Match the reset strategy to the focus problem.',
      [
        makeB4Question(
          {
            id: 'b4m4-45-q1',
            question: 'A task feels too big, so the student avoids it. What should B-4 suggest?',
            choices: [
              'Break it into one small first step',
              'Wait until it magically feels easy',
              'Do the hardest part while panicking',
              'Think about every task at once',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. A small first step reduces overwhelm.',
            incorrectFeedback: 'Try again. B-4 wants to shrink the task, not the student\'s confidence.',
            hint: 'What makes a big task feel smaller?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeB4Question(
          {
            id: 'b4m4-45-q2',
            question: 'A student\'s mind keeps wandering while reading. What reset strategy fits?',
            choices: [
              'Re-read one paragraph and summarize it',
              'Read ten pages without noticing',
              'Close the book and never read again',
              'Read while doing five other things',
            ],
            correctIndex: 0,
            correctFeedback: 'Right. One paragraph is a focus-sized target.',
            incorrectFeedback: 'Not quite. B-4 shrinks the focus target when minds wander.',
            hint: 'What is one small reading chunk to restart with?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
        makeB4Question(
          {
            id: 'b4m4-45-q3',
            question: 'A nearby screen keeps tempting a student away from homework. What should B-4 suggest?',
            choices: [
              'Put the screen away and start one small homework step',
              'Watch videos until focus appears',
              'Do homework and videos at the same time forever',
              'Wait until the screen breaks',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Remove the pull, then open the first small door on the task.',
            incorrectFeedback: 'Try again. B-4 reduces distraction, then starts small.',
            hint: 'What helps when a screen keeps calling your name?',
          },
          SKILL,
          MODULE_ID,
          '4-5',
        ),
      ],
      SKILL,
    ),
    '6-8': bandContent(
      'Use intentional reset routines to return to focus faster.',
      [
        makeB4Question(
          {
            id: 'b4m4-68-q1',
            question: 'Why does a reset routine help attention?',
            choices: [
              'It gives the brain a repeatable way to restart',
              'It guarantees perfect focus forever',
              'It replaces all effort',
              'It makes distractions illegal',
            ],
            correctIndex: 0,
            correctFeedback: 'Exactly. A routine makes it easier to restart without arguing with your brain.',
            incorrectFeedback: 'Not quite. Reset routines help you restart, not become a robot.',
            hint: 'What does a routine give your brain?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeB4Question(
          {
            id: 'b4m4-68-q2',
            question: 'A student feels overwhelmed by a long to-do list. What intentional reset fits?',
            choices: [
              'Breathe, then pick the single most important first step',
              'Try to finish the entire list in one panic sprint',
              'Avoid the list until tomorrow\'s tomorrow',
              'Add ten more tasks for fun',
            ],
            correctIndex: 0,
            correctFeedback: 'Yes. Breathe, prioritize, start small — that is a solid reset routine.',
            incorrectFeedback: 'Try again. B-4 builds a routine that shrinks overwhelm.',
            hint: 'What three moves help when everything feels like too much?',
          },
          SKILL,
          MODULE_ID,
          '6-8',
        ),
        makeB4Question(
          {
            id: 'b4m4-68-q3',
            question: 'A student wants a personal reset routine before studying. What combination works best?',
            choices: [
              'One breath, a brief move, then one small start step',
              'Study for six hours without breaks',
              'Scroll until motivation arrives',
              'Only study when focus feels perfect',
            ],
            correctIndex: 0,
            correctFeedback: 'Correct. Breathe, Move, Start Small — B-4\'s three buttons in order.',
            incorrectFeedback: 'Not quite. A good routine uses small, repeatable steps.',
            hint: 'What three buttons does B-4\'s station have?',
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

registerB4AdaptiveMission(B4_MISSION_4_FILE);
