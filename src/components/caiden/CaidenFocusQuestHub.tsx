import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import CharacterAdventureCard from '../family-portal/CharacterAdventureCard';
import { CharacterDashboardLayout, QuestGrid } from '../../design-system/character-dashboard';
import { buildPortalReturnState, formatBackLabel } from '../../lib/portalBreadcrumbNav';
import { buildCharacterDashboardCoach } from '../../lib/characterDashboardCoach';
import { useCharacterModuleProgress } from '../../hooks/useCharacterModuleProgress';
import { applyMissionBoardProgress } from '../../lib/characterProgressService';
import { remapPortalKidsRoute } from '../../lib/portalGamePaths';
import { CAIDEN_QUEST_HUB_PATH, STORY_MODE_PATH } from '../../config/courageRoutes';
import { CAIDEN_HUB, CAIDEN_AVATAR_SRC } from '../../data/caiden/sharedAssets';
import { buildCaidenQuestBoardItems } from '../../data/caiden/missionBoardData';
import {
  FOCUS_FLAME_CHALLENGE_MISSIONS,
  resolveFocusFlameChallengeAvailability,
} from '../../data/caiden/focusFlameChallenges';
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

  const focusFlameChallenges = useMemo(
    () =>
      FOCUS_FLAME_CHALLENGE_MISSIONS.map((mission) => {
        const prerequisite = quests.find((quest) => quest.id === mission.prerequisiteQuestId);
        const availability = resolveFocusFlameChallengeAvailability({
          prerequisiteStatus: prerequisite?.status,
          completed: progress.completedModuleIds.has(mission.id),
        });
        const completed = availability === 'completed';
        const locked = availability === 'locked';
        const route = remapPortalKidsRoute(
          `${CAIDEN_QUEST_HUB_PATH}/${mission.id}`,
          location.pathname,
        );
        return { ...mission, completed, locked, route };
      }),
    [location.pathname, progress.completedModuleIds, quests],
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
          <section className="storyModeLaunchCard" aria-labelledby="story-mode-launch-title">
            <h2 id="story-mode-launch-title">Story Mode</h2>
            <p>
              Follow Caiden through a chapter campaign that opens each Focus Quest as part of
              the story.
            </p>
            <Link to={STORY_MODE_PATH}>Continue Journey</Link>
          </section>
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
          <section className="storyModeLaunchCard" aria-labelledby="focus-flame-challenges-title">
            <h2 id="focus-flame-challenges-title">Focus Flame Challenges</h2>
            <p>Practice one real-life executive-function mission alongside each Week 3–9 adventure.</p>
          </section>
          <QuestGrid aria-label="Focus Flame challenges">
            {focusFlameChallenges.map((mission) => (
              <CharacterAdventureCard
                key={mission.id}
                characterId="caiden"
                title={`Week ${mission.week}: ${mission.name}`}
                description={`${mission.difficulty[0].toUpperCase()}${mission.difficulty.slice(1)} · ${mission.skills.slice(0, 3).join(' · ')}`}
                cta={mission.locked ? 'Coming Next' : mission.completed ? 'Play Again' : 'Start Challenge'}
                href={mission.locked ? '#' : mission.route}
                useCharacterHubLaunch={!mission.locked}
                linkState={mission.locked ? undefined : questReturnState}
                status={mission.locked ? 'Locked' : mission.completed ? 'Complete' : 'Available'}
                locked={mission.locked}
                lockedLabel={mission.locked ? 'Complete the matching Focus Quest first' : undefined}
                skillTags={mission.badge}
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
