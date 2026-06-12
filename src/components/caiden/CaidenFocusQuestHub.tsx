import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import CharacterAdventureCard from '../family-portal/CharacterAdventureCard';
import { CharacterDashboardLayout, QuestGrid } from '../../design-system/character-dashboard';
import { buildPortalReturnState, formatBackLabel } from '../../lib/portalBreadcrumbNav';
import { buildCharacterDashboardCoach } from '../../lib/characterDashboardCoach';
import { useCharacterModuleProgress } from '../../hooks/useCharacterModuleProgress';
import { applyMissionBoardProgress } from '../../lib/characterProgressService';
import { remapPortalKidsRoute } from '../../lib/portalGamePaths';
import { CAIDEN_QUEST_HUB_PATH } from '../../config/courageRoutes';
import { CAIDEN_HUB, CAIDEN_AVATAR_SRC } from '../../data/caiden/sharedAssets';
import { buildCaidenQuestBoardItems } from '../../data/caiden/missionBoardData';
import { useCaidenGradeBand } from '../../hooks/useCaidenGradeBand';
import CaidenSkillTracker from './CaidenSkillTracker';
import '../../design-system/character-dashboard/character-dashboard.css';
import '../family-portal/family-dashboard.css';
import './caiden-quest-hub.css';

export default function CaidenFocusQuestHub() {
  const location = useLocation();
  const { progress } = useCharacterModuleProgress('caiden');
  const { band: gradeBand } = useCaidenGradeBand();

  const quests = useMemo(
    () =>
      applyMissionBoardProgress(buildCaidenQuestBoardItems(gradeBand), progress.completedModuleIds).map(
        (quest) => ({
          ...quest,
          route: remapPortalKidsRoute(quest.route, location.pathname),
        }),
      ),
    [gradeBand, location.pathname, progress.completedModuleIds],
  );

  const questReturnState = buildPortalReturnState(
    location.pathname,
    formatBackLabel('Focus Flame Journey'),
  );

  const firstQuestHref = quests[0]?.route ?? `${CAIDEN_QUEST_HUB_PATH}/quest-1`;
  const nextQuest = quests.find((quest) => quest.status === 'active' || quest.status === 'available');

  const coach = buildCharacterDashboardCoach({
    characterId: 'caiden',
    pathname: location.pathname,
    completedCount: progress.completedCount,
    totalCount: progress.totalCount || quests.length,
    progressPercent: progress.percent,
    firstQuestHref,
    nextQuestHref: nextQuest?.route ?? firstQuestHref,
  });

  return (
    <CharacterDashboardLayout
      characterId="caiden"
      theme="caiden"
      hero={{
        imageSrc: CAIDEN_AVATAR_SRC,
        imageAlt: 'Caiden',
        name: 'Caiden',
        subtitle: CAIDEN_HUB.subtitle,
        description: CAIDEN_HUB.intro,
        availableCountLabel: `${quests.length} Focus Quests Available`,
        theme: 'caiden',
      }}
      coach={coach}
      quests={
        <>
          <QuestGrid aria-label="Focus quests">
            {quests.map((quest) => (
              <CharacterAdventureCard
                key={quest.id}
                characterId="caiden"
                title={`Quest ${quest.fileNumber}: ${quest.title}`}
                description={quest.description}
                cta={quest.status === 'locked' ? 'Coming Next' : 'Start Quest'}
                href={quest.status === 'locked' ? '#' : quest.route}
                useCharacterHubLaunch={quest.status !== 'locked'}
                linkState={quest.status === 'locked' ? undefined : questReturnState}
                status={quest.status === 'locked' ? 'Locked' : 'Available'}
                locked={quest.status === 'locked'}
                lockedLabel={quest.status === 'locked' ? 'Coming Next' : undefined}
                skillTags={quest.skills?.slice(0, 3).join(' · ')}
                layout="horizontal"
              />
            ))}
          </QuestGrid>
          <CaidenSkillTracker />
        </>
      }
    />
  );
}
