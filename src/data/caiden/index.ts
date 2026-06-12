import type { GameAssessmentConfig } from '../../types/gameAssessment';
import type { CaidenGradeBand } from '../../types/caidenAdaptiveQuest';
import {
  buildCaidenAdaptiveConfig,
  CAIDEN_ADAPTIVE_QUEST_REGISTRY,
  getCaidenDashboardDescription,
} from './caidenAdaptiveBuilder';
import {
  CAIDEN_QUEST_1_FILE,
  CAIDEN_QUEST_1_ID,
} from './questAdaptiveWhatComesFirst';
import {
  CAIDEN_QUEST_2_FILE,
  CAIDEN_QUEST_2_ID,
} from './questAdaptiveFocusOrDistraction';
import {
  CAIDEN_QUEST_3_FILE,
  CAIDEN_QUEST_3_ID,
} from './questAdaptiveTimeTracker';
import {
  CAIDEN_QUEST_4_FILE,
  CAIDEN_QUEST_4_ID,
} from './questAdaptiveResetAndReturn';
import {
  CAIDEN_QUEST_5_FILE,
  CAIDEN_QUEST_5_ID,
} from './questAdaptiveBuildThePlan';
import {
  CAIDEN_QUEST_6_FILE,
  CAIDEN_QUEST_6_ID,
} from './questAdaptiveSnackShopChallenge';
import {
  CAIDEN_QUEST_7_FILE,
  CAIDEN_QUEST_7_ID,
} from './questAdaptiveCampSupplyMission';
import {
  CAIDEN_QUEST_8_FILE,
  CAIDEN_QUEST_8_ID,
} from './questAdaptiveHomeworkRescuePlan';
import {
  CAIDEN_QUEST_9_FILE,
  CAIDEN_QUEST_9_ID,
} from './questAdaptiveCampLeaderChallenge';
import './questAdaptiveWhatComesFirst';
import './questAdaptiveFocusOrDistraction';
import './questAdaptiveTimeTracker';
import './questAdaptiveResetAndReturn';
import './questAdaptiveBuildThePlan';
import './questAdaptiveSnackShopChallenge';
import './questAdaptiveCampSupplyMission';
import './questAdaptiveHomeworkRescuePlan';
import './questAdaptiveCampLeaderChallenge';
import { applyCaidenLegacyK1Bands } from './caidenApplyLegacyK1Bands';

applyCaidenLegacyK1Bands();

export type CaidenQuestMeta = {
  id: string;
  questNumber: number;
  title: string;
  subtitle: string;
  description: string;
  skills: string[];
  reward: string;
  adaptiveQuestId: string;
  config: GameAssessmentConfig;
};

const CAIDEN_ADAPTIVE_FILES = [
  CAIDEN_QUEST_1_FILE,
  CAIDEN_QUEST_2_FILE,
  CAIDEN_QUEST_3_FILE,
  CAIDEN_QUEST_4_FILE,
  CAIDEN_QUEST_5_FILE,
  CAIDEN_QUEST_6_FILE,
  CAIDEN_QUEST_7_FILE,
  CAIDEN_QUEST_8_FILE,
  CAIDEN_QUEST_9_FILE,
] as const;

export const CAIDEN_QUESTS: CaidenQuestMeta[] = CAIDEN_ADAPTIVE_FILES.map((file) => ({
  id: file.id,
  questNumber: file.questNumber,
  title: `${file.title}: ${file.subtitle}`,
  subtitle: file.subtitle,
  description: file.gradeContent['2-3']!.dashboardDescription,
  skills: file.skillFocus,
  reward: file.complete.badges?.[0] ?? 'Focus Flame Badge',
  adaptiveQuestId: file.id,
  config: buildCaidenAdaptiveConfig(file, '2-3'),
}));

export function getCaidenQuestById(id: string | undefined): CaidenQuestMeta | undefined {
  if (!id) return undefined;
  return CAIDEN_QUESTS.find((quest) => quest.id === id);
}

export function getCaidenAdaptiveQuest(questId: string) {
  return CAIDEN_ADAPTIVE_QUEST_REGISTRY[questId];
}

export function resolveCaidenQuestDescription(
  questId: string,
  gradeBand: CaidenGradeBand,
): string {
  const file = getCaidenAdaptiveQuest(questId);
  if (file) {
    return getCaidenDashboardDescription(file, gradeBand);
  }
  return getCaidenQuestById(questId)?.description ?? '';
}

export function resolveCaidenQuestConfig(
  questId: string,
  gradeBand: CaidenGradeBand,
): GameAssessmentConfig | undefined {
  const quest = getCaidenQuestById(questId);
  if (!quest) return undefined;

  const adaptiveFile = getCaidenAdaptiveQuest(quest.adaptiveQuestId);
  if (adaptiveFile) {
    return buildCaidenAdaptiveConfig(adaptiveFile, gradeBand);
  }

  return quest.config;
}

export function isCaidenAdaptiveQuest(questId: string): boolean {
  return questId in CAIDEN_ADAPTIVE_QUEST_REGISTRY;
}

export const caidenAdaptiveQuests = [...CAIDEN_ADAPTIVE_FILES];

export const CAIDEN_QUEST_1_CONFIG = buildCaidenAdaptiveConfig(CAIDEN_QUEST_1_FILE, '2-3');

export {
  CAIDEN_QUEST_1_ID,
  CAIDEN_QUEST_2_ID,
  CAIDEN_QUEST_3_ID,
  CAIDEN_QUEST_4_ID,
  CAIDEN_QUEST_5_ID,
  CAIDEN_QUEST_6_ID,
  CAIDEN_QUEST_7_ID,
  CAIDEN_QUEST_8_ID,
  CAIDEN_QUEST_9_ID,
  CAIDEN_ADAPTIVE_QUEST_REGISTRY,
  buildCaidenAdaptiveConfig,
  getCaidenDashboardDescription,
};
