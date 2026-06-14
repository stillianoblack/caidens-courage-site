import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import ActiveChildSelector from '../ActiveChildSelector';
import WeeklyAdventuresUnlockCard from '../WeeklyAdventuresUnlockCard';
import CourageInTheDarkAdventureHub from '../../courage-in-the-dark/CourageInTheDarkAdventureHub';
import AdventureTrail from '../../../design-system/components/AdventureTrail';
import AdventureTrailLayout from '../../../design-system/components/AdventureTrailLayout';
import { readActivePilotProgram } from '../../../config/activePilotProgram';
import { CAMP_PILOT_UNLOCK_ALL } from '../../../lib/week1MissionUnlock';
import {
  WEEKLY_VIEW_ACTIVITIES_VALUE,
  WEEKLY_VIEW_EXPLORE_VALUE,
  WEEKLY_VIEW_MISSIONS_VALUE,
  WEEKLY_VIEW_QUESTS_VALUE,
  WEEKLY_VIEW_MAP_VALUE,
  WEEKLY_VIEW_LIST_VALUE,
  WEEKLY_VIEW_PARAM,
} from '../../../lib/weeklyAdventureRouteContext';
import type { CourageHubViewMode } from '../../courage-in-the-dark/CourageHubViewToggle';
import { COURAGE_IN_THE_DARK_BG } from '../../../data/courageInTheDarkMap';
import {
  PREVIEW_ADVENTURE_PARAM,
  readAdventureVisibilityContext,
  resolveFeaturedAdventure,
} from '../../../lib/adventureVisibility';
import { useActiveChild } from '../../../hooks/useActiveChild';
import { useBaselineGate } from '../../../hooks/useBaselineGate';
import { useFamilyDashboardMetrics } from '../../../hooks/useFamilyDashboardMetrics';
import { useWeeklyAdventureTrail } from '../../../hooks/useWeeklyAdventureTrail';
import { useCourageInTheDarkProgress } from '../../../hooks/useCourageInTheDarkProgress';
import { useParticipantQuests } from '../../../hooks/useParticipantQuests';
import { useAdventureModules } from '../../../hooks/useAdventureModules';
import { resolveTrackingProgramCode } from '../../../lib/activeProgramContext';
import { resolveFamilyBasePath } from '../../../lib/familyPortalNav';
import { familyPortalPath } from '../../../lib/familyPortalPaths';
import { getPortalRoute, resolvePortalKidsBasePath } from '../../../lib/portalGamePaths';
import type { QuestClaimResult, QuestPeriod } from '../../../lib/participantQuestService';
import QuestRewardClaimModal from '../../courage-in-the-dark/QuestRewardClaimModal';
import { getUnlockedWeek, resolvePilotStartDate } from '../../../lib/pilotWeekUnlock';
import { ensureWeekGradeLevel } from '../../../lib/participantWeekGradeService';
import { isDailyAdventureComplete } from '../../../lib/courageWeeklyMissionCompletion';
import { readMonthlyCoinsEarned } from '../../../lib/monthlyCoinsEarnedTracking';
import { courageInTheDarkMissions } from '../../../data/courageInTheDarkMap';
import { isCourageMapHotspotComplete } from '../../../lib/courageInTheDarkProgress';
import { PortalPageIntro } from '../../portal-design-system';
import '../weekly-adventures-unlock-card.css';
import '../../courage-in-the-dark/courage-adventure-hub.css';
import '../../courage-in-the-dark/courage-in-the-dark-map.css';

const BASELINE_LOCKED_LABEL = 'Complete B-4 Check-In to unlock';
const WEEK_ONE_ID = 'week-1';
const WEEK_ONE_MISSION_KINDS = ['caiden', 'miranda', 'b4', 'charlie', 'zeke'] as const;

