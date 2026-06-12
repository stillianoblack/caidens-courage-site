import type { GameAssessmentComplete, GameAssessmentLanding } from './gameAssessment';
import type { GradeBandQuestionMetadata } from './gradeBandContentMetadata';
import type { MirandaGradeBand } from './mirandaAdaptiveQuest';

export type B4GradeBand = MirandaGradeBand;

export type B4AdaptiveQuestion = {
  id: string;
  question: string;
  scenarioText?: string;
  scenarioTag?: string;
  options: { id: string; label: string }[];
  correctAnswer: string;
  explanation: string;
  correctFeedback: string;
  incorrectFeedback: string;
  hint: string;
  skillTags: string[];
  metadata?: GradeBandQuestionMetadata;
};

export type B4GradeContent = {
  dashboardTitle: string;
  dashboardDescription: string;
  questions: B4AdaptiveQuestion[];
  skillTags: string[];
};

export type B4AdaptiveMissionFile = {
  id: string;
  title: string;
  subtitle: string;
  character: 'b4';
  missionNumber: number;
  skillArea: string;
  skillFocus: string[];
  storySetup: string;
  missionB4Tip: string;
  landing: GameAssessmentLanding;
  complete: GameAssessmentComplete;
  gradeContent: Partial<Record<B4GradeBand, B4GradeContent>>;
};
