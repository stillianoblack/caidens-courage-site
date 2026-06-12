import { CHARLIE_HUB_PATH } from './sharedAssets';
import { getCharlieDashboardDescription } from './charlieAdaptiveBuilder';
import { CHARLIE_ADAPTIVE_MISSION_FILES } from './charlieAdaptiveMissions';

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

export const CHARLIE_HUB_MISSIONS: CharlieHubMission[] = CHARLIE_ADAPTIVE_MISSION_FILES.map(
  (mission) => ({
    id: mission.id,
    number: mission.missionNumber,
    title: mission.subtitle,
    description: getCharlieDashboardDescription(mission, '2-3'),
    skillFocus: mission.skillFocus.join(' · '),
    badge: mission.complete.badges?.[0] ?? 'Science Badge',
    difficulty: 'Adaptive',
    status: 'available',
    route: `${CHARLIE_HUB_PATH}/${mission.id}`,
  }),
);

export { CHARLIE_HUB } from './sharedAssets';
