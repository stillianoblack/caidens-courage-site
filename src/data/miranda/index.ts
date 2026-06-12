import type { GameAssessmentConfig } from '../../types/gameAssessment';
import type { MirandaGradeBand } from '../../types/mirandaAdaptiveQuest';
import { MIRANDA_FILE_3_CONFIG, MIRANDA_FILE_3_ID } from './file3MissingLetters';
import { MIRANDA_FILE_4_CONFIG, MIRANDA_FILE_4_ID } from './file4ContextClueChallenge';
import { MIRANDA_FILE_5_CONFIG, MIRANDA_FILE_5_ID } from './file5DetectiveNotebook';
import {
  buildMirandaAdaptiveConfig,
  getMirandaDashboardDescription,
  MIRANDA_ADAPTIVE_QUEST_REGISTRY,
} from './mirandaAdaptiveBuilder';
import './fileAdaptiveMissingSchedule';
import './fileAdaptiveMissingStudent';
import './fileAdaptiveMissingClue';
import { applyMirandaLegacyK1Bands } from './mirandaApplyLegacyK1Bands';
import {
  MIRANDA_MISSING_SCHEDULE_FILE,
  MIRANDA_MISSING_SCHEDULE_ID,
} from './fileAdaptiveMissingSchedule';
import {
  MIRANDA_MISSING_STUDENT_FILE,
  MIRANDA_MISSING_STUDENT_ID,
} from './fileAdaptiveMissingStudent';
import {
  MIRANDA_MISSING_CLUE_FILE,
  MIRANDA_MISSING_CLUE_ID,
} from './fileAdaptiveMissingClue';
import { MIRANDA_AVATAR_SRC, MIRANDA_HUB, MIRANDA_MISSION_AVATAR } from './sharedAssets';

export type MirandaMissionMeta = {
  id: string;
  fileNumber: number;
  title: string;
  subtitle: string;
  description: string;
  config: GameAssessmentConfig;
  adaptiveFileId?: string;
  skillTags?: string[];
};

const ADAPTIVE_FILE_IDS = [
  MIRANDA_MISSING_SCHEDULE_ID,
  MIRANDA_MISSING_STUDENT_ID,
  MIRANDA_MISSING_CLUE_ID,
] as const;

function isAdaptiveMirandaMission(id: string): boolean {
  return ADAPTIVE_FILE_IDS.includes(id as (typeof ADAPTIVE_FILE_IDS)[number]);
}

applyMirandaLegacyK1Bands();

export const MIRANDA_MISSIONS: MirandaMissionMeta[] = [
  {
    id: MIRANDA_MISSING_SCHEDULE_ID,
    fileNumber: 1,
    title: "Miranda's Mystery Files",
    subtitle: 'The Missing Schedule',
    description: MIRANDA_MISSING_SCHEDULE_FILE.gradeContent['2-3']!.dashboardDescription,
    adaptiveFileId: MIRANDA_MISSING_SCHEDULE_ID,
    skillTags: MIRANDA_MISSING_SCHEDULE_FILE.skillFocus,
    config: buildMirandaAdaptiveConfig(MIRANDA_MISSING_SCHEDULE_FILE, '2-3'),
  },
  {
    id: MIRANDA_MISSING_STUDENT_ID,
    fileNumber: 2,
    title: "Miranda's Mystery Files",
    subtitle: 'The Missing Student',
    description: MIRANDA_MISSING_STUDENT_FILE.gradeContent['2-3']!.dashboardDescription,
    adaptiveFileId: MIRANDA_MISSING_STUDENT_ID,
    skillTags: MIRANDA_MISSING_STUDENT_FILE.skillFocus,
    config: buildMirandaAdaptiveConfig(MIRANDA_MISSING_STUDENT_FILE, '2-3'),
  },
  {
    id: MIRANDA_MISSING_CLUE_ID,
    fileNumber: 3,
    title: "Miranda's Mystery Files",
    subtitle: 'The Missing Clue',
    description: MIRANDA_MISSING_CLUE_FILE.gradeContent['2-3']!.dashboardDescription,
    adaptiveFileId: MIRANDA_MISSING_CLUE_ID,
    skillTags: MIRANDA_MISSING_CLUE_FILE.skillFocus,
    config: buildMirandaAdaptiveConfig(MIRANDA_MISSING_CLUE_FILE, '2-3'),
  },
  {
    id: MIRANDA_FILE_3_ID,
    fileNumber: 4,
    title: "Miranda's Mystery Files #4",
    subtitle: 'The Missing Letters',
    description: 'Letters vanished from the clues. Restore the words and crack the case.',
    config: MIRANDA_FILE_3_CONFIG,
    skillTags: ['Spelling', 'Word Building'],
  },
  {
    id: MIRANDA_FILE_4_ID,
    fileNumber: 5,
    title: "Miranda's Mystery Files #5",
    subtitle: 'The Context Clue Challenge',
    description: 'Use context clues to unlock the meaning of important detective words.',
    config: MIRANDA_FILE_4_CONFIG,
    skillTags: ['Vocabulary', 'Context Clues'],
  },
  {
    id: MIRANDA_FILE_5_ID,
    fileNumber: 6,
    title: "Miranda's Mystery Files #6",
    subtitle: "Miranda's Detective Notebook",
    description: 'Follow the footprint trail, study the clues, and make smart inferences.',
    config: MIRANDA_FILE_5_CONFIG,
    skillTags: ['Comprehension', 'Inference', 'Critical Thinking'],
  },
];

