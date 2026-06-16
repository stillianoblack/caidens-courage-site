import {
  FACILITATOR_PORTAL_PATH,
  FACILITATOR_UNCLE_T_MISSION_BASE,
  FAMILY_HUB_PATH,
  FAMILY_UNCLE_T_MISSION_BASE,
} from '../../config/courageRoutes';
import type { AdultGuide } from '../../types/adultTraining';
import { UNCLE_T_GUIDE_SRC } from './sharedAssets';
import { UNCLE_T_MISSION_1_ID } from './uncleTMission1';
import { UNCLE_T_MISSION_2_ID } from './uncleTMission2';
import { UNCLE_T_MISSION_3_ID } from './uncleTMission3';

export const UNCLE_T_GUIDE_ID = 'uncle-t';

export const UNCLE_T_COACHING_HUB: AdultGuide = {
  id: UNCLE_T_GUIDE_ID,
  name: 'Uncle T',
  portraitSrc: UNCLE_T_GUIDE_SRC,
  portraitAlt: 'Uncle T',
  hubTitle: 'Uncle T Coaching Hub',
  hubSubtitle:
    'Coaching moments for helping kids build courage, confidence, and follow-through.',
  hubDescription:
    'Practice encouraging kids through mistakes, pressure, frustration, and brave choices.',
  progressTrackLabel: 'Adult Learning Track',
  theme: {
    id: 'uncle-t',
    hubClassName: 'uncle-t',
    gameShellClassName: 'uncle-t-game',
  },
  routes: {
    facilitatorHub: FACILITATOR_UNCLE_T_MISSION_BASE,
    familyHub: FAMILY_UNCLE_T_MISSION_BASE,
    facilitatorSection: `${FACILITATOR_PORTAL_PATH}#facilitator-center`,
    familySection: `${FAMILY_HUB_PATH}/guide`,
  },
  missions: [
    {
      id: UNCLE_T_MISSION_1_ID,
      number: 1,
      title: 'Coaching Through Mistakes',
      description:
        'Practice what to say when kids mess up, shut down, or feel embarrassed.',
      skillFocus: 'Encouragement + resilience',
      badge: 'Courage Coach Badge',
      difficulty: 'Beginner',
      status: 'available',
    },
    {
      id: UNCLE_T_MISSION_2_ID,
      number: 2,
      title: 'Building Confidence',
      description:
        'Practice helping kids believe they can try, improve, and keep going.',
      skillFocus: 'Confidence + encouragement',
      badge: 'Confidence Builder Badge',
      difficulty: 'Intermediate',
      status: 'available',
    },
    {
      id: UNCLE_T_MISSION_3_ID,
      number: 3,
      title: 'Helping Kids Keep Going',
      description:
        'Practice coaching persistence, resets, and brave tries when kids want to quit.',
      skillFocus: 'Persistence + encouragement',
      badge: 'Keep Going Coach Badge',
      difficulty: 'Intermediate',
      status: 'available',
    },
  ],
  futureMissions: [
    { number: 4, title: 'Turning Pressure Into Courage' },
    { number: 5, title: 'Encouraging Brave Choices' },
  ],
};
