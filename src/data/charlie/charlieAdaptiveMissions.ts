import type { CharlieAdaptiveMissionFile } from '../../types/charlieAdaptiveQuest';
import { registerModuleTracking } from '../moduleTrackingRegistry';
import { CHARLIE_MISSION_1_FILE } from './missions/mission1MysteryFootprints';
import { CHARLIE_MISSION_2_FILE } from './missions/mission2FloatingOrange';
import { CHARLIE_MISSION_3_FILE } from './missions/mission3MysterySound';
import { CHARLIE_MISSION_4_FILE } from './missions/mission4VolcanoTrouble';
import { CHARLIE_MISSION_5_FILE } from './missions/mission5MissingPlant';
import { CHARLIE_MISSION_6_FILE } from './missions/mission6RobotRescue';
import { CHARLIE_MISSION_7_FILE } from './missions/mission7MarshmallowTower';
import { CHARLIE_MISSION_8_FILE } from './missions/mission8ScienceFairMystery';

import './missions/mission1MysteryFootprints';
import './missions/mission2FloatingOrange';
import './missions/mission3MysterySound';
import './missions/mission4VolcanoTrouble';
import './missions/mission5MissingPlant';
import './missions/mission6RobotRescue';
import './missions/mission7MarshmallowTower';
import './missions/mission8ScienceFairMystery';

export {
  CHARLIE_MISSION_1_ID,
  CHARLIE_MISSION_1_FILE,
} from './missions/mission1MysteryFootprints';
export {
  CHARLIE_MISSION_2_ID,
  CHARLIE_MISSION_2_FILE,
} from './missions/mission2FloatingOrange';
export {
  CHARLIE_MISSION_3_ID,
  CHARLIE_MISSION_3_FILE,
} from './missions/mission3MysterySound';
export {
  CHARLIE_MISSION_4_ID,
  CHARLIE_MISSION_4_FILE,
} from './missions/mission4VolcanoTrouble';
export {
  CHARLIE_MISSION_5_ID,
  CHARLIE_MISSION_5_FILE,
} from './missions/mission5MissingPlant';
export {
  CHARLIE_MISSION_6_ID,
  CHARLIE_MISSION_6_FILE,
} from './missions/mission6RobotRescue';
export {
  CHARLIE_MISSION_7_ID,
  CHARLIE_MISSION_7_FILE,
} from './missions/mission7MarshmallowTower';
export {
  CHARLIE_MISSION_8_ID,
  CHARLIE_MISSION_8_FILE,
} from './missions/mission8ScienceFairMystery';

export const CHARLIE_ADAPTIVE_MISSION_FILES: CharlieAdaptiveMissionFile[] = [
  CHARLIE_MISSION_1_FILE,
  CHARLIE_MISSION_2_FILE,
  CHARLIE_MISSION_3_FILE,
  CHARLIE_MISSION_4_FILE,
  CHARLIE_MISSION_5_FILE,
  CHARLIE_MISSION_6_FILE,
  CHARLIE_MISSION_7_FILE,
  CHARLIE_MISSION_8_FILE,
];

export const CHARLIE_ADAPTIVE_MISSION_IDS = CHARLIE_ADAPTIVE_MISSION_FILES.map((mission) => mission.id);

function charlieSkillAreaSlug(skillArea: string): string {
  return skillArea
    .toLowerCase()
    .replace(/\s*\/\s*/g, '-')
    .replace(/\s+/g, '-');
}

for (const mission of CHARLIE_ADAPTIVE_MISSION_FILES) {
  registerModuleTracking({
    moduleId: mission.id,
    moduleTitle: mission.subtitle,
    character: 'charlie',
    audience: 'student',
    role: 'student',
    skillArea: charlieSkillAreaSlug(mission.skillArea),
  });
}
