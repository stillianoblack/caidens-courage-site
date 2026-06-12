import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import CharacterAdventureCard from '../family-portal/CharacterAdventureCard';
import { CharacterDashboardLayout, QuestGrid } from '../../design-system/character-dashboard';
import { buildPortalReturnState, formatBackLabel } from '../../lib/portalBreadcrumbNav';
import { buildCharacterDashboardCoach } from '../../lib/characterDashboardCoach';
import { useCharacterModuleProgress } from '../../hooks/useCharacterModuleProgress';
import { applyMissionBoardProgress } from '../../lib/characterProgressService';
import { remapPortalKidsRoute } from '../../lib/portalGamePaths';
import { ZEKE_AVATAR_SRC, ZEKE_HUB } from '../../data/zeke';
import { buildZekeMissionBoardItems } from '../../data/zeke/missionBoardData';
import { useZekeGradeBand } from '../../hooks/useZekeGradeBand';
import '../../design-system/character-dashboard/character-dashboard.css';
import '../family-portal/family-dashboard.css';

export default function ZekeQuestHub() {
  const location = useLocation();
  const { progress } = useCharacterModuleProgress('zeke');
  const { band: gradeBand } = useZekeGradeBand();

  const missions = useMemo(
    () =>
      applyMissionBoardProgress(buildZekeMissionBoardItems(gradeBand), progress.completedModuleIds).map(
        (mission) => ({
          ...mission,
          route: remapPortalKidsRoute(mission.route, location.pathname),
        }),
      ),
    [gradeBand, location.pathname, progress.completedModuleIds],
  );

  const questReturnState = buildPortalReturnState(
    location.pathname,
    formatBackLabel("Zeke's Team Quest"),
  );

  const firstMission = missions.find(
    (mission) => mission.status === 'active' || mission.status === 'available',
  );

  const coach = buildCharacterDashboardCoach({
    characterId: 'zeke',
    pathname: location.pathname,
    completedCount: progress.completedCount,
    totalCount: progress.totalCount || missions.length,
    progressPercent: progress.percent,
    firstQuestHref: firstMission?.route,
    nextQuestHref: firstMission?.route,
  });

  return (
    <CharacterDashboardLayout
      characterId="zeke"
      theme="zeke"
      hero={{
        imageSrc: ZEKE_AVATAR_SRC,
        imageAlt: 'Zeke',
        name: 'Zeke',
        subtitle: ZEKE_HUB.subtitle,
        description: ZEKE_HUB.intro,
        availableCountLabel: `${missions.length} Team Quests Available`,
        theme: 'zeke',
      }}
      coach={coach}
      quests={
        <QuestGrid aria-label="Team quests">
          {missions.map((mission) => (
            <CharacterAdventureCard
              key={mission.id}
              characterId="zeke"
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
