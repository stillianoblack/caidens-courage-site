import './gameDesignStyles';

export { default as GameShell } from './GameShell';
export type { GameShellProps, GameShellPortalType } from './GameShell';

export { default as GameplayShell } from './GameplayShell';
export type { GameplayShellProps } from './GameplayShell';

export {
  GAMEPLAY_SHELL_VARIANTS,
  resolveGameplayShellVariant,
  resolveGuideCharacterForShell,
  type GameplayShellVariantId,
  type GameplayShellVariantConfig,
} from './gameplayShellVariants';

export { default as CoachingShellQuizFrame } from './CoachingShellQuizFrame';
export type { CoachingShellQuizFrameProps } from './CoachingShellQuizFrame';

export {
  ReadAloudControl,
  GameCoachingRailAside,
  IdleSessionGuard,
  buildAssessmentCoachRailSegments,
  buildCoachCardReadAloudSegments,
  buildGameplayReadAloudSegments,
  buildReadAloudSegmentsFromGameQuestion,
  buildReadAloudSegmentsFromParts,
  browserSpeechProvider,
} from '../narration';
export type { CoachReadAloudInput, NarrationProvider, ReadAloudParts } from '../narration';

export { default as AssessmentCoachRail } from './AssessmentCoachRail';
export type { AssessmentCoachRailProps } from './AssessmentCoachRail';

export { default as GameplayTopBar } from './GameplayTopBar';
export type {
  GameplayTopBarProps,
  GameplayTopBarVariant,
  GameplayTopBarFlameDisplay,
} from './GameplayTopBar';

export {
  resolveGameplayTopBarVariant,
  resolveGameplayTopBarFlames,
} from './resolveGameplayTopBarConfig';

export { default as ScenarioCard } from './ScenarioCard';
export type { ScenarioCardProps } from './ScenarioCard';

export { default as QuestionCard } from './QuestionCard';
export type { QuestionCardProps } from './QuestionCard';

export { default as CharacterScenarioImage } from './CharacterScenarioImage';
export type {
  CharacterScenarioImageProps,
  CharacterScenarioImageFit,
} from './CharacterScenarioImage';

export { resolveGameScenarioImage } from './gameScenarioAssets';
export type { GameScenarioImage, GameScenarioFlags } from './gameScenarioAssets';

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
  GAME_UI_PATTERNS,
  b4CheckInPattern,
  caidenFocusMissionPattern,
  charlieScienceLabPattern,
  mirandaMysteryFilePattern,
  uncleTRealLifeMissionPattern,
  zekeTeamQuestPattern,
  patternClassName,
  resolveGameUIPattern,
} from './patterns/gameUIPatterns';
export type { GameUIPatternConfig, GameUIPatternId } from './patterns/gameUIPatterns';

export { default as GuideFeedbackCard } from './GuideFeedbackCard';
export type { GuideFeedbackCardProps, GuideFeedbackTone } from './GuideFeedbackCard';

export {
  INTERACTIVE_MODULE_COMPONENTS,
  INTERACTIVE_MODULE_EXAMPLES,
  INTERACTIVE_MODULE_RULES,
} from './interactiveModuleRegistry';
export type { InteractiveModuleKind, InteractiveModuleExample } from './interactiveModuleRegistry';
