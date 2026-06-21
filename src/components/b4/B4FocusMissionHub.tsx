import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import CharacterAdventureCard from '../family-portal/CharacterAdventureCard';
import { CharacterDashboardLayout, QuestGrid } from '../../design-system/character-dashboard';
import { buildPortalReturnState, formatBackLabel } from '../../lib/portalBreadcrumbNav';
import { buildCharacterDashboardCoach } from '../../lib/characterDashboardCoach';
import { useCharacterModuleProgress } from '../../hooks/useCharacterModuleProgress';
import { useBaselineGate } from '../../hooks/useBaselineGate';
import { applyMissionBoardProgress } from '../../lib/characterProgressService';
import {
  B4_MOOD_SCANNER_MISSION_ID,
  isB4MissionLockedUntilBaselineComplete,
} from '../../lib/baselineCheckInMission';
import { remapPortalKidsRoute } from '../../lib/portalGamePaths';
import { B4_GAME_AVATAR_SRC, B4_HUB, B4_HUB_PATH } from '../../data/b4';
import { buildB4MissionBoardItems } from '../../data/b4/missionBoardData';
import { useB4GradeBand } from '../../hooks/useB4GradeBand';
import '../../design-system/character-dashboard/character-dashboard.css';
import '../family-portal/family-dashboard.css';

export default function B4FocusMissionHub() {
  const location = useLocation();
  const { progress } = useCharacterModuleProgress('b4');
  const { band: gradeBand } = useB4GradeBand();
  const { complete: baselineComplete } = useBaselineGate();

  const missions = useMemo(
    () =>
      applyMissionBoardProgress(buildB4MissionBoardItems(gradeBand), progress.completedModuleIds)
        .map((mission) => ({
          ...mission,
          route: remapPortalKidsRoute(mission.route, location.pathname),
          status: isB4MissionLockedUntilBaselineComplete(mission.id, baselineComplete)
            ? ('locked' as const)
            : mission.status,
        })),
    [baselineComplete, gradeBand, location.pathname, progress.completedModuleIds],
  );

  const questReturnState = buildPortalReturnState(
    location.pathname,
    formatBackLabel('B-4 Missions'),
  );

  const checkInHref = useMemo(
    () => remapPortalKidsRoute(`${B4_HUB_PATH}/check-in`, location.pathname),
    [location.pathname],
  );

  const firstMission = baselineComplete
    ? missions.find((mission) => mission.status === 'active' || mission.status === 'available')
    : null;

  const coach = buildCharacterDashboardCoach({
    characterId: 'b4',
    pathname: location.pathname,
    completedCount: progress.completedCount,
    totalCount: progress.totalCount || missions.length,
    progressPercent: progress.percent,
    firstQuestHref: baselineComplete ? firstMission?.route : checkInHref,
    nextQuestHref: baselineComplete ? firstMission?.route : checkInHref,
  });

  const moodScannerLocked = isB4MissionLockedUntilBaselineComplete(
    B4_MOOD_SCANNER_MISSION_ID,
    baselineComplete,
  );

  return (
    <CharacterDashboardLayout
      characterId="b4"
      theme="b4"
      hero={{
        imageSrc: B4_GAME_AVATAR_SRC,
        imageAlt: 'B-4',
        name: 'B-4',
        subtitle: baselineComplete ? B4_HUB.subtitle : 'Start with your B-4 Check-In',
        description: baselineComplete
          ? B4_HUB.intro
          : 'Complete your B-4 Check-In first. Weekly missions unlock after your baseline is saved.',
        availableCountLabel: baselineComplete
          ? `${missions.length} SEL Missions Available`
          : 'B-4 Check-In required first',
        theme: 'b4',
      }}
      coach={coach}
      quests={
        <QuestGrid aria-label="B-4 SEL missions">
          <CharacterAdventureCard
            characterId="b4"
            title="Start My B-4 Check-In"
            description="Answer a few questions so B-4 can learn how you focus. This baseline check-in unlocks weekly adventures."
            cta="Start Check-In"
            href={checkInHref}
            linkState={questReturnState}
            status={baselineComplete ? 'Complete' : 'Available'}
            skillTags="Baseline · Profile"
            layout="horizontal"
          />
          {missions.map((mission) => (
            <CharacterAdventureCard
              key={mission.id}
              characterId="b4"
              title={`Mission ${mission.fileNumber}: ${mission.title}`}
              description={
                mission.id === B4_MOOD_SCANNER_MISSION_ID && moodScannerLocked
                  ? 'Complete your B-4 Check-In first to unlock Mood Scanner.'
                  : mission.description
              }
              cta={mission.status === 'locked' ? 'Locked' : 'Start Mission'}
              href={mission.status === 'locked' ? '#' : mission.route}
              useCharacterHubLaunch={mission.status !== 'locked'}
              linkState={mission.status === 'locked' ? undefined : questReturnState}
              status={mission.status === 'locked' ? 'Locked' : 'Available'}
              locked={mission.status === 'locked'}
              lockedLabel={
                mission.id === B4_MOOD_SCANNER_MISSION_ID && moodScannerLocked
                  ? 'Complete B-4 Check-In first'
                  : mission.status === 'locked'
                    ? 'Coming Next'
                    : undefined
              }
              skillTags={mission.skills?.slice(0, 3).join(' · ')}
              layout="horizontal"
            />
          ))}
        </QuestGrid>
      }
    />
  );
}
