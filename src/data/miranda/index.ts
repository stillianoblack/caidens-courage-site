import type { GameAssessmentConfig } from '../../types/gameAssessment';
import { MIRANDA_FILE_1_CONFIG, MIRANDA_FILE_1_ID } from './file1MissingStudent';
import { MIRANDA_FILE_2_CONFIG, MIRANDA_FILE_2_ID } from './file2MissingClue';
import { MIRANDA_FILE_3_CONFIG, MIRANDA_FILE_3_ID } from './file3MissingLetters';
import { MIRANDA_FILE_4_CONFIG, MIRANDA_FILE_4_ID } from './file4ContextClueChallenge';
import { MIRANDA_FILE_5_CONFIG, MIRANDA_FILE_5_ID } from './file5DetectiveNotebook';
import { MIRANDA_AVATAR_SRC, MIRANDA_HUB, MIRANDA_MISSION_AVATAR } from './sharedAssets';

export type MirandaMissionMeta = {
  id: string;
  fileNumber: number;
  title: string;
  subtitle: string;
  description: string;
  config: GameAssessmentConfig;
};

export const MIRANDA_MISSIONS: MirandaMissionMeta[] = [
  {
    id: MIRANDA_FILE_1_ID,
    fileNumber: 1,
    title: "Miranda's Mystery Files #1",
    subtitle: 'The Missing Student',
    description: 'Caiden vanished during the ceremony. Follow Miranda\'s first investigation.',
    config: MIRANDA_FILE_1_CONFIG,
  },
  {
    id: MIRANDA_FILE_2_ID,
    fileNumber: 2,
    title: "Miranda's Mystery Files #2",
    subtitle: 'The Missing Clue',
    description: 'A clue disappeared from the board. Grammar, observation, and deduction will help.',
    config: MIRANDA_FILE_2_CONFIG,
  },
  {
    id: MIRANDA_FILE_3_ID,
    fileNumber: 3,
    title: "Miranda's Mystery Files #3",
    subtitle: 'The Missing Letters',
    description: 'Letters vanished from the clues. Restore the words and crack the case.',
    config: MIRANDA_FILE_3_CONFIG,
  },
  {
    id: MIRANDA_FILE_4_ID,
    fileNumber: 4,
    title: "Miranda's Mystery Files #4",
    subtitle: 'The Context Clue Challenge',
    description: 'Use context clues to unlock the meaning of important detective words.',
    config: MIRANDA_FILE_4_CONFIG,
  },
  {
    id: MIRANDA_FILE_5_ID,
    fileNumber: 5,
    title: "Miranda's Mystery Files #5",
    subtitle: "Miranda's Detective Notebook",
    description: 'Follow the footprint trail, study the clues, and make smart inferences.',
    config: MIRANDA_FILE_5_CONFIG,
  },
];

export function getMirandaMissionById(missionId: string | undefined): MirandaMissionMeta | undefined {
  if (!missionId) return undefined;
  return MIRANDA_MISSIONS.find((mission) => mission.id === missionId);
}

export { MIRANDA_HUB, MIRANDA_AVATAR_SRC, MIRANDA_MISSION_AVATAR, MIRANDA_FILE_1_CONFIG, MIRANDA_FILE_2_CONFIG, MIRANDA_FILE_3_CONFIG, MIRANDA_FILE_4_CONFIG, MIRANDA_FILE_5_CONFIG, MIRANDA_FILE_1_ID, MIRANDA_FILE_2_ID, MIRANDA_FILE_3_ID, MIRANDA_FILE_4_ID, MIRANDA_FILE_5_ID };
