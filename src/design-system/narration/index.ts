export type {
  NarrationPlaybackState,
  NarrationProvider,
  NarrationVoiceSettings,
} from './types';
export { DEFAULT_NARRATION_VOICE } from './types';

export { BrowserSpeechProvider, browserSpeechProvider } from './BrowserSpeechProvider';
export { pickEnglishVoice, loadSpeechVoices } from './pickEnglishVoice';

export {
  buildGameplayReadAloudSegments,
  buildReadAloudSegmentsFromGameQuestion,
  buildReadAloudSegmentsFromParts,
  type ReadAloudParts,
  type ReadAloudScope,
} from './buildReadAloudSegments';

export {
  buildAssessmentCoachRailSegments,
  buildCoachCardReadAloudSegments,
  type CoachReadAloudInput,
} from './buildCoachCardReadAloudSegments';

export { useNarration } from './useNarration';
export { default as ReadAloudControl } from './ReadAloudControl';
export type { ReadAloudControlProps } from './ReadAloudControl';
export { default as ReadAloudIconButton } from './ReadAloudIconButton';

export { default as GameCoachingRailAside } from './GameCoachingRailAside';
export type { GameCoachingRailAsideProps } from './GameCoachingRailAside';

export { default as IdleSessionGuard } from './IdleSessionGuard';
export type { IdleSessionGuardProps } from './IdleSessionGuard';
