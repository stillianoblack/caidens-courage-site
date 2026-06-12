import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CharacterAdventureCard from '../family-portal/CharacterAdventureCard';
import { CharacterDashboardLayout, QuestGrid } from '../../design-system/character-dashboard';
import { buildPortalReturnState, formatBackLabel } from '../../lib/portalBreadcrumbNav';
import { buildAdultLearningDashboardCoach } from '../../lib/characterDashboardCoach';
import { readCompletedAdultTrainingMissions } from '../../lib/adultTrainingCompletion';
import { ADULT_ASSESSMENT_PROGRESS_EVENT } from '../../lib/adultAssessmentStorage';
import {
  adultTrainingMissionPath,
  countAvailableMissions,
  type AdultGuide,
  type AdultTrainingPortal,
} from '../../types/adultTraining';
import type { FamilyCharacterId } from '../../data/familyPortalContent';
import '../../design-system/character-dashboard/character-dashboard.css';
import '../family-portal/family-dashboard.css';
import './adult-learning-hub.css';

type AdultLearningHubProps = {
  guide: AdultGuide;
  portal: AdultTrainingPortal;
  backPath: string;
  backLabel: string;
  embedded?: boolean;
};

function useCompletedAdultMissions(guideId: string): string[] {
  const [completedIds, setCompletedIds] = useState(() => readCompletedAdultTrainingMissions(guideId));

  const refresh = useCallback(() => {
    setCompletedIds(readCompletedAdultTrainingMissions(guideId));
  }, [guideId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    window.addEventListener(ADULT_ASSESSMENT_PROGRESS_EVENT, refresh);
    return () => window.removeEventListener(ADULT_ASSESSMENT_PROGRESS_EVENT, refresh);
  }, [refresh]);

  return completedIds;
}

export default function AdultLearningHub({
  guide,
  portal,
  backPath,
  backLabel,
  embedded = false,
}: AdultLearningHubProps) {
  const location = useLocation();
  const completedMissionIds = useCompletedAdultMissions(guide.id);
  const availableCount = countAvailableMissions(guide);
  const characterId = guide.id as FamilyCharacterId;
  const heroTheme = guide.theme.id === 'victoria' ? 'victoria' : 'uncle-t';

  const questReturnState = buildPortalReturnState(
    location.pathname,
    formatBackLabel(guide.hubTitle),
  );

  const coach = buildAdultLearningDashboardCoach({
    guide,
    portal,
    pathname: location.pathname,
    completedMissionIds,
  });

  const missions = useMemo(
    () =>
      guide.missions.map((mission) => ({
        ...mission,
        path: adultTrainingMissionPath(portal, guide, mission.id),
        isComplete: completedMissionIds.includes(mission.id),
      })),
    [completedMissionIds, guide, portal],
  );

  return (
    <CharacterDashboardLayout
      characterId={guide.id}
      theme={guide.theme.id}
      portalInset={embedded}
      breadcrumbLabel={backLabel}
      breadcrumbHref={backPath}
      hero={{
        imageSrc: guide.portraitSrc,
        imageAlt: guide.portraitAlt,
        name: guide.hubTitle,
        subtitle: guide.hubSubtitle,
        description: guide.hubDescription,
        availableCountLabel: `${guide.progressTrackLabel} · ${availableCount} Mission${availableCount === 1 ? '' : 's'} Available`,
        theme: heroTheme,
      }}
      coach={coach}
      quests={
        <>
          <h2 id="adult-learning-missions" className="char-questSectionTitle">
            Training Missions
          </h2>
          <QuestGrid aria-labelledby="adult-learning-missions">
            {missions.map((mission) => (
              <CharacterAdventureCard
                key={mission.id}
                characterId={characterId}
                title={`Mission ${mission.number}: ${mission.title}`}
                description={mission.description}
                cta={mission.status === 'locked' ? 'Coming Soon' : 'Start Mission'}
                href={mission.status === 'locked' ? '#' : mission.path}
                linkState={mission.status === 'locked' ? undefined : questReturnState}
                status={
                  mission.isComplete
                    ? 'Complete'
                    : mission.status === 'locked'
                      ? 'Locked'
                      : 'Available'
                }
                locked={mission.status === 'locked'}
                lockedLabel="Coming Soon"
                skillTags={`${mission.difficulty} · ${mission.skillFocus}`}
                layout="horizontal"
              />
            ))}
            {guide.futureMissions.map((mission) => (
              <CharacterAdventureCard
                key={`future-${mission.number}`}
                characterId={characterId}
                title={`Mission ${mission.number}: ${mission.title}`}
                description="Coming soon in this learning track."
                cta="Coming Soon"
                href="#"
                status="Locked"
                locked
                lockedLabel="Coming Soon"
                layout="horizontal"
              />
            ))}
          </QuestGrid>
        </>
      }
      footer={
        <section className="adultLearningHub-badgesSection" aria-labelledby="adult-learning-badges">
          <h2 id="adult-learning-badges" className="char-questSectionTitle">
            Badges Earned
          </h2>
          <div className="adultLearningHub-badgesPanel">
            <p className="adultLearningHub-badgesHint">
              Complete missions to earn badges that celebrate your adult learning journey.
            </p>
            <div className="adultLearningHub-badgesList" aria-label="Available badge rewards">
              {guide.missions.map((mission) => (
                <span
                  key={mission.id}
                  className={[
                    'adultLearningHub-badgePill',
                    completedMissionIds.includes(mission.id) ? 'adultLearningHub-badgePill--earned' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {mission.badge}
                </span>
              ))}
            </div>
          </div>
        </section>
      }
    />
  );
}
