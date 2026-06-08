import {
  FACILITATOR_DR_VICTORIA_MISSION_BASE,
  FACILITATOR_PORTAL_PATH,
  FAMILY_DR_VICTORIA_MISSION_BASE,
  FAMILY_PORTAL_PATH,
} from '../../config/courageRoutes';
import type { AdultGuide } from '../../types/adultTraining';
import { DR_VICTORIA_GUIDE_SRC } from './sharedAssets';
import { DR_VICTORIA_MISSION_1_ID } from './drVictoriaMission1';
import { DR_VICTORIA_MISSION_2_ID } from './drVictoriaMission2';
import { DR_VICTORIA_MISSION_3_ID } from './drVictoriaMission3';
import { DR_VICTORIA_MISSION_4_ID } from './drVictoriaMission4';
import { DR_VICTORIA_MISSION_5_ID } from './drVictoriaMission5';

export const DR_VICTORIA_GUIDE_ID = 'dr-victoria';

export const DR_VICTORIA_LEARNING_HUB: AdultGuide = {
  id: DR_VICTORIA_GUIDE_ID,
  name: 'Dr. Victoria',
  portraitSrc: DR_VICTORIA_GUIDE_SRC,
  portraitAlt: 'Dr. Victoria',
  hubTitle: 'Dr. Victoria Learning Hub',
  hubSubtitle: 'Training missions for parents, teachers, counselors, and camp staff.',
  hubDescription:
    'Learn how to understand behavior, respond with support, and create focus-friendly environments for different minds.',
  progressTrackLabel: 'Adult Learning Track',
  theme: {
    id: 'victoria',
    hubClassName: 'victoria',
    gameShellClassName: 'victoria-game',
  },
  routes: {
    facilitatorHub: FACILITATOR_DR_VICTORIA_MISSION_BASE,
    familyHub: FAMILY_DR_VICTORIA_MISSION_BASE,
    facilitatorSection: `${FACILITATOR_PORTAL_PATH}#facilitator-center`,
    familySection: `${FAMILY_PORTAL_PATH}/guide`,
  },
  missions: [
    {
      id: DR_VICTORIA_MISSION_1_ID,
      number: 1,
      title: 'Looking Beyond the Behavior',
      description:
        'Practice seeing behavior as communication and looking for what a child may need.',
      skillFocus: 'Understanding behavior',
      badge: 'Understanding Guide Badge',
      difficulty: 'Beginner',
      status: 'available',
    },
    {
      id: DR_VICTORIA_MISSION_2_ID,
      number: 2,
      title: 'Responding with Support',
      description:
        'Practice calm, helpful responses when children feel overwhelmed, distracted, frustrated, or stuck.',
      skillFocus: 'Supportive response',
      badge: 'Supportive Response Badge',
      difficulty: 'Beginner',
      status: 'available',
    },
    {
      id: DR_VICTORIA_MISSION_3_ID,
      number: 3,
      title: 'Building Focus-Friendly Environments',
      description:
        'Create routines, spaces, and systems that help children start, focus, and follow through.',
      skillFocus: 'Executive function support',
      badge: 'Focus Builder Badge',
      difficulty: 'Intermediate',
      status: 'available',
    },
    {
      id: DR_VICTORIA_MISSION_4_ID,
      number: 4,
      title: 'Helping Children Through Big Feelings',
      description:
        'Practice supporting children through frustration, anxiety, shutdown, and emotional overwhelm.',
      skillFocus: 'Emotional regulation + adult response',
      badge: 'Calm Support Badge',
      difficulty: 'Advanced',
      status: 'available',
    },
    {
      id: DR_VICTORIA_MISSION_5_ID,
      number: 5,
      title: 'Supporting Different Learning Styles',
      description:
        'Practice matching supports to visual, movement, auditory, and processing differences.',
      skillFocus: 'Flexible supports + learning access',
      badge: 'Learning Styles Guide Badge',
      difficulty: 'Advanced',
      status: 'available',
    },
  ],
  futureMissions: [
    { number: 6, title: 'Encouraging Confidence and Growth' },
    { number: 7, title: 'Coaching Through Mistakes' },
    { number: 8, title: 'Leading Brave Conversations' },
  ],
};
