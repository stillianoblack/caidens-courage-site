import type { MissionGameTheme } from '../../../components/mission-game/MissionSpeechRow';

export type GameUIPatternId =
  | 'caiden-focus-mission'
  | 'miranda-mystery-file'
  | 'charlie-science-lab'
  | 'zeke-sensory-quest'
  | 'uncle-t-real-life-mission'
  | 'b4-check-in';

export type GameUIPatternConfig = {
  id: GameUIPatternId;
  themeName: string;
  guideLabel: string;
  progressLabel: string;
  primaryAccent: string;
  secondaryAccent: string;
  backgroundTreatment: string;
  cardStyle: 'academy-mission' | 'mystery-file' | 'nature-lab' | 'sensory-quest' | 'coaching-mission' | 'check-in';
  badgeStyle: 'gold-checkpoint' | 'purple-clue' | 'green-trail' | 'blue-calm' | 'amber-coach' | 'b4-signal';
  lockedStyle: 'muted-gold' | 'muted-purple' | 'muted-green' | 'muted-blue' | 'muted-amber' | 'muted-b4';
  completedStyle: 'gold-complete' | 'purple-complete' | 'green-complete' | 'blue-complete' | 'amber-complete' | 'b4-complete';
  questionCardStyle: 'focus-primary' | 'case-primary' | 'lab-primary' | 'quest-primary' | 'coach-primary' | 'checkin-primary';
  feedbackCardStyle: 'b4-lock-in' | 'facilitator-insight';
  missionCtaLabel: string;
  hubEyebrowTone: 'gold' | 'purple' | 'green' | 'blue' | 'amber' | 'b4';
};

export const caidenFocusMissionPattern: GameUIPatternConfig = {
  id: 'caiden-focus-mission',
  themeName: 'Caiden Focus Mission',
  guideLabel: 'B-4 Coach',
  progressLabel: 'Focus Quest Progress',
  primaryAccent: '#e5c06a',
  secondaryAccent: '#1a2f52',
  backgroundTreatment: 'focus-flame-gradient',
  cardStyle: 'academy-mission',
  badgeStyle: 'gold-checkpoint',
  lockedStyle: 'muted-gold',
  completedStyle: 'gold-complete',
  questionCardStyle: 'focus-primary',
  feedbackCardStyle: 'b4-lock-in',
  missionCtaLabel: 'Start Quest',
  hubEyebrowTone: 'gold',
};

export const mirandaMysteryFilePattern: GameUIPatternConfig = {
  id: 'miranda-mystery-file',
  themeName: 'Miranda Mystery File',
  guideLabel: 'B-4 Reading Coach',
  progressLabel: 'Case Progress',
  primaryAccent: '#7c6aad',
  secondaryAccent: '#2f2147',
  backgroundTreatment: 'mystery-notebook',
  cardStyle: 'mystery-file',
  badgeStyle: 'purple-clue',
  lockedStyle: 'muted-purple',
  completedStyle: 'purple-complete',
  questionCardStyle: 'case-primary',
  feedbackCardStyle: 'b4-lock-in',
  missionCtaLabel: 'Open Case',
  hubEyebrowTone: 'purple',
};

export const charlieScienceLabPattern: GameUIPatternConfig = {
  id: 'charlie-science-lab',
  themeName: 'Charlie Science Lab',
  guideLabel: 'B-4 Nature Coach',
  progressLabel: 'Trail Progress',
  primaryAccent: '#5cb85c',
  secondaryAccent: '#1a3d2e',
  backgroundTreatment: 'nature-lab',
  cardStyle: 'nature-lab',
  badgeStyle: 'green-trail',
  lockedStyle: 'muted-green',
  completedStyle: 'green-complete',
  questionCardStyle: 'lab-primary',
  feedbackCardStyle: 'b4-lock-in',
  missionCtaLabel: 'Start Trail',
  hubEyebrowTone: 'green',
};

