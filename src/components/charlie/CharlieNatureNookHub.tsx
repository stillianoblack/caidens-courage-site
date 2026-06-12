import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import CharacterAdventureCard from '../family-portal/CharacterAdventureCard';
import { CharacterDashboardLayout, QuestGrid } from '../../design-system/character-dashboard';
import { buildPortalReturnState, formatBackLabel } from '../../lib/portalBreadcrumbNav';
import { buildCharacterDashboardCoach } from '../../lib/characterDashboardCoach';
import { useCharacterModuleProgress } from '../../hooks/useCharacterModuleProgress';
import { applyMissionBoardProgress } from '../../lib/characterProgressService';
import { remapPortalKidsRoute } from '../../lib/portalGamePaths';
import { CHARLIE_AVATAR_SRC, CHARLIE_HUB } from '../../data/charlie';
import { buildCharlieMissionBoardItems } from '../../data/charlie/missionBoardData';
import { useCharlieGradeBand } from '../../hooks/useCharlieGradeBand';
import '../../design-system/character-dashboard/character-dashboard.css';
import '../family-portal/family-dashboard.css';

export default function CharlieNatureNookHub() {
  const location = useLocation();
  const { progress } = useCharacterModuleProgress('charlie');
  const { band: gradeBand } = useCharlieGradeBand();

  const missions = useMemo(
    () =>
      applyMissionBoardProgress(buildCharlieMissionBoardItems(gradeBand), progress.completedModuleIds).map(
        (mission) => ({
          ...mission,
          route: remapPortalKidsRoute(mission.route, location.pathname),
        }),
      ),
    [gradeBand, location.pathname, progress.completedModuleIds],
  );

  const questReturnState = buildPortalReturnState(
    location.pathname,
    formatBackLabel("Charlie's Science Lab"),
  );

  const firstMission = missions.find((mission) => mission.status === 'active' || mission.status === 'available');

  const coach = buildCharacterDashboardCoach({
    characterId: 'charlie',
    pathname: location.pathname,
    completedCount: progress.completedCount,
    totalCount: progress.totalCount || missions.length,
    progressPercent: progress.percent,
    firstQuestHref: firstMission?.route,
    nextQuestHref: firstMission?.route,
  });

  return (
    <CharacterDashboardLayout
      characterId="charlie"
      theme="charlie"
      hero={{
        imageSrc: CHARLIE_AVATAR_SRC,
        imageAlt: 'Charlie Perk',
        name: 'Charlie Perk',
        subtitle: CHARLIE_HUB.subtitle,
        description: CHARLIE_HUB.intro,
        availableCountLabel: `${missions.length} Science Missions Available`,
        theme: 'charlie',
      }}
      coach={coach}
      quests={
        <QuestGrid aria-label="Science missions">
          {missions.map((mission) => (
            <CharacterAdventureCard
              key={mission.id}
              characterId="charlie"
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
        </QuestGrid>
      }
    />
  );
}
