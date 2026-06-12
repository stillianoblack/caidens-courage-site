import type { ZekeAdaptiveMissionFile } from '../../types/zekeAdaptiveQuest';
import { registerModuleTracking } from '../moduleTrackingRegistry';
import { ZEKE_MISSION_1_FILE } from './missions/mission1NewTable';
import { ZEKE_MISSION_2_FILE } from './missions/mission2PassTheBall';
import { ZEKE_MISSION_3_FILE } from './missions/mission3GroupProjectGlitch';
import { ZEKE_MISSION_4_FILE } from './missions/mission4BraveVoice';
import { ZEKE_MISSION_5_FILE } from './missions/mission5FriendshipRepair';
import { ZEKE_MISSION_6_FILE } from './missions/mission6CourageChallenge';
import { ZEKE_MISSION_7_FILE } from './missions/mission7TeamCaptainTest';
import { ZEKE_MISSION_8_FILE } from './missions/mission8FinalHuddle';

import './missions/mission1NewTable';
import './missions/mission2PassTheBall';
import './missions/mission3GroupProjectGlitch';
import './missions/mission4BraveVoice';
import './missions/mission5FriendshipRepair';
import './missions/mission6CourageChallenge';
import './missions/mission7TeamCaptainTest';
import './missions/mission8FinalHuddle';

export {
  ZEKE_MISSION_1_ID,
  ZEKE_MISSION_1_FILE,
} from './missions/mission1NewTable';
export {
  ZEKE_MISSION_2_ID,
  ZEKE_MISSION_2_FILE,
} from './missions/mission2PassTheBall';
export {
  ZEKE_MISSION_3_ID,
  ZEKE_MISSION_3_FILE,
} from './missions/mission3GroupProjectGlitch';
export {
  ZEKE_MISSION_4_ID,
  ZEKE_MISSION_4_FILE,
} from './missions/mission4BraveVoice';
export {
  ZEKE_MISSION_5_ID,
  ZEKE_MISSION_5_FILE,
} from './missions/mission5FriendshipRepair';
export {
  ZEKE_MISSION_6_ID,
  ZEKE_MISSION_6_FILE,
} from './missions/mission6CourageChallenge';
export {
  ZEKE_MISSION_7_ID,
  ZEKE_MISSION_7_FILE,
} from './missions/mission7TeamCaptainTest';
export {
  ZEKE_MISSION_8_ID,
  ZEKE_MISSION_8_FILE,
} from './missions/mission8FinalHuddle';

export const ZEKE_ADAPTIVE_MISSION_FILES: ZekeAdaptiveMissionFile[] = [
  ZEKE_MISSION_1_FILE,
  ZEKE_MISSION_2_FILE,
  ZEKE_MISSION_3_FILE,
  ZEKE_MISSION_4_FILE,
  ZEKE_MISSION_5_FILE,
  ZEKE_MISSION_6_FILE,
  ZEKE_MISSION_7_FILE,
  ZEKE_MISSION_8_FILE,
];

export const ZEKE_ADAPTIVE_MISSION_IDS = ZEKE_ADAPTIVE_MISSION_FILES.map((mission) => mission.id);

function zekeSkillAreaSlug(skillArea: string): string {
  return skillArea
    .toLowerCase()
    .replace(/\s*\/\s*/g, '-')
    .replace(/\s+/g, '-');
}

for (const mission of ZEKE_ADAPTIVE_MISSION_FILES) {
  registerModuleTracking({
    moduleId: mission.id,
    moduleTitle: mission.subtitle,
    character: 'zeke',
    audience: 'student',
    role: 'student',
    skillArea: zekeSkillAreaSlug(mission.skillArea),
  });
}
