import { CHARLIE_MISSION_1_ID } from './charlieMission1';
import { CHARLIE_MISSION_2_ID } from './charlieMission2';
import { CHARLIE_HUB, CHARLIE_HUB_PATH } from './sharedAssets';

export type CharlieHubMission = {
  id: string;
  number: number;
  title: string;
  description: string;
  skillFocus: string;
  badge: string;
  difficulty: string;
  status: 'available' | 'locked';
  route: string;
};

export const CHARLIE_HUB_MISSIONS: CharlieHubMission[] = [
  {
    id: CHARLIE_MISSION_1_ID,
    number: 1,
    title: 'Turtle Trail Trouble',
    description: 'Make safe, curious choices when wildlife and camp trails cross paths.',
    skillFocus: 'Nature awareness + SEL choices',
    badge: 'Nature Buddy Badge',
    difficulty: 'Beginner',
    status: 'available',
    route: `${CHARLIE_HUB_PATH}/${CHARLIE_MISSION_1_ID}`,
  },
  {
    id: CHARLIE_MISSION_2_ID,
    number: 2,
    title: 'Camp Critter Clues',
    description: 'Follow animal signs, learn nature facts, and make brave outdoor choices.',
    skillFocus: 'Observation + animal facts + brave choices',
    badge: 'Critter Clue Badge',
    difficulty: 'Beginner',
    status: 'available',
    route: `${CHARLIE_HUB_PATH}/${CHARLIE_MISSION_2_ID}`,
  },
];

export { CHARLIE_HUB };