export const zekeTeamQuestPattern: GameUIPatternConfig = {
  id: 'zeke-sensory-quest',
  themeName: 'Zeke Team Quest',
  guideLabel: 'B-4 Team Coach',
  progressLabel: 'Team Quest Progress',
  primaryAccent: '#e5c06a',
  secondaryAccent: '#1a2f52',
  backgroundTreatment: 'team-quest-warm',
  cardStyle: 'sensory-quest',
  badgeStyle: 'gold-checkpoint',
  lockedStyle: 'muted-gold',
  completedStyle: 'gold-complete',
  questionCardStyle: 'quest-primary',
  feedbackCardStyle: 'b4-lock-in',
  missionCtaLabel: 'Start Mission',
  hubEyebrowTone: 'gold',
};

export const uncleTRealLifeMissionPattern: GameUIPatternConfig = {
  id: 'uncle-t-real-life-mission',
  themeName: 'Uncle T Real-Life Mission',
  guideLabel: 'Uncle T',
  progressLabel: 'Coaching Progress',
  primaryAccent: '#c9732d',
  secondaryAccent: '#1a2f52',
  backgroundTreatment: 'coaching-warm',
  cardStyle: 'coaching-mission',
  badgeStyle: 'amber-coach',
  lockedStyle: 'muted-amber',
  completedStyle: 'amber-complete',
  questionCardStyle: 'coach-primary',
  feedbackCardStyle: 'facilitator-insight',
  missionCtaLabel: 'Start Mission',
  hubEyebrowTone: 'amber',
};

export const b4CheckInPattern: GameUIPatternConfig = {
  id: 'b4-check-in',
  themeName: 'B-4 Check-In',
  guideLabel: 'B-4',
  progressLabel: 'Check-In Progress',
  primaryAccent: '#4a90c4',
  secondaryAccent: '#1a2f52',
  backgroundTreatment: 'b4-checkin',
  cardStyle: 'check-in',
  badgeStyle: 'b4-signal',
  lockedStyle: 'muted-b4',
  completedStyle: 'b4-complete',
  questionCardStyle: 'checkin-primary',
  feedbackCardStyle: 'b4-lock-in',
  missionCtaLabel: 'Continue',
  hubEyebrowTone: 'b4',
};

export const GAME_UI_PATTERNS: Record<GameUIPatternId, GameUIPatternConfig> = {
  'caiden-focus-mission': caidenFocusMissionPattern,
  'miranda-mystery-file': mirandaMysteryFilePattern,
  'charlie-science-lab': charlieScienceLabPattern,
  'zeke-sensory-quest': zekeTeamQuestPattern,
  'uncle-t-real-life-mission': uncleTRealLifeMissionPattern,
  'b4-check-in': b4CheckInPattern,
};

export function resolveGameUIPattern(input: {
  theme?: MissionGameTheme | string;
  useCaidenHeader?: boolean;
  useMirandaHeader?: boolean;
  useCharlieHeader?: boolean;
  useZekeHeader?: boolean;
  useB4Header?: boolean;
  useVictoriaHeader?: boolean;
  useUncleTHeader?: boolean;
}): GameUIPatternConfig {
  if (input.useCaidenHeader || input.theme === 'caiden') return caidenFocusMissionPattern;
  if (input.useMirandaHeader || input.theme === 'miranda') return mirandaMysteryFilePattern;
  if (input.useCharlieHeader || input.theme === 'charlie') return charlieScienceLabPattern;
  if (input.useZekeHeader || input.theme === 'zeke') return zekeTeamQuestPattern;
  if (input.useUncleTHeader || input.theme === 'uncle-t') return uncleTRealLifeMissionPattern;
  if (input.useVictoriaHeader || input.theme === 'victoria') return uncleTRealLifeMissionPattern;
  if (input.useB4Header || input.theme === 'b4') return b4CheckInPattern;
  return b4CheckInPattern;
}

export function patternClassName(id: GameUIPatternId): string {
  return `game-pattern--${id}`;
}
