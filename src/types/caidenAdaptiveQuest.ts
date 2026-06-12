import type { GameAssessmentComplete, GameAssessmentLanding } from './gameAssessment';
import type { GradeBandQuestionMetadata } from './gradeBandContentMetadata';
import type { MirandaGradeBand } from './mirandaAdaptiveQuest';

export type CaidenGradeBand = MirandaGradeBand;

export type CaidenAdaptiveQuestion = {
  id: string;
  question: string;
  scenarioText?: string;
  scenarioTag?: string;
  scenarioAccent?: string;
  options: { id: string; label: string }[];
  correctAnswer: string;
  explanation: string;
  hint: string;
  skillTags: string[];
  metadata?: GradeBandQuestionMetadata;
};

export type CaidenGradeContent = {
  dashboardTitle: string;
  dashboardDescription: string;
  questions: CaidenAdaptiveQuestion[];
  skillTags: string[];
};

export type CaidenAdaptiveQuestFile = {
  id: string;
  title: string;
  subtitle: string;
  character: 'caiden';
  questNumber: number;
  skillFocus: string[];
  landing: GameAssessmentLanding;
  complete: GameAssessmentComplete;
  gradeContent: Partial<Record<CaidenGradeBand, CaidenGradeContent>>;
};