export default function FamilyContinueLearningPanel() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const activeProgram = readActivePilotProgram();
  const programCode = resolveTrackingProgramCode() ?? undefined;
  const pilotStartDate = resolvePilotStartDate(activeProgram);
  const unlockedWeek = getUnlockedWeek(pilotStartDate);
  const { visibleChildren, claimRequired, loading: childrenLoading } = useFamilyDashboardMetrics(programCode);

  const selectableChildren = useMemo(
    () =>
      visibleChildren
        .map((child) => ({
          participantId: child.studentId,
          displayName: child.displayName,
          firstName: child.displayName,
        }))
        .filter((child) => Boolean(child.participantId)),
    [visibleChildren],
  );

  const { activeChild, hasActiveChild, needsChildSelection, selectChild } =
    useActiveChild(selectableChildren);
  const { complete: baselineComplete, loading: baselineLoading, refresh } = useBaselineGate(
    activeChild?.participantId,
  );

  const basePath = resolveFamilyBasePath(location.pathname);
  const kidsBase = resolvePortalKidsBasePath(location.pathname);
  const downloadsPath = `${basePath}/downloads`;
  const certificatesPath = familyPortalPath('certificates', location.pathname);
  const baselinePath = getPortalRoute('baseline-check', location.pathname);

  const trailPaths = useMemo(
    () => ({
      kidsBasePath: kidsBase,
      downloadsPath,
      certificatesPath,
    }),
    [kidsBase, downloadsPath, certificatesPath],
  );

  const adventuresLocked =
    !hasActiveChild || (!baselineComplete && !CAMP_PILOT_UNLOCK_ALL);

  const previewAdventureId = searchParams.get(PREVIEW_ADVENTURE_PARAM);
  const visibilityCtx = useMemo(
    () => readAdventureVisibilityContext(previewAdventureId),
    [previewAdventureId],
  );

  const initialHubView = ((): CourageHubViewMode | undefined => {
    const view = searchParams.get(WEEKLY_VIEW_PARAM);
    if (view === WEEKLY_VIEW_EXPLORE_VALUE || view === WEEKLY_VIEW_MAP_VALUE) return 'explore';
    if (view === WEEKLY_VIEW_MISSIONS_VALUE || view === WEEKLY_VIEW_LIST_VALUE) return 'missions';
    if (view === WEEKLY_VIEW_ACTIVITIES_VALUE) return 'activities';
    if (view === WEEKLY_VIEW_QUESTS_VALUE) return 'quests';
    return undefined;
  })();

  const { weeks: trailWeeks } = useWeeklyAdventureTrail(
    activeChild?.participantId,
    trailPaths,
    { baselineLocked: adventuresLocked },
    pilotStartDate,
  );

  const { modules: adventureModules } = useAdventureModules();

  const featuredAdventure = useMemo(
    () => resolveFeaturedAdventure(adventureModules, visibilityCtx, 1),
    [adventureModules, visibilityCtx],
  );

  const weekOne = useMemo(() => {
    const base = trailWeeks.find((week) => week.week === 1);
    if (!base) return undefined;
    if (featuredAdventure) {
      return {
        ...base,
        title: featuredAdventure.title || base.title,
        selFocus: featuredAdventure.subtitle || base.selFocus,
      };
    }
    return base;
  }, [featuredAdventure, trailWeeks]);
  const trailWeeksAfterHero = useMemo(
    () => trailWeeks.filter((week) => week.week !== 1),
    [trailWeeks],
  );

  const showCourageHero = Boolean(weekOne && weekOne.weekStatus !== 'locked');

  const courageMapNodes = useMemo(() => {
    const nodes =
      weekOne?.nodes.filter((node) => WEEK_ONE_MISSION_KINDS.includes(node.kind as typeof WEEK_ONE_MISSION_KINDS[number])) ??
      [];
    if (baselineComplete) {
      return nodes.filter((node) => node.kind !== 'b4');
    }
    return nodes;
  }, [baselineComplete, weekOne?.nodes]);

  const { progress: weekOneProgress } = useCourageInTheDarkProgress(WEEK_ONE_ID);

  const completedWeekMissions = useMemo(
    () =>
      courageInTheDarkMissions.filter((mission) =>
        isCourageMapHotspotComplete(mission.id, weekOneProgress.completedMissionIds),
      ).length,
    [weekOneProgress.completedMissionIds],
  );

  const dailyAdventureComplete = isDailyAdventureComplete(activeChild?.participantId);
  const monthlyCoinsEarned = readMonthlyCoinsEarned(activeChild?.participantId);

  const { quests, loading: questsLoading, claimQuest, claimingKey } = useParticipantQuests({
    participantId: activeChild?.participantId,
    weekId: WEEK_ONE_ID,
    completedWeekMissions,
    monthlyCoinsEarned,
    dailyAdventureComplete,
  });

  const [questClaimResult, setQuestClaimResult] = useState<QuestClaimResult | null>(null);
  const inventoryPath = familyPortalPath('inventory', location.pathname);

  const handleClaimQuest = async (questKey: string, period: QuestPeriod) => {
    const result = await claimQuest(questKey, period);
    if (result.ok && !result.alreadyClaimed) {
      setQuestClaimResult(result);
    }
  };

  const questPanel = {
    quests,
    loading: questsLoading,
    claimingKey,
    onClaim: handleClaimQuest,
  };

  const week1ExtrasPaths = useMemo(
    () => ({
      downloadsPath,
      certificatesPath,
      week1DiscussionHref: '/downloads/pilot/journals/week-1.pdf',
      week1CertificateHref: '/downloads/pilot/camp-completion-certificate.pdf',
    }),
    [downloadsPath, certificatesPath],
  );

  useEffect(() => {
    void refresh();
  }, [location.pathname, refresh, activeChild?.participantId]);

  useEffect(() => {
    if (!activeChild?.participantId || !showCourageHero) return;
    void ensureWeekGradeLevel(activeChild.participantId, WEEK_ONE_ID);
  }, [activeChild?.participantId, showCourageHero]);

  useEffect(() => {
    const hash = location.hash.replace(/^#/, '');
    if (!hash.startsWith('week-')) return;
    const target = document.getElementById(hash);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash, trailWeeks.length]);

  const hasChildren = selectableChildren.length > 0;
  const showClaimPrompt = !childrenLoading && claimRequired;
  const showAddChildPrompt = !childrenLoading && !claimRequired && !hasChildren;
  const showUnlockCard =
    hasChildren && hasActiveChild && !baselineLoading && !baselineComplete;
  return (
    <div
      className={['family-panel', showCourageHero ? 'family-panel--courageHub' : '']
        .filter(Boolean)
        .join(' ')}
    >
      {!showCourageHero ? (
        <PortalPageIntro>
          Follow each week&apos;s recommended games, downloads, and family activities after your
          child completes their B-4 Check-In.
        </PortalPageIntro>
      ) : null}

      {showClaimPrompt ? (
        <p className="family-panelHelper family-panelHelper--prominent" role="status">
          Enter Parent/Guardian Email to Find Your Child.
        </p>
      ) : null}

      {showAddChildPrompt ? (
        <p className="family-panelHelper family-panelHelper--prominent" role="status">
          Add your child to begin.
        </p>
      ) : null}

      {needsChildSelection ? (
        <ActiveChildSelector
          children={selectableChildren}
          activeParticipantId={activeChild?.participantId}
          onSelect={selectChild}
        />
      ) : null}

      {showUnlockCard ? <WeeklyAdventuresUnlockCard baselinePath={baselinePath} /> : null}

      {showCourageHero && weekOne ? (
        <section id="week-1" className="courageMapHubSection" aria-label="Week 1 adventure hub">
          {!hasActiveChild && hasChildren ? (
            <ActiveChildSelector
              children={selectableChildren}
              activeParticipantId={activeChild?.participantId}
              onSelect={selectChild}
              helper="Choose your child to save mission progress and rewards."
            />
          ) : null}
          <CourageInTheDarkAdventureHub
            weekNodes={courageMapNodes}
            weekTitle={weekOne.title}
            week={weekOne.week}
            weekUnlockStatus={weekOne.unlockStatus}
            selFocus={weekOne.selFocus}
            baselineLocked={adventuresLocked}
            baselineLockedLabel={
              !hasActiveChild ? 'Select your child to begin' : BASELINE_LOCKED_LABEL
            }
            embeddedInFamilyPortal
            initialViewMode={initialHubView}
            week1ExtrasPaths={week1ExtrasPaths}
            questPanel={questPanel}
            mapBackgroundSrc={featuredAdventure?.background_image_url || COURAGE_IN_THE_DARK_BG}
            adminPreview={Boolean(previewAdventureId && visibilityCtx.isAdmin)}
          />
        </section>
      ) : null}

      <AdventureTrailLayout
        className={showCourageHero ? 'adventureTrailLayout--singleColumn' : undefined}
      >
        {showCourageHero && trailWeeksAfterHero.length > 0 ? (
          <h2 className="courageMapHubTrailHeading">More Weekly Adventures</h2>
        ) : null}
        <AdventureTrail
          weeks={showCourageHero ? trailWeeksAfterHero : trailWeeks}
          pilotStartDate={pilotStartDate}
          baselineLocked={adventuresLocked}
          baselineLockedLabel={
            !hasActiveChild ? 'Select your child to begin' : BASELINE_LOCKED_LABEL
          }
        />
      </AdventureTrailLayout>

      {unlockedWeek === 1 ? (
        <p className="family-emptyNote" role="status">
          Week 2 unlocks automatically when your pilot program reaches day 6.
        </p>
      ) : null}
      {questClaimResult ? (
        <QuestRewardClaimModal
          result={questClaimResult}
          inventoryPath={inventoryPath}
          onClose={() => setQuestClaimResult(null)}
        />
      ) : null}
    </div>
  );
}
