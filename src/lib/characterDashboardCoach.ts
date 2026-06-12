import type { MissionCoachCardProps, MissionCoachStepStatus } from '../design-system/components/MissionCoachCard';
import type { AdultGuide, AdultTrainingPortal } from '../types/adultTraining';
import { adultTrainingMissionPath } from '../types/adultTraining';
import { B4_GAME_AVATAR_SRC } from '../data/b4/portalAssets';
import { getPortalRoute } from './portalGamePaths';

export type CharacterDashboardCoachId = 'caiden' | 'miranda' | 'charlie' | 'zeke' | 'b4';

export type AdultDashboardCoachGuideId = 'dr-victoria' | 'uncle-t';

export type BuildCharacterDashboardCoachInput = {
  characterId: CharacterDashboardCoachId;
  pathname: string;
  completedCount: number;
  totalCount: number;
  progressPercent: number;
  firstQuestHref?: string;
  nextQuestHref?: string;
};

const B4_COACH_AVATAR = B4_GAME_AVATAR_SRC;

function resolveStepStatus(
  complete: boolean,
  current: boolean,
  locked = false,
): MissionCoachStepStatus {
  if (complete) return 'complete';
  if (locked) return 'locked';
  if (current) return 'current';
  return 'incomplete';
}

export function buildCharacterDashboardCoach(
  input: BuildCharacterDashboardCoachInput,
): Pick<
  MissionCoachCardProps,
  'title' | 'subtitle' | 'avatarImage' | 'avatarAlt' | 'progressLabel' | 'progressPercent' | 'steps'
> {
  const continuePath = getPortalRoute('continue-learning', input.pathname);
  const base = {
    title: 'B-4 Mission Coach',
    avatarImage: B4_COACH_AVATAR,
    avatarAlt: 'B-4',
    progressPercent: input.progressPercent,
  };

  switch (input.characterId) {
    case 'caiden': {
      const started = input.completedCount > 0;
      const threeComplete = input.completedCount >= 3;
      return {
        ...base,
        subtitle: 'Keep your Focus Flame moving.',
        progressLabel: 'Focus Flame Journey',
        steps: [
          {
            id: 'start-q1',
            label: 'Start Quest 1',
            status: resolveStepStatus(started, !started),
            href: input.firstQuestHref,
          },
          {
            id: 'complete-3',
            label: 'Complete 3 Focus Quests',
            status: resolveStepStatus(threeComplete, started && !threeComplete, !started),
          },
          {
            id: 'review',
            label: 'Review your progress',
            status: resolveStepStatus(threeComplete, started && !threeComplete, !started),
          },
          {
            id: 'weekly',
            label: 'Continue Weekly Adventures',
            status: resolveStepStatus(false, threeComplete, !threeComplete),
            href: threeComplete ? continuePath : undefined,
          },
        ],
      };
    }

    case 'miranda': {
      const started = input.completedCount > 0;
      const firstComplete = input.completedCount >= 1;
      return {
        ...base,
        subtitle: 'Keep your detective notebook ready.',
        progressLabel: 'Mystery Files',
        steps: [
          {
            id: 'start-file-1',
            label: 'Start File 1',
            status: resolveStepStatus(started, !started),
            href: input.firstQuestHref,
          },
          {
            id: 'solve-first',
            label: 'Solve the first mystery',
            status: resolveStepStatus(firstComplete, started && !firstComplete, !started),
            href: input.nextQuestHref ?? input.firstQuestHref,
          },
          {
            id: 'reading-confidence',
            label: 'Build reading confidence',
            status: resolveStepStatus(
              input.completedCount >= 2,
              firstComplete && input.completedCount < 2,
              !firstComplete,
            ),
          },
          {
            id: 'weekly',
            label: 'Continue Weekly Adventures',
            status: resolveStepStatus(false, input.completedCount >= 2, input.completedCount < 2),
            href: input.completedCount >= 2 ? continuePath : undefined,
          },
        ],
      };
    }

    case 'charlie': {
      const started = input.completedCount > 0;
      return {
        ...base,
        subtitle: 'Explore nature one mission at a time.',
        progressLabel: 'Science Lab',
        steps: [
          {
            id: 'start-m1',
            label: 'Start Mission 1',
            status: resolveStepStatus(started, !started),
            href: input.firstQuestHref,
          },
          {
            id: 'nature-skills',
            label: 'Practice nature skills',
            status: resolveStepStatus(input.completedCount >= 1, started && input.completedCount < 1, !started),
            href: input.nextQuestHref ?? input.firstQuestHref,
          },
          {
            id: 'camp-safety',
            label: 'Learn camp safety moves',
            status: resolveStepStatus(input.completedCount >= 2, input.completedCount === 1, input.completedCount < 1),
          },
          {
            id: 'weekly',
            label: 'Continue Weekly Adventures',
            status: resolveStepStatus(false, input.completedCount >= 1, input.completedCount < 1),
            href: input.completedCount >= 1 ? continuePath : undefined,
          },
        ],
      };
    }

    case 'b4': {
      const started = input.completedCount > 0;
      return {
        ...base,
        subtitle: 'Build focus habits with B-4.',
        progressLabel: 'B-4 Missions',
        steps: [
          {
            id: 'check-in',
            label: 'Complete B-4 Check-In',
            status: resolveStepStatus(started, !started),
            href: input.firstQuestHref,
          },
          {
            id: 'focus-moves',
            label: 'Practice focus moves',
            status: resolveStepStatus(input.completedCount >= 1, started && input.completedCount < 1, !started),
            href: input.nextQuestHref ?? input.firstQuestHref,
          },
          {
            id: 'feelings',
            label: 'Name feelings bravely',
            status: resolveStepStatus(input.completedCount >= 2, input.completedCount === 1, input.completedCount < 1),
          },
          {
            id: 'weekly',
            label: 'Continue Weekly Adventures',
            status: resolveStepStatus(false, input.completedCount >= 1, input.completedCount < 1),
            href: input.completedCount >= 1 ? continuePath : undefined,
          },
        ],
      };
    }

    case 'zeke': {
      const total = input.totalCount || 8;
      const completed = input.completedCount;
      return {
        ...base,
        subtitle:
          completed >= total && total > 0
            ? 'All team quests complete!'
            : completed > 0
              ? `${completed} of ${total} team quests complete`
              : 'Start with Mission 1: The New Table',
        progressLabel: 'Team Quest',
        progressPercent: input.progressPercent,
        steps: [
          {
            id: 'first',
            label: 'Start Mission 1',
            status: resolveStepStatus(completed >= 1, completed < 1, false),
            href: input.firstQuestHref,
          },
          {
            id: 'continue',
            label: 'Continue Team Quest',
            status: resolveStepStatus(completed >= total, completed > 0 && completed < total, completed < 1),
            href: input.nextQuestHref,
          },
        ],
      };
    }
    default:
      return {
        ...base,
        subtitle: 'Character adventures',
        progressLabel: 'Missions',
        steps: [],
      };
  }
}

