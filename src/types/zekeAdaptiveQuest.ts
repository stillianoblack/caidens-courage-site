import type { GameAssessmentComplete, GameAssessmentLanding } from './gameAssessment';
import type { GradeBandQuestionMetadata } from './gradeBandContentMetadata';
import type { MirandaGradeBand } from './mirandaAdaptiveQuest';

export type ZekeGradeBand = MirandaGradeBand;

export type ZekeAdaptiveQuestion = {
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

export type ZekeGradeContent = {
  dashboardTitle: string;
  dashboardDescription: string;
  questions: ZekeAdaptiveQuestion[];
  skillTags: string[];
};

export type ZekeAdaptiveMissionFile = {
  id: string;
  title: string;
  subtitle: string;
  character: 'zeke';
  missionNumber: number;
  skillArea: string;
  skillFocus: string[];
  storySetup: string;
  missionB4Tip: string;
  landing: GameAssessmentLanding;
  complete: GameAssessmentComplete;
  gradeContent: Partial<Record<ZekeGradeBand, ZekeGradeContent>>;
};
