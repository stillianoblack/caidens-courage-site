import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import CharacterAdventureCard from '../family-portal/CharacterAdventureCard';
import { CharacterDashboardLayout, QuestGrid } from '../../design-system/character-dashboard';
import { buildPortalReturnState, formatBackLabel } from '../../lib/portalBreadcrumbNav';
import { buildCharacterDashboardCoach } from '../../lib/characterDashboardCoach';
import { useCharacterModuleProgress } from '../../hooks/useCharacterModuleProgress';
import { applyMissionBoardProgress } from '../../lib/characterProgressService';
import { remapPortalKidsRoute } from '../../lib/portalGamePaths';
import { MIRANDA_HUB, MIRANDA_AVATAR_SRC } from '../../data/miranda';
import { buildMirandaMissionBoardItems } from '../../data/miranda/missionBoardData';
import { useMirandaGradeBand } from '../../hooks/useMirandaGradeBand';
import '../../design-system/character-dashboard/character-dashboard.css';
import '../family-portal/family-dashboard.css';

type MirandaMysteryFilesHubProps = {
  portalInset?: boolean;
};

export default function MirandaMysteryFilesHub({
  portalInset = true,
}: MirandaMysteryFilesHubProps) {
  const location = useLocation();
  const { progress } = useCharacterModuleProgress('miranda');
  const { band: gradeBand } = useMirandaGradeBand();

  const missions = useMemo(
    () =>
      applyMissionBoardProgress(buildMirandaMissionBoardItems(gradeBand), progress.completedModuleIds).map(
        (mission) => ({
          ...mission,
          route: remapPortalKidsRoute(mission.route, location.pathname),
        }),
      ),
    [gradeBand, location.pathname, progress.completedModuleIds],
  );

  const availableMissions = missions.filter((mission) => mission.status !== 'locked');
  const questReturnState = buildPortalReturnState(
    location.pathname,
    formatBackLabel('Mystery Files'),
  );

  const firstAvailable = missions.find((mission) => mission.status !== 'locked');
  const nextAvailable = missions.find(
    (mission) => mission.status === 'active' || mission.status === 'available',
  );

  const coach = buildCharacterDashboardCoach({
    characterId: 'miranda',
    pathname: location.pathname,
    completedCount: progress.completedCount,
    totalCount: progress.totalCount || missions.length,
    progressPercent: progress.percent,
    firstQuestHref: firstAvailable?.route,
    nextQuestHref: nextAvailable?.route,
  });

  return (
    <CharacterDashboardLayout
      characterId="miranda"
      theme="miranda"
      portalInset={portalInset}
      hero={{
        imageSrc: MIRANDA_AVATAR_SRC,
        imageAlt: 'Miranda',
        name: 'Miranda',
        subtitle: MIRANDA_HUB.subtitle,
        description: 'Open a case, read the clues, and solve each mystery one file at a time.',
        availableCountLabel: `${availableMissions.length} Mystery Files Available`,
        theme: 'miranda',
      }}
      coach={coach}
      quests={
        <QuestGrid aria-label="Investigation cases">
            {missions.map((mission) => (
              <CharacterAdventureCard
                key={mission.id}
                characterId="miranda"
                title={`File #${mission.fileNumber}: ${mission.title}`}
                description={mission.description}
                cta={mission.status === 'locked' ? 'Coming Next' : 'Open Case'}
                href={mission.status === 'locked' ? '#' : mission.route}
                useCharacterHubLaunch={mission.status !== 'locked'}
                linkState={mission.status === 'locked' ? undefined : questReturnState}
                status={
                  mission.status === 'completed'
                    ? 'Complete'
                    : mission.status === 'locked'
                      ? 'Locked'
                      : 'Available'
                }
                locked={mission.status === 'locked'}
                lockedLabel="Coming Next"
                skillTags={mission.skills?.slice(0, 3).join(' · ')}
                layout="horizontal"
              />
            ))}
        </QuestGrid>
      }
    />
  );
}