export type BuildAdultLearningDashboardCoachInput = {
  guide: AdultGuide;
  portal: AdultTrainingPortal;
  pathname: string;
  completedMissionIds: string[];
};

export function buildAdultLearningDashboardCoach(
  input: BuildAdultLearningDashboardCoachInput,
): Pick<
  MissionCoachCardProps,
  'title' | 'subtitle' | 'avatarImage' | 'avatarAlt' | 'progressLabel' | 'progressPercent' | 'steps'
> {
  const { guide, portal, completedMissionIds } = input;
  const availableMissions = guide.missions.filter((mission) => mission.status === 'available');
  const completedCount = availableMissions.filter((mission) =>
    completedMissionIds.includes(mission.id),
  ).length;
  const totalCount = availableMissions.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const started = completedCount > 0;
  const allComplete = totalCount > 0 && completedCount >= totalCount;
  const midTarget = guide.id === 'dr-victoria' ? 3 : 2;
  const midComplete = completedCount >= midTarget;

  const firstMission = availableMissions[0];
  const nextIncomplete = availableMissions.find((mission) => !completedMissionIds.includes(mission.id));
  const sectionPath =
    portal === 'family' ? guide.routes.familySection : guide.routes.facilitatorSection;

  const firstMissionHref = firstMission
    ? adultTrainingMissionPath(portal, guide, firstMission.id)
    : undefined;
  const nextMissionHref = nextIncomplete
    ? adultTrainingMissionPath(portal, guide, nextIncomplete.id)
    : firstMissionHref;

  const subtitle =
    guide.id === 'dr-victoria'
      ? 'Understand behavior with empathy and support.'
      : 'Build courage and confidence through coaching.';

  return {
    title: guide.name,
    subtitle,
    avatarImage: guide.portraitSrc,
    avatarAlt: guide.portraitAlt,
    progressLabel: guide.progressTrackLabel,
    progressPercent,
    steps: [
      {
        id: 'start-m1',
        label: 'Start Mission 1',
        status: resolveStepStatus(started, !started),
        href: firstMissionHref,
      },
      {
        id: 'mid-track',
        label:
          guide.id === 'dr-victoria'
            ? 'Complete 3 training missions'
            : 'Complete 2 coaching missions',
        status: resolveStepStatus(midComplete, started && !midComplete, !started),
        href: nextMissionHref,
      },
      {
        id: 'finish-track',
        label: 'Complete the learning track',
        status: resolveStepStatus(allComplete, started && !allComplete, !started),
        href: allComplete ? undefined : nextMissionHref,
      },
      {
        id: 'return-hub',
        label: portal === 'family' ? 'Continue Parent Corner' : 'Continue Adult Training',
        status: resolveStepStatus(false, allComplete, !allComplete),
        href: allComplete ? sectionPath : undefined,
      },
    ],
  };
}
