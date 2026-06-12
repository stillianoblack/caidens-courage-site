/**
 * Kid-facing static content classification registry.
 * Adaptive Caiden/Miranda bands are classified in their source files.
 * Adult content lives in adultContentClassification.ts (gradeBand = adult).
 */
import { ADULT_CONTENT_CLASSIFICATION } from './adultContentClassification';
import type {
  ContentAudience,
  ContentDifficulty,
  ContentGradeBand,
  ContentVersionTag,
  StudentGradeBand,
} from '../types/gradeBandContentMetadata';

export type ClassifiedQuestionEntry = {
  id: string;
  character: string;
  moduleId: string;
  sourceFile: string;
  questionPreview: string;
  audience: ContentAudience;
  gradeBand: ContentGradeBand;
  difficulty: ContentDifficulty;
  contentVersion: ContentVersionTag;
  skillTags: string[];
  skillArea?: string;
  classificationNote?: string;
};

function kidEntry(
  entry: Omit<ClassifiedQuestionEntry, 'audience' | 'gradeBand'> & {
    gradeBand: StudentGradeBand;
  },
): ClassifiedQuestionEntry {
  return { ...entry, audience: 'kid' };
}

export const KID_STATIC_CONTENT_CLASSIFICATION: ClassifiedQuestionEntry[] = [
  ...['cp1-q1', 'cp1-q2', 'cp1-q3', 'cp1-q4', 'cp1-q5', 'cp1-q6', 'cp1-q7', 'cp1-q8'].map(
    (id, i) =>
      kidEntry({
        id,
        character: 'charlie',
        moduleId: 'turtle-trail-trouble',
        sourceFile: 'charlie/charlieMission1.ts',
        questionPreview: `Charlie mission 1 question ${i + 1}`,
        gradeBand: '2-3',
        difficulty: 'beginner',
        contentVersion: 'legacy_reclassified',
        skillTags: ['Nature', 'Safety', 'Kindness'],
        skillArea: 'nature',
      }),
  ),
  ...['cp2-q1', 'cp2-q2', 'cp2-q3', 'cp2-q4', 'cp2-q5', 'cp2-q6', 'cp2-q7', 'cp2-q8'].map(
    (id, i) =>
      kidEntry({
        id,
        character: 'charlie',
        moduleId: 'camp-critter-clues',
        sourceFile: 'charlie/charlieMission2.ts',
        questionPreview: `Charlie mission 2 question ${i + 1}`,
        gradeBand: i >= 5 ? '4-5' : '2-3',
        difficulty: i >= 5 ? 'intermediate' : 'beginner',
        contentVersion: 'legacy_reclassified',
        skillTags: ['Nature', 'Observation'],
        skillArea: 'nature',
      }),
  ),
  ...['f3-q1', 'f3-q2', 'f3-q3', 'f3-q4', 'f3-q5', 'f3-q6', 'f3-q7', 'f3-q8'].map((id) =>
    kidEntry({
      id,
      character: 'miranda',
      moduleId: 'the-missing-letters',
      sourceFile: 'miranda/file3MissingLetters.ts',
      questionPreview: 'Missing letter word clue',
      gradeBand: '2-3',
      difficulty: 'beginner',
      contentVersion: 'legacy_reclassified',
      skillTags: ['Spelling', 'Word Building'],
      skillArea: 'reading',
    }),
  ),
  ...['f4-q1', 'f4-q2', 'f4-q3', 'f4-q4', 'f4-q5', 'f4-q6', 'f4-q7', 'f4-q8'].map((id, i) =>
    kidEntry({
      id,
      character: 'miranda',
      moduleId: 'the-context-clue-challenge',
      sourceFile: 'miranda/file4ContextClueChallenge.ts',
      questionPreview: 'Vocabulary context clue',
      gradeBand: i >= 4 ? '4-5' : '2-3',
      difficulty: i >= 4 ? 'intermediate' : 'beginner',
      contentVersion: 'legacy_reclassified',
      skillTags: ['Vocabulary', 'Context Clues'],
      skillArea: 'reading',
    }),
  ),
  ...['f5-q1', 'f5-q2', 'f5-q3', 'f5-q4', 'f5-q5', 'f5-q6', 'f5-q7', 'f5-q8'].map((id, i) =>
    kidEntry({
      id,
      character: 'miranda',
      moduleId: 'mirandas-detective-notebook',
      sourceFile: 'miranda/file5DetectiveNotebook.ts',
      questionPreview: 'Detective notebook inference',
      gradeBand: i >= 5 ? '6-8' : '4-5',
      difficulty: i >= 5 ? 'advanced' : 'intermediate',
      contentVersion: 'legacy_reclassified',
      skillTags: ['Inference', 'Comprehension'],
      skillArea: 'reading',
      classificationNote: i === 7 ? 'Abstract lesson question — borderline 4-5/6-8' : undefined,
    }),
  ),
  ...['f1-q1', 'f1-q2', 'f1-q6', 'f1-q7'].map((id) =>
    kidEntry({
      id,
      character: 'miranda',
      moduleId: 'the-missing-student',
      sourceFile: 'miranda/file1MissingStudent.ts',
      questionPreview: 'Legacy missing student',
      gradeBand: 'K-1',
      difficulty: 'beginner',
      contentVersion: 'legacy_reclassified',
      skillTags: ['Reading Comprehension'],
      skillArea: 'reading',
    }),
  ),
  ...['f1-q3', 'f1-q4', 'f1-q5', 'f1-q8'].map((id) =>
    kidEntry({
      id,
      character: 'miranda',
      moduleId: 'the-missing-student',
      sourceFile: 'miranda/file1MissingStudent.ts',
      questionPreview: 'Legacy missing student',
      gradeBand: '2-3',
      difficulty: 'intermediate',
      contentVersion: 'legacy_reclassified',
      skillTags: ['Reading Comprehension', 'Grammar'],
      skillArea: 'reading',
      classificationNote: 'Mixed question types — manual review recommended',
    }),
  ),
  ...['r1', 'r2', 'r3', 'r4', 'r5'].map((id) =>
    kidEntry({
      id,
      character: 'b4',
      moduleId: 'b4-baseline-check',
      sourceFile: 'b4BaselineCheckContent.ts',
      questionPreview: 'B-4 baseline reading comprehension',
      gradeBand: 'K-1',
      difficulty: 'beginner',
      contentVersion: 'legacy_reclassified',
      skillTags: ['Reading Comprehension', 'Feelings'],
      skillArea: 'feelings',
    }),
  ),
  ...['m1', 'm2', 'm3', 'm4', 'm5'].map((id) =>
    kidEntry({
      id,
      character: 'b4',
      moduleId: 'b4-baseline-check',
      sourceFile: 'b4BaselineCheckContent.ts',
      questionPreview: 'B-4 focus strategy choice',
      gradeBand: '2-3',
      difficulty: 'beginner',
      contentVersion: 'legacy_reclassified',
      skillTags: ['Focus', 'SEL'],
      skillArea: 'focus',
    }),
  ),
  ...['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10'].map((id) =>
    kidEntry({
      id,
      character: 'b4',
      moduleId: 'b4-baseline-check',
      sourceFile: 'b4BaselineCheckContent.ts',
      questionPreview: 'B-4 feelings self-rating scale',
      gradeBand: '4-5',
      difficulty: 'intermediate',
      contentVersion: 'legacy_reclassified',
      skillTags: ['SEL', 'Self-Awareness'],
      skillArea: 'feelings',
      classificationNote: 'Likert scale — age depends on reader; default 4-5',
    }),
  ),
  ...['b4ff-q1', 'b4ff-q2', 'b4ff-q3', 'b4ff-q4', 'b4ff-q5', 'b4ff-q6', 'b4ff-q7', 'b4ff-q8'].map(
    (id, i) =>
      kidEntry({
        id,
        character: 'b4',
        moduleId: 'feeling-finder',
        sourceFile: 'b4/b4FeelingFinder.ts',
        questionPreview: 'Feeling identification',
        gradeBand: i <= 2 ? 'K-1' : '2-3',
        difficulty: 'beginner',
        contentVersion: 'legacy_reclassified',
        skillTags: ['Emotional Awareness'],
        skillArea: 'feelings',
      }),
  ),
];

