export { default as GameShell } from './GameShell';
export type { GameShellProps, GameShellPortalType } from './GameShell';

export { default as QuestionCard } from './QuestionCard';
export type { QuestionCardProps } from './QuestionCard';

export { default as AnswerChoiceList } from './AnswerChoiceList';
export type { AnswerChoiceListProps } from './AnswerChoiceList';

export { default as B4LockInTip } from './B4LockInTip';
export type { B4LockInTipProps } from './B4LockInTip';

export { default as ExpertInsightCard } from './ExpertInsightCard';
export type { ExpertInsightCardProps } from './ExpertInsightCard';

export { default as CoachingRailShell } from './CoachingRailShell';
export type { CoachingRailShellProps, CoachingRailShellVariant } from './CoachingRailShell';

export { default as GameCoachingRailPlaceholder } from './GameCoachingRailPlaceholder';
export type {
  GameCoachingRailPlaceholderProps,
  GameCoachingRailVariant,
} from './GameCoachingRailPlaceholder';

export { default as LearningMomentCard } from './LearningMomentCard';
export type {
  LearningMomentCardProps,
  LearningMomentVariant,
  LegacyLearningMomentVariant,
  LearningMomentAvatarType,
} from './LearningMomentCard';

export {
  usesB4LockInFeedback,
  shouldShowExpertInsight,
  resolveLockInTips,
  portalTypeToRhythm,
} from './feedbackRhythm';
export type { FeedbackRhythmMode } from './feedbackRhythm';

export {
  getB4LockInTip,
  buildB4LockInTipFromGame,
  resolveB4PortalType,
  normalizeB4SkillArea,
  resolveAnswerLabels,
} from './getB4LockInTip';
export type {
  B4LockInPortalType,
  B4SkillArea,
  B4LockInTipInput,
  B4LockInTipResult,
  B4LockInTipTone,
  BuildB4LockInFromGameParams,
} from './getB4LockInTip';
export { default as ModuleFooter } from './ModuleFooter';

export { default as CheckButton } from './CheckButton';
export type { CheckButtonProps } from './CheckButton';

export { default as HintButton } from './HintButton';
export type { HintButtonProps } from './HintButton';

export { default as ExplainMoreButton } from './ExplainMoreButton';
export type { ExplainMoreButtonProps } from './ExplainMoreButton';

export { default as FeedbackPanel } from './FeedbackPanel';
export type { FeedbackPanelProps } from './FeedbackPanel';

export { getPreSubmitGuideMessage, getGuidePanelLabel } from './getPreSubmitGuideMessage';
export type { GuideCharacter, PreSubmitGuideInput } from './getPreSubmitGuideMessage';

export {
  INTERACTIVE_MODULE_COMPONENTS,
  INTERACTIVE_MODULE_EXAMPLES,
  INTERACTIVE_MODULE_RULES,
} from './interactiveModuleRegistry';
export type { InteractiveModuleKind, InteractiveModuleExample } from './interactiveModuleRegistry';
