import { CAIDEN_QUEST_1_ID } from '../data/caiden/questAdaptiveWhatComesFirst';
import { CAIDEN_QUEST_2_ID } from '../data/caiden/questAdaptiveFocusOrDistraction';
import { CAIDEN_QUEST_3_ID } from '../data/caiden/questAdaptiveTimeTracker';
import { CAIDEN_QUEST_4_ID } from '../data/caiden/questAdaptiveResetAndReturn';
import { CAIDEN_QUEST_5_ID } from '../data/caiden/questAdaptiveBuildThePlan';
import { CAIDEN_QUEST_6_ID } from '../data/caiden/questAdaptiveSnackShopChallenge';
import { CAIDEN_QUEST_7_ID } from '../data/caiden/questAdaptiveCampSupplyMission';
import { CAIDEN_QUEST_8_ID } from '../data/caiden/questAdaptiveHomeworkRescuePlan';
import { CAIDEN_QUEST_9_ID } from '../data/caiden/questAdaptiveCampLeaderChallenge';
import {
  MIRANDA_FILE_3_ID,
  MIRANDA_FILE_4_ID,
  MIRANDA_FILE_5_ID,
  MIRANDA_MISSING_CLUE_ID,
  MIRANDA_MISSING_SCHEDULE_ID,
  MIRANDA_MISSING_STUDENT_ID,
} from '../data/miranda';
import { CHARLIE_MISSION_1_ID } from '../data/charlie/missions/mission1MysteryFootprints';
import { CHARLIE_MISSION_2_ID } from '../data/charlie/missions/mission2FloatingOrange';
import { CHARLIE_MISSION_3_ID } from '../data/charlie/missions/mission3MysterySound';
import { CHARLIE_MISSION_4_ID } from '../data/charlie/missions/mission4VolcanoTrouble';
import { CHARLIE_MISSION_5_ID } from '../data/charlie/missions/mission5MissingPlant';
import { CHARLIE_MISSION_6_ID } from '../data/charlie/missions/mission6RobotRescue';
import { CHARLIE_MISSION_7_ID } from '../data/charlie/missions/mission7MarshmallowTower';
import { CHARLIE_MISSION_8_ID } from '../data/charlie/missions/mission8ScienceFairMystery';
import { B4_MISSION_1_ID } from '../data/b4/missions/mission1MoodScanner';
import { B4_MISSION_2_ID } from '../data/b4/missions/mission2BodySignalDetective';
import { B4_MISSION_3_ID } from '../data/b4/missions/mission3BraveChoiceButton';
import { B4_MISSION_4_ID } from '../data/b4/missions/mission4FocusResetStation';
import { B4_MISSION_5_ID } from '../data/b4/missions/mission5CalmDownCountdown';
import { B4_MISSION_6_ID } from '../data/b4/missions/mission6OopsRepairLab';
import { B4_MISSION_7_ID } from '../data/b4/missions/mission7ConfidenceCharger';
import { B4_MISSION_8_ID } from '../data/b4/missions/mission8FocusFlameFinale';
import { ZEKE_MISSION_1_ID } from '../data/zeke/missions/mission1NewTable';
import { ZEKE_MISSION_2_ID } from '../data/zeke/missions/mission2PassTheBall';
import { ZEKE_MISSION_3_ID } from '../data/zeke/missions/mission3GroupProjectGlitch';
import { ZEKE_MISSION_4_ID } from '../data/zeke/missions/mission4BraveVoice';
import { ZEKE_MISSION_5_ID } from '../data/zeke/missions/mission5FriendshipRepair';
import { ZEKE_MISSION_6_ID } from '../data/zeke/missions/mission6CourageChallenge';
import { ZEKE_MISSION_7_ID } from '../data/zeke/missions/mission7TeamCaptainTest';
import { ZEKE_MISSION_8_ID } from '../data/zeke/missions/mission8FinalHuddle';
import type { WeeklyCharacterMissionLists } from './weeklyCharacterMissions';

/** Ordered mission ids per character — index matches adventure week (week 1 → index 0). */
export const WEEKLY_CHARACTER_MISSION_LISTS: WeeklyCharacterMissionLists = {
  caiden: [
    CAIDEN_QUEST_1_ID,
    CAIDEN_QUEST_2_ID,
    CAIDEN_QUEST_3_ID,
    CAIDEN_QUEST_4_ID,
    CAIDEN_QUEST_5_ID,
    CAIDEN_QUEST_6_ID,
    CAIDEN_QUEST_7_ID,
    CAIDEN_QUEST_8_ID,
    CAIDEN_QUEST_9_ID,
  ],
  miranda: [
    MIRANDA_MISSING_SCHEDULE_ID,
    MIRANDA_MISSING_STUDENT_ID,
    MIRANDA_MISSING_CLUE_ID,
    MIRANDA_FILE_3_ID,
    MIRANDA_FILE_4_ID,
    MIRANDA_FILE_5_ID,
  ],
  b4: [
    B4_MISSION_1_ID,
    B4_MISSION_2_ID,
    B4_MISSION_3_ID,
    B4_MISSION_4_ID,
    B4_MISSION_5_ID,
    B4_MISSION_6_ID,
    B4_MISSION_7_ID,
    B4_MISSION_8_ID,
  ],
  charlie: [
    CHARLIE_MISSION_1_ID,
    CHARLIE_MISSION_2_ID,
    CHARLIE_MISSION_3_ID,
    CHARLIE_MISSION_4_ID,
    CHARLIE_MISSION_5_ID,
    CHARLIE_MISSION_6_ID,
    CHARLIE_MISSION_7_ID,
    CHARLIE_MISSION_8_ID,
  ],
  zeke: [
    ZEKE_MISSION_1_ID,
    ZEKE_MISSION_2_ID,
    ZEKE_MISSION_3_ID,
    ZEKE_MISSION_4_ID,
    ZEKE_MISSION_5_ID,
    ZEKE_MISSION_6_ID,
    ZEKE_MISSION_7_ID,
    ZEKE_MISSION_8_ID,
  ],
};