/** Preserved legacy Caiden questions (24 total in archive files) */
export const CAIDEN_LEGACY_ARCHIVE_CLASSIFICATION: ClassifiedQuestionEntry[] = [
  ...Array.from({ length: 8 }, (_, i) =>
    kidEntry({
      id: `cq1-q${i + 1}`,
      character: 'caiden',
      moduleId: 'quest-1-legacy',
      sourceFile: 'caiden/legacy/quest1WhatComesFirst.legacy.ts',
      questionPreview: `Legacy quest 1 question ${i + 1}`,
      gradeBand: i <= 4 ? 'K-1' : i <= 6 ? '2-3' : '4-5',
      difficulty: i <= 4 ? 'beginner' : i <= 6 ? 'intermediate' : 'advanced',
      contentVersion: 'legacy_reclassified',
      skillTags: ['Executive Function', 'Focus'],
      skillArea: 'focus',
    }),
  ),
  ...Array.from({ length: 8 }, (_, i) =>
    kidEntry({
      id: `cq2-q${i + 1}`,
      character: 'caiden',
      moduleId: 'quest-2-legacy',
      sourceFile: 'caiden/legacy/quest2ChooseYourNextMove.legacy.ts',
      questionPreview: `Legacy quest 2 question ${i + 1}`,
      gradeBand: i <= 3 ? '2-3' : '4-5',
      difficulty: i <= 3 ? 'beginner' : 'intermediate',
      contentVersion: 'legacy_reclassified',
      skillTags: ['Decision Making', 'Self-Regulation'],
      skillArea: 'focus',
    }),
  ),
  ...Array.from({ length: 8 }, (_, i) =>
    kidEntry({
      id: `cq3-q${i + 1}`,
      character: 'caiden',
      moduleId: 'quest-3-legacy',
      sourceFile: 'caiden/legacy/quest3ResetAndReturn.legacy.ts',
      questionPreview: `Legacy quest 3 question ${i + 1}`,
      gradeBand: i <= 4 ? 'K-1' : '2-3',
      difficulty: 'beginner',
      contentVersion: 'legacy_reclassified',
      skillTags: ['Focus Recovery', 'Self-Regulation'],
      skillArea: 'focus',
    }),
  ),
];

