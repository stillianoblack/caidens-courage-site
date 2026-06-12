import type { GameAssessmentComplete, GameAssessmentLanding, GameQuestion } from './gameAssessment';
import type { GradeBandQuestionMetadata } from './gradeBandContentMetadata';

/** Grade bands served by Miranda adaptive mystery files */
export type MirandaGradeBand = 'K-1' | '2-3' | '4-5' | '6-8';

export const MIRANDA_GRADE_BANDS: MirandaGradeBand[] = ['K-1', '2-3', '4-5', '6-8'];

export const MIRANDA_GRADE_BAND_LABELS: Record<MirandaGradeBand, string> = {
  'K-1': 'Grades K–1',
  '2-3': 'Grades 2–3',
  '4-5': 'Grades 4–5',
  '6-8': 'Grades 6–8',
};

export function isMirandaGradeBand(value: string | null | undefined): value is MirandaGradeBand {
  return MIRANDA_GRADE_BANDS.includes(value as MirandaGradeBand);
}

/** @deprecated Use MirandaGradeBand */
export type MirandaGradeBandKey = MirandaGradeBand;

export function isMirandaGradeBandKey(value: string | null | undefined): value is MirandaGradeBand {
  return isMirandaGradeBand(value);
}

export type MirandaAdaptiveQuestion = {
  id: string;
  question: string;
  options: { id: string; label: string }[];
  correctAnswer: string;
  explanation: string;
  hint: string;
  skillTags: string[];
  metadata?: GradeBandQuestionMetadata;
};

export type MirandaGradeContent = {
  dashboardTitle: string;
  dashboardDescription: string;
  scenarioEyebrow: string;
  passage: string;
  questions: MirandaAdaptiveQuestion[];
  skillTags: string[];
  /** Optional full passage for read-aloud (defaults to passage) */
  readAloudText?: string;
};

export type MirandaAdaptiveFile = {
  id: string;
  title: string;
  character: 'miranda';
  skillFocus: string[];
  fileNumber: number;
  landing: GameAssessmentLanding;
  complete: GameAssessmentComplete;
  presentationStyle?: 'case_file';
  gradeContent: Partial<Record<MirandaGradeBand, MirandaGradeContent>>;
};

/** Runtime bundle after grade band resolution */
export type MirandaAdaptiveQuest = MirandaAdaptiveFile & {
  activeGradeBand: MirandaGradeBand;
  contentVersionId: string;
  resolvedGradeContent: MirandaGradeContent;
  gradeVariants: Record<MirandaGradeBand, MirandaGradeVariant>;
};

export type MirandaGradeVariant = {
  gradeBandLabel: string;
  passage: string;
  questions: GameQuestion[];
  dashboardDescription: string;
};