export function getMirandaMissionById(missionId: string | undefined): MirandaMissionMeta | undefined {
  if (!missionId) return undefined;
  return MIRANDA_MISSIONS.find((mission) => mission.id === missionId);
}

export function getMirandaAdaptiveFile(missionId: string) {
  return MIRANDA_ADAPTIVE_QUEST_REGISTRY[missionId];
}

export function resolveMirandaMissionDescription(
  missionId: string,
  gradeBand: MirandaGradeBand,
): string {
  const file = getMirandaAdaptiveFile(missionId);
  if (file) {
    return getMirandaDashboardDescription(file, gradeBand);
  }
  return getMirandaMissionById(missionId)?.description ?? '';
}

/** Resolve runtime config — applies grade-band variants for adaptive files */
export function resolveMirandaMissionConfig(
  missionId: string,
  gradeBand: MirandaGradeBand,
): GameAssessmentConfig | undefined {
  const mission = getMirandaMissionById(missionId);
  if (!mission) return undefined;

  const adaptiveFile = mission.adaptiveFileId
    ? getMirandaAdaptiveFile(mission.adaptiveFileId)
    : undefined;

  if (adaptiveFile) {
    return buildMirandaAdaptiveConfig(adaptiveFile, gradeBand);
  }

  return mission.config;
}

export function isMirandaAdaptiveMission(missionId: string): boolean {
  return isAdaptiveMirandaMission(missionId);
}

/** Grade-band adaptive mystery files (user-facing: File #1, #2, #3 only) */
export const mirandaFiles = [
  MIRANDA_MISSING_SCHEDULE_FILE,
  MIRANDA_MISSING_STUDENT_FILE,
  MIRANDA_MISSING_CLUE_FILE,
];

export {
  MIRANDA_HUB,
  MIRANDA_AVATAR_SRC,
  MIRANDA_MISSION_AVATAR,
  MIRANDA_FILE_3_CONFIG,
  MIRANDA_FILE_4_CONFIG,
  MIRANDA_FILE_5_CONFIG,
  MIRANDA_FILE_3_ID,
  MIRANDA_FILE_4_ID,
  MIRANDA_FILE_5_ID,
  MIRANDA_MISSING_SCHEDULE_ID,
  MIRANDA_MISSING_STUDENT_ID,
  MIRANDA_MISSING_CLUE_ID,
  MIRANDA_MISSING_SCHEDULE_FILE,
  MIRANDA_MISSING_STUDENT_FILE,
  MIRANDA_MISSING_CLUE_FILE,
  MIRANDA_ADAPTIVE_QUEST_REGISTRY,
  buildMirandaAdaptiveConfig,
  getMirandaDashboardDescription,
};
