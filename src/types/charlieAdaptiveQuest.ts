import type { GameAssessmentComplete, GameAssessmentLanding } from './gameAssessment';
import type { GradeBandQuestionMetadata } from './gradeBandContentMetadata';
import type { MirandaGradeBand } from './mirandaAdaptiveQuest';

export type CharlieGradeBand = MirandaGradeBand;

export type CharlieAdaptiveQuestion = {
  id: string;
  question: string;
  scenarioText?: string;
  scenarioTag?: string;
  scenarioAccent?: string;
  options: { id: string; label: string }[];
  correctAnswer: string;
  explanation: string;
  correctFeedback: string;
  incorrectFeedback: string;
  hint: string;
  skillTags: string[];
  metadata?: GradeBandQuestionMetadata;
};

export type CharlieGradeContent = {
  dashboardTitle: string;
  dashboardDescription: string;
  questions: CharlieAdaptiveQuestion[];
  skillTags: string[];
};

export type CharlieAdaptiveMissionFile = {
  id: string;
  title: string;
  subtitle: string;
  character: 'charlie';
  missionNumber: number;
  skillArea: string;
  skillFocus: string[];
  storySetup: string;
  missionB4Tip: string;
  scenarioAccent: string;
  landing: GameAssessmentLanding;
  complete: GameAssessmentComplete;
  gradeContent: Partial<Record<CharlieGradeBand, CharlieGradeContent>>;
};
