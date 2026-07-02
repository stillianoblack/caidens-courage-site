import type { B4AdaptiveMissionFile } from '../../types/b4AdaptiveQuest';
import { registerModuleTracking } from '../moduleTrackingRegistry';
import { registerB4AdaptiveMission } from './b4AdaptiveBuilder';
import { B4_MISSION_1_FILE } from './missions/mission1MoodScanner';
import { B4_MISSION_2_FILE } from './missions/mission2BodySignalDetective';
import { B4_MISSION_3_FILE } from './missions/mission3BraveChoiceButton';
import { B4_MISSION_4_FILE } from './missions/mission4FocusResetStation';
import { B4_MISSION_5_FILE } from './missions/mission5CalmDownCountdown';
import { B4_MISSION_6_FILE } from './missions/mission6OopsRepairLab';
import { B4_MISSION_7_FILE } from './missions/mission7ConfidenceCharger';
import { B4_MISSION_8_FILE } from './missions/mission8FocusFlameFinale';

export {
  B4_MISSION_1_ID,
  B4_MISSION_1_FILE,
} from './missions/mission1MoodScanner';
export {
  B4_MISSION_2_ID,
  B4_MISSION_2_FILE,
} from './missions/mission2BodySignalDetective';
export {
  B4_MISSION_3_ID,
  B4_MISSION_3_FILE,
} from './missions/mission3BraveChoiceButton';
export {
  B4_MISSION_4_ID,
  B4_MISSION_4_FILE,
} from './missions/mission4FocusResetStation';
export {
  B4_MISSION_5_ID,
  B4_MISSION_5_FILE,
} from './missions/mission5CalmDownCountdown';
export {
  B4_MISSION_6_ID,
  B4_MISSION_6_FILE,
} from './missions/mission6OopsRepairLab';
export {
  B4_MISSION_7_ID,
  B4_MISSION_7_FILE,
} from './missions/mission7ConfidenceCharger';
export {
  B4_MISSION_8_ID,
  B4_MISSION_8_FILE,
} from './missions/mission8FocusFlameFinale';

export const B4_ADAPTIVE_MISSION_FILES: B4AdaptiveMissionFile[] = [
  B4_MISSION_1_FILE,
  B4_MISSION_2_FILE,
  B4_MISSION_3_FILE,
  B4_MISSION_4_FILE,
  B4_MISSION_5_FILE,
  B4_MISSION_6_FILE,
  B4_MISSION_7_FILE,
  B4_MISSION_8_FILE,
];

export const B4_ADAPTIVE_MISSION_IDS = B4_ADAPTIVE_MISSION_FILES.map((mission) => mission.id);

/** Legacy hub routes — not adaptive mission IDs */
export const B4_RESERVED_MISSION_ROUTES = new Set(['check-in', 'week-1', 'feeling-finder']);

function b4SkillAreaSlug(skillArea: string): string {
  return skillArea
    .toLowerCase()
    .replace(/\s*\/\s*/g, '-')
    .replace(/\s+/g, '-');
}

for (const mission of B4_ADAPTIVE_MISSION_FILES) {
  registerB4AdaptiveMission(mission);
  registerModuleTracking({
    moduleId: mission.id,
    moduleTitle: mission.subtitle,
    character: 'b4',
    audience: 'student',
    role: 'student',
    skillArea: b4SkillAreaSlug(mission.skillArea),
  });
}
