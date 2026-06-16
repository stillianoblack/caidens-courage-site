/**
 * K-1 grade-band content for Miranda adaptive mystery files.
 * Derived from simplified 2-3 passages and legacy file1/file2 questions.
 */
import type { MirandaGradeContent } from '../../types/mirandaAdaptiveQuest';
import type { GradeBandQuestionMetadata } from '../../types/gradeBandContentMetadata';

function legacyMeta(
  sourceId: string,
  sourceFile: string,
  skillTags: string[],
): GradeBandQuestionMetadata {
  return {
    audience: 'kid',
    gradeBand: 'K-1',
    difficulty: 'beginner',
    character: 'miranda',
    skillTags,
    contentVersion: 'legacy_reclassified',
    sourceId,
    sourceFile,
  };
}

export const MIRANDA_MISSING_SCHEDULE_K1: MirandaGradeContent = {
  dashboardTitle: 'The Missing Schedule',
  dashboardDescription: 'Read a short clue and find what is missing.',
  scenarioEyebrow: 'CASE FILE',
  passage:
    'Students asked, "What are we doing next?" The schedule card was missing from the board. Miranda looked near the reading table and found the card under some folders.',
  skillTags: ['Reading Comprehension', 'Sequencing'],
  questions: [
    {
      id: 'ms-k1-q1',
      question: 'What was missing from the board?',
      options: [
        { id: 'a', label: 'A backpack' },
        { id: 'b', label: 'The schedule card' },
        { id: 'c', label: 'A lunch box' },
        { id: 'd', label: 'A pencil' },
      ],
      correctAnswer: 'b',
      explanation: 'The schedule card was missing from the board.',
      hint: 'What did Miranda notice was gone?',
      skillTags: ['Reading Comprehension'],
      metadata: legacyMeta('ms-23-q1', 'fileAdaptiveMissingSchedule.ts', ['Reading Comprehension']),
    },
    {
      id: 'ms-k1-q2',
      question: 'Where did Miranda find the card?',
      options: [
        { id: 'a', label: 'Under the folders' },
        { id: 'b', label: 'In the cafeteria' },
        { id: 'c', label: 'On the playground' },
        { id: 'd', label: 'In a backpack' },
      ],
      correctAnswer: 'a',
      explanation: 'Miranda found the card under the folders.',
      hint: 'Look where she searched near the reading table.',
      skillTags: ['Sequencing'],
      metadata: legacyMeta('ms-23-q2', 'fileAdaptiveMissingSchedule.ts', ['Sequencing']),
    },
    {
      id: 'ms-k1-q3',
      question: 'Why were the students confused?',
      options: [
        { id: 'a', label: 'They were tired' },
        { id: 'b', label: 'They did not know what was next' },
        { id: 'c', label: 'They lost pencils' },
        { id: 'd', label: 'They wanted lunch' },
      ],
      correctAnswer: 'b',
      explanation: 'Without the schedule, students did not know what came next.',
      hint: 'What does a schedule help students know?',
      skillTags: ['Inference'],
      metadata: legacyMeta('ms-23-q3', 'fileAdaptiveMissingSchedule.ts', ['Inference']),
    },
  ],
};

