import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import CharacterAdventureCard from '../family-portal/CharacterAdventureCard';
import { CharacterDashboardLayout, QuestGrid } from '../../design-system/character-dashboard';
import { buildPortalReturnState, formatBackLabel } from '../../lib/portalBreadcrumbNav';
import { buildCharacterDashboardCoach } from '../../lib/characterDashboardCoach';
import { useCharacterModuleProgress } from '../../hooks/useCharacterModuleProgress';
import { applyMissionBoardProgress } from '../../lib/characterProgressService';
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

  const missions = useMemo(
    () =>
      applyMissionBoardProgress(buildB4MissionBoardItems(gradeBand), progress.completedModuleIds).map(
        (mission) => ({
          ...mission,
          route: remapPortalKidsRoute(mission.route, location.pathname),
        }),
      ),
    [gradeBand, location.pathname, progress.completedModuleIds],
  );

  const questReturnState = buildPortalReturnState(
    location.pathname,
    formatBackLabel('B-4 Missions'),
  );

  const checkInHref = useMemo(
    () => remapPortalKidsRoute(`${B4_HUB_PATH}/check-in`, location.pathname),
    [location.pathname],
  );

  const firstMission = missions.find(
    (mission) => mission.status === 'active' || mission.status === 'available',
  );

  const coach = buildCharacterDashboardCoach({
    characterId: 'b4',
    pathname: location.pathname,
    completedCount: progress.completedCount,
    totalCount: progress.totalCount || missions.length,
    progressPercent: progress.percent,
    firstQuestHref: firstMission?.route,
    nextQuestHref: firstMission?.route,
  });

  return (
    <CharacterDashboardLayout
      characterId="b4"
      theme="b4"
      hero={{
        imageSrc: B4_GAME_AVATAR_SRC,
        imageAlt: 'B-4',
        name: 'B-4',
        subtitle: B4_HUB.subtitle,
        description: B4_HUB.intro,
        availableCountLabel: `${missions.length} SEL Missions Available`,
        theme: 'b4',
      }}
      coach={coach}
      quests={
        <QuestGrid aria-label="B-4 SEL missions">
          {missions.map((mission) => (
            <CharacterAdventureCard
              key={mission.id}
              characterId="b4"
              title={`Mission ${mission.fileNumber}: ${mission.title}`}
              description={mission.description}
              cta={mission.status === 'locked' ? 'Coming Next' : 'Start Mission'}
              href={mission.status === 'locked' ? '#' : mission.route}
              useCharacterHubLaunch={mission.status !== 'locked'}
              linkState={mission.status === 'locked' ? undefined : questReturnState}
              status={mission.status === 'locked' ? 'Locked' : 'Available'}
              locked={mission.status === 'locked'}
              lockedLabel={mission.status === 'locked' ? 'Coming Next' : undefined}
              skillTags={mission.skills?.slice(0, 3).join(' · ')}
              layout="horizontal"
            />
          ))}
          <CharacterAdventureCard
            characterId="b4"
            title="Start My B-4 Check-In"
            description="Answer a few questions so B-4 can learn how you focus. This baseline check-in is separate from mission progress."
            cta="Start Check-In"
            href={checkInHref}
            linkState={questReturnState}
            status="Available"
            skillTags="Baseline · Profile"
            layout="horizontal"
          />
        </QuestGrid>
      }
    />
  );
}
