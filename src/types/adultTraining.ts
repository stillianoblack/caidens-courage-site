import type { GameAssessmentConfig } from './gameAssessment';

export type AdultTrainingPortal = 'facilitator' | 'family';

export type AdultTrainingMissionStatus = 'available' | 'locked';

export type AdultTrainingDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type AdultGuideThemeId = 'victoria' | 'uncle-t';

export type AdultGuideTheme = {
  id: AdultGuideThemeId;
  /** CSS modifier for hub shell */
  hubClassName: string;
  /** Game shell classes */
  gameShellClassName: string;
};

export type AdultTrainingMission = {
  id: string;
  number: number;
  title: string;
  description: string;
  skillFocus: string;
  badge: string;
  difficulty: AdultTrainingDifficulty;
  status: AdultTrainingMissionStatus;
};

export type AdultTrainingFutureMission = {
  number: number;
  title: string;
};

export type AdultGuide = {
  id: string;
  name: string;
  portraitSrc: string;
  portraitAlt: string;
  hubTitle: string;
  hubSubtitle: string;
  hubDescription: string;
  progressTrackLabel: string;
  theme: AdultGuideTheme;
  routes: {
    facilitatorHub: string;
    familyHub: string;
    facilitatorSection: string;
    familySection: string;
  };
  missions: AdultTrainingMission[];
  futureMissions: AdultTrainingFutureMission[];
};

export function adultTrainingMissionPath(
  portal: AdultTrainingPortal,
  guide: AdultGuide,
  missionId: string,
): string {
  return portal === 'facilitator'
    ? `${guide.routes.facilitatorHub}/${missionId}`
    : `${guide.routes.familyHub}/${missionId}`;
}

export function countAvailableMissions(guide: AdultGuide): number {
  return guide.missions.filter((mission) => mission.status === 'available').length;
}

export type AdultGuideMissionLookup = {
  guideId: string;
  missionId: string;
  config: GameAssessmentConfig;
};