/** Combined registry — kid + adult pools kept separate by audience/gradeBand */
export const STATIC_CONTENT_CLASSIFICATION: ClassifiedQuestionEntry[] = [
  ...KID_STATIC_CONTENT_CLASSIFICATION,
  ...ADULT_CONTENT_CLASSIFICATION,
];

export { ADULT_CONTENT_CLASSIFICATION };

export const ADAPTIVE_BAND_COUNTS = {
  caiden: {
    quests: 9,
    bands: ['K-1', '2-3', '4-5', '6-8'],
    legacyQuests: 5,
    legacyQuestionsPerBand: 3,
    extendedQuests: 4,
    extendedQuestionsPerBand: 8,
  },
  mirandaAdaptive: { files: 3, bands: ['K-1', '2-3', '4-5', '6-8'], questionsPerBand: 3 },
  charlieAdaptive: { missions: 8, bands: ['K-1', '2-3', '4-5', '6-8'], questionsPerBand: 3 },
  b4Adaptive: { missions: 8, bands: ['K-1', '2-3', '4-5', '6-8'], questionsPerBand: 3 },
  zekeAdaptive: { missions: 8, bands: ['K-1', '2-3', '4-5', '6-8'], questionsPerBand: 3 },
} as const;

export function summarizeClassification(entries: ClassifiedQuestionEntry[]) {
  const kidByBand: Record<StudentGradeBand, number> = { 'K-1': 0, '2-3': 0, '4-5': 0, '6-8': 0 };
  let adultCount = 0;
  const vague = entries.filter((e) => e.classificationNote);

  for (const entry of entries) {
    if (entry.gradeBand === 'adult') {
      adultCount += 1;
    } else {
      kidByBand[entry.gradeBand] += 1;
    }
  }

  return { total: entries.length, kidByBand, adultCount, vagueCount: vague.length, vague };
}