export const MIRANDA_MISSING_STUDENT_K1: MirandaGradeContent = {
  dashboardTitle: 'The Missing Student',
  dashboardDescription: 'Find where Caiden went with simple clues.',
  scenarioEyebrow: 'CASE FILE',
  passage:
    'Miranda counted the line. Caiden was missing. She saw his jacket on a chair and told the facilitator.',
  skillTags: ['Reading Comprehension', 'Safety'],
  questions: [
    {
      id: 'mst-k1-q1',
      question: 'Who was missing from the line?',
      options: [
        { id: 'a', label: 'Miranda' },
        { id: 'b', label: 'Caiden' },
        { id: 'c', label: 'The teacher' },
        { id: 'd', label: 'Nobody' },
      ],
      correctAnswer: 'b',
      explanation: 'Caiden was missing from the line.',
      hint: 'Who did Miranda count as missing?',
      skillTags: ['Reading Comprehension'],
      metadata: legacyMeta('f1-q6', 'file1MissingStudent.ts', ['Reading Comprehension']),
    },
    {
      id: 'mst-k1-q2',
      question: 'What did Miranda see on the chair?',
      options: [
        { id: 'a', label: 'Caiden\'s jacket' },
        { id: 'b', label: 'A sandwich' },
        { id: 'c', label: 'A basketball' },
        { id: 'd', label: 'A notebook only' },
      ],
      correctAnswer: 'a',
      explanation: 'Miranda spotted Caiden\'s jacket on the chair.',
      hint: 'What clue was left behind?',
      skillTags: ['Observation'],
      metadata: legacyMeta('mst-23-q2', 'fileAdaptiveMissingStudent.ts', ['Observation']),
    },
    {
      id: 'mst-k1-q3',
      question: 'What safe choice did Miranda make?',
      options: [
        { id: 'a', label: 'She told the facilitator' },
        { id: 'b', label: 'She ran away alone' },
        { id: 'c', label: 'She hid' },
        { id: 'd', label: 'She ignored it' },
      ],
      correctAnswer: 'a',
      explanation: 'Miranda told an adult, which is the safe choice.',
      hint: 'Who should know when someone is missing?',
      skillTags: ['Safety'],
      metadata: legacyMeta('mst-23-q3', 'fileAdaptiveMissingStudent.ts', ['Safety']),
    },
  ],
};

export const MIRANDA_MISSING_CLUE_K1: MirandaGradeContent = {
  dashboardTitle: 'The Missing Clue',
  dashboardDescription: 'Find the missing word in a short note.',
  scenarioEyebrow: 'CASE FILE',
  passage:
    'Miranda found a smudged note. One word was missing. A picture of a library door helped her figure it out.',
  skillTags: ['Reading Comprehension', 'Vocabulary'],
  questions: [
    {
      id: 'mcl-k1-q1',
      question: 'What was missing from the note?',
      options: [
        { id: 'a', label: 'A word' },
        { id: 'b', label: 'The whole note' },
        { id: 'c', label: 'Miranda\'s pencil' },
        { id: 'd', label: 'A backpack' },
      ],
      correctAnswer: 'a',
      explanation: 'One word was missing from the note.',
      hint: 'What part of the note could not be read?',
      skillTags: ['Reading Comprehension'],
      metadata: legacyMeta('mcl-23-q1', 'fileAdaptiveMissingClue.ts', ['Reading Comprehension']),
    },
    {
      id: 'mcl-k1-q2',
      question: 'What picture helped Miranda?',
      options: [
        { id: 'a', label: 'A library door' },
        { id: 'b', label: 'A soccer ball' },
        { id: 'c', label: 'A pizza' },
        { id: 'd', label: 'A rain cloud' },
      ],
      correctAnswer: 'a',
      explanation: 'The library door picture was an important clue.',
      hint: 'What image was on the note?',
      skillTags: ['Inference'],
      metadata: legacyMeta('mcl-23-q2', 'fileAdaptiveMissingClue.ts', ['Inference']),
    },
    {
      id: 'mcl-k1-q3',
      question: 'Where did the clue probably point?',
      options: [
        { id: 'a', label: 'The library' },
        { id: 'b', label: 'The pool' },
        { id: 'c', label: 'The bus' },
        { id: 'd', label: 'The moon' },
      ],
      correctAnswer: 'a',
      explanation: 'The library door picture points to the library.',
      hint: 'Where would a library door lead?',
      skillTags: ['Inference'],
      metadata: legacyMeta('mcl-23-q3', 'fileAdaptiveMissingClue.ts', ['Inference']),
    },
  ],
};

export const MIRANDA_K1_GRADE_BANDS: Record<string, MirandaGradeContent> = {
  'miranda-mystery-file-1': MIRANDA_MISSING_SCHEDULE_K1,
  'miranda-mystery-file-2': MIRANDA_MISSING_STUDENT_K1,
  'miranda-mystery-file-3': MIRANDA_MISSING_CLUE_K1,
};
