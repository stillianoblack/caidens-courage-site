import React, { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import PlayingAsSelector from '../PlayingAsSelector';
import WeeklySetupReminderCard from '../WeeklySetupReminderCard';
import CourageInTheDarkAdventureHub from '../../courage-in-the-dark/CourageInTheDarkAdventureHub';
import WeeklyAdventureJourneyMonth from '../../../design-system/components/WeeklyAdventureJourneyMonth';
import RewardClaimModal from '../../rewards/RewardClaimModal';
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
  WEEKLY_WEEK_PARAM,
  parseWeeklyAdventureWeekParam,
} from '../../../lib/weeklyAdventureRouteContext';
import { resolveHeroWeekNumber } from '../../../lib/resolveHeroWeekNumber';
import type { CourageHubViewMode } from '../../courage-in-the-dark/CourageHubViewToggle';
import {
  PREVIEW_ADVENTURE_PARAM,
  readAdventureVisibilityContext,
  isPublishedAdventure,
  resolveCurrentFeaturedAdventure,
  resolveHeroDisplayWeekNumber,
} from '../../../lib/adventureVisibility';
import { logFeaturedAdventureDiagnostics } from '../../../lib/getFeaturedAdventure';
import { resolveAdventureMapMissions } from '../../../lib/adventureMapMissions';
import { resolveAdventureMonthHeroSrc } from '../../../lib/adventureMonthHero';
import { resolveMonthForWeek } from '../../../lib/adventureMonthService';
import {
  countCompletedMapMissions,
  resolveFullyCompletedWeekNumbers,
} from '../../../lib/adventureWeekCompletion';
import {
  resolveWeekExtrasPaths,
  resolveWeeklyQuestReward,
} from '../../../lib/adventureWeekAssets';
import {
  areAllChildrenPlayReady,
  resolveChildrenNeedingSetup,
} from '../../../lib/familyChildReadiness';
import {
  buildHeroWeekView,
  buildJourneyWeeklyAdventureCards,
} from '../../../lib/weeklyAdventureWeekCards';
import { buildAdventureJourneyMonthViews } from '../../../lib/weeklyAdventureJourneyMonths';
import { warnWhenNoChildrenInDevelopment } from '../../../lib/familySupabaseEnv';
import { logFamilyChildProgressDebug } from '../../../lib/familyChildProgressDebug';
import { useActiveChild, type SelectableChild } from '../../../hooks/useActiveChild';
import { useBaselineGate } from '../../../hooks/useBaselineGate';
import { useFamilyDashboardMetrics } from '../../../hooks/useFamilyDashboardMetrics';
import { useAdventureWeekCompletions } from '../../../hooks/useAdventureWeekCompletions';
import { useWeeklyAdventureTrail } from '../../../hooks/useWeeklyAdventureTrail';
import { useCourageInTheDarkProgress } from '../../../hooks/useCourageInTheDarkProgress';
import { useParticipantQuests } from '../../../hooks/useParticipantQuests';
import { useAdventureModules } from '../../../hooks/useAdventureModules';
import { useAdventureMonths } from '../../../hooks/useAdventureMonths';
import { resolveTrackingProgramCode } from '../../../lib/activeProgramContext';
import { resolveFamilyBasePath } from '../../../lib/familyPortalNav';
import { familyPortalPath } from '../../../lib/familyPortalPaths';
import { getPortalRoute, resolvePortalKidsBasePath } from '../../../lib/portalGamePaths';
import type { QuestPeriod } from '../../../lib/participantQuestService';
import { resolveReviewWeekContext } from '../../../lib/weekReviewPanelData';
import { resolveCourageWeekId } from '../../../lib/courageInTheDarkProgress';
import { getUnlockedWeek, resolvePilotStartDate } from '../../../lib/pilotWeekUnlock';
import { ensureWeekGradeLevel } from '../../../lib/participantWeekGradeService';
import { isDailyAdventureComplete } from '../../../lib/courageWeeklyMissionCompletion';
import { readMonthlyCoinsEarned } from '../../../lib/monthlyCoinsEarnedTracking';
import { questResultToRewardClaim, type RewardClaimResult } from '../../../lib/rewardClaimService';
import '../../courage-in-the-dark/courage-adventure-hub.css';
import '../../courage-in-the-dark/courage-in-the-dark-map.css';
import '../family-children-dashboard-grid.css';
import '../../../design-system/components/weekly-adventure-journey.css';
import '../../../design-system/components/week-review-panel.css';

const WeekReviewPanel = lazy(
  () => import('../../../design-system/components/WeekReviewPanel'),
);

const BASELINE_LOCKED_LABEL = 'Complete B-4 Check-In to unlock';
const WEEK_ONE_MISSION_KINDS = ['caiden', 'miranda', 'b4', 'charlie', 'zeke'] as const;

export default function FamilyContinueLearningPanel() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const activeProgram = readActivePilotProgram();
  const programCode = resolveTrackingProgramCode() ?? undefined;
  const pilotStartDate = resolvePilotStartDate(activeProgram);
  const unlockedWeek = getUnlockedWeek(pilotStartDate);
  const {
    visibleChildren,
    claimRequired,
    loading: childrenLoading,
    v2Assessments,
    children,
    studentParticipants,
    moduleResults,
  } = useFamilyDashboardMetrics(programCode);

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

  const { activeChild, hasActiveChild, selectChild } = useActiveChild(selectableChildren);
  const [childSwitchLoading, setChildSwitchLoading] = useState(false);
  const [reviewWeekNumber, setReviewWeekNumber] = useState<number | null>(null);
  const handleReviewWeek = useCallback((weekNumber: number) => {
    setReviewWeekNumber(weekNumber);
  }, []);
  const handleCloseReviewWeek = useCallback(() => {
    setReviewWeekNumber(null);
  }, []);
  const { complete: baselineComplete, loading: baselineLoading, refresh } = useBaselineGate(
    activeChild?.participantId,
    v2Assessments,
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

  const previewAdventureId = searchParams.get(PREVIEW_ADVENTURE_PARAM);
  const visibilityCtx = useMemo(
    () => readAdventureVisibilityContext(previewAdventureId, location.search),
    [location.search, previewAdventureId],
  );

  const adventuresLocked =
    !hasActiveChild || (!baselineComplete && !CAMP_PILOT_UNLOCK_ALL && visibilityCtx.previewMode !== 'admin');

  const { modules: adventureModules } = useAdventureModules(
    visibilityCtx.previewMode === 'admin' ? 'all' : 'family',
  );

  const { months: adventureMonths } = useAdventureMonths(
    visibilityCtx.previewMode === 'admin' ? 'all' : 'family',
  );

  const { completedByWeek } = useAdventureWeekCompletions(activeChild?.participantId);

  const mapCompletedWeekNumbers = useMemo(
    () =>
      resolveFullyCompletedWeekNumbers({
        completedByWeek,
        cmsModules: adventureModules,
        paths: trailPaths,
      }),
    [adventureModules, completedByWeek, trailPaths],
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
    {
      cmsModules: adventureModules,
      visibilityCtx,
      mapCompletedWeekNumbers,
    },
  );

  const requestedWeek = parseWeeklyAdventureWeekParam(searchParams.get(WEEKLY_WEEK_PARAM));

  const playableWeekNumber = useMemo(
    () =>
      resolveHeroWeekNumber({
        trailWeeks,
        completedWeekNumbers: mapCompletedWeekNumbers,
        requestedWeek,
      }),
    [mapCompletedWeekNumbers, requestedWeek, trailWeeks],
  );

  const featuredAdventureModule = useMemo(
    () => resolveCurrentFeaturedAdventure(adventureModules, visibilityCtx, mapCompletedWeekNumbers),
    [adventureModules, mapCompletedWeekNumbers, visibilityCtx],
  );

  const heroWeekNumber = useMemo(
    () =>
      resolveHeroDisplayWeekNumber({
        playableWeekNumber,
        featuredAdventure: featuredAdventureModule,
        cmsModules: adventureModules,
        visibilityCtx,
        completedWeekNumbers: mapCompletedWeekNumbers,
      }),
    [
      adventureModules,
      featuredAdventureModule,
      mapCompletedWeekNumbers,
      playableWeekNumber,
      visibilityCtx,
    ],
  );

  const heroCmsModule = useMemo(() => {
    if (visibilityCtx.previewAdventureId && visibilityCtx.isAdmin) {
      const preview = adventureModules.find((row) => row.id === visibilityCtx.previewAdventureId);
      if (preview) return preview;
    }
    if (featuredAdventureModule?.week_number === heroWeekNumber) {
      return featuredAdventureModule;
    }
    return (
      adventureModules.find((row) => row.week_number === heroWeekNumber) ?? featuredAdventureModule
    );
  }, [adventureModules, featuredAdventureModule, heroWeekNumber, visibilityCtx]);

  const heroWeek = useMemo(
    () =>
      buildHeroWeekView({
        heroWeekNumber,
        trailWeeks,
        heroCmsModule,
        featuredAdventure: featuredAdventureModule,
        paths: trailPaths,
      }),
    [featuredAdventureModule, heroCmsModule, heroWeekNumber, trailPaths, trailWeeks],
  );

  const journeyMonths = useMemo(
    () =>
      buildAdventureJourneyMonthViews({
        trailWeeks,
        completedByWeek,
        mapCompletedWeekNumbers,
        cmsModules: adventureModules,
        cmsMonths: adventureMonths,
      }),
    [adventureModules, adventureMonths, completedByWeek, mapCompletedWeekNumbers, trailWeeks],
  );

  const journeyMonthSections = useMemo(
    () =>
      journeyMonths.map((month) => ({
        month,
        cards: buildJourneyWeeklyAdventureCards({
          weekNumbers: month.weekNumbers,
          weeks: trailWeeks,
          heroWeekNumber,
          mapCompletedWeekNumbers,
          cmsModules: adventureModules,
          pathname: location.pathname,
          adminPreview: visibilityCtx.previewMode === 'admin',
          pilotStartDate,
          onReviewWeek: handleReviewWeek,
          monthComingSoon: month.comingSoon,
        }),
      })),
    [
      adventureModules,
      handleReviewWeek,
      heroWeekNumber,
      journeyMonths,
      location.pathname,
      mapCompletedWeekNumbers,
      pilotStartDate,
      trailWeeks,
      visibilityCtx.previewMode,
    ],
  );

  const childrenNeedingSetup = useMemo(
    () => resolveChildrenNeedingSetup(children),
    [children],
  );
  const allChildrenPlayReady = useMemo(
    () => areAllChildrenPlayReady(children),
    [children],
  );
  const envWarning = useMemo(
    () => (childrenLoading ? null : warnWhenNoChildrenInDevelopment(children.length)),
    [children.length, childrenLoading],
  );

  const showCourageHero = Boolean(
    heroWeek &&
      (heroWeek.weekStatus !== 'locked' ||
        visibilityCtx.previewMode === 'admin' ||
        (featuredAdventureModule?.week_number === heroWeekNumber &&
          isPublishedAdventure(featuredAdventureModule))),
  );

  const heroMapNodes = useMemo(() => {
    const nodes =
      heroWeek?.nodes.filter((node) =>
        WEEK_ONE_MISSION_KINDS.includes(node.kind as typeof WEEK_ONE_MISSION_KINDS[number]),
      ) ?? [];
    if (heroWeekNumber === 1 && !baselineComplete && !CAMP_PILOT_UNLOCK_ALL) {
      return nodes.filter((node) => node.kind !== 'b4');
    }
    return nodes;
  }, [baselineComplete, heroWeek?.nodes, heroWeekNumber]);

  const heroWeekId = resolveCourageWeekId(heroWeekNumber);

  const mapMissions = useMemo(
    () =>
      resolveAdventureMapMissions({
        week: heroWeekNumber,
        weekTitle: heroWeek?.title ?? `Week ${heroWeekNumber}`,
        cmsModule: heroCmsModule,
        weekNodes: heroMapNodes,
        paths: trailPaths,
      }),
    [heroCmsModule, heroMapNodes, heroWeek?.title, heroWeekNumber, trailPaths],
  );

  const { progress: heroWeekProgress } = useCourageInTheDarkProgress(
    heroWeekId,
    activeChild?.participantId,
    mapMissions.length,
  );

  const completedWeekMissions = useMemo(
    () => countCompletedMapMissions(mapMissions, heroWeekProgress.completedMissionIds),
    [heroWeekProgress.completedMissionIds, mapMissions],
  );

  const dailyAdventureComplete = isDailyAdventureComplete(activeChild?.participantId);
  const monthlyCoinsEarned = readMonthlyCoinsEarned(activeChild?.participantId);

  const weeklyQuestReward = useMemo(
    () => resolveWeeklyQuestReward(heroCmsModule),
    [heroCmsModule],
  );

  const { quests, loading: questsLoading, claimQuest, claimingKey } = useParticipantQuests({
    participantId: activeChild?.participantId,
    weekId: heroWeekId,
    completedWeekMissions,
    monthlyCoinsEarned,
    dailyAdventureComplete,
    weeklyQuestReward,
  });

  const [rewardClaimResult, setRewardClaimResult] = useState<RewardClaimResult | null>(null);
  const inventoryPath = familyPortalPath('inventory', location.pathname);

  const handleClaimQuest = async (questKey: string, period: QuestPeriod) => {
    const result = await claimQuest(questKey, period);
    if (result.ok) {
      setRewardClaimResult(questResultToRewardClaim(result));
    }
  };

  const questPanel = {
    quests,
    loading: questsLoading,
    claimingKey,
    onClaim: handleClaimQuest,
  };

  const weekExtrasPaths = useMemo(
    () =>
      resolveWeekExtrasPaths(heroCmsModule, {
        downloadsPath,
        certificatesPath,
      }),
    [certificatesPath, downloadsPath, heroCmsModule],
  );

  const heroMonth = useMemo(
    () =>
      resolveMonthForWeek(
        heroWeekNumber,
        adventureMonths,
        heroCmsModule?.month_number ?? featuredAdventureModule?.month_number,
      ),
    [adventureMonths, featuredAdventureModule?.month_number, heroCmsModule?.month_number, heroWeekNumber],
  );

  const mapBackgroundSrc = useMemo(() => {
    const resolution = resolveAdventureMonthHeroSrc({
      month: heroMonth,
      heroWeekModule: heroCmsModule,
      featuredWeekModule: featuredAdventureModule,
      weekNumber: heroWeekNumber,
    });
    if (process.env.NODE_ENV === 'development') {
      console.info('[WEEKLY_ADVENTURE_MONTH_HERO_SOURCE]', {
        week: heroWeekNumber,
        month: heroMonth?.month_number ?? null,
        url: resolution.url,
        source: resolution.source,
        fallbackReason: resolution.fallbackReason ?? null,
      });
    }
    return resolution.url;
  }, [featuredAdventureModule, heroCmsModule, heroMonth, heroWeekNumber]);

  const reviewWeekContext = useMemo(() => {
    if (!reviewWeekNumber) return null;
    return resolveReviewWeekContext({
      weekNumber: reviewWeekNumber,
      trailWeeks,
      cmsModules: adventureModules,
      paths: { downloadsPath, certificatesPath },
    });
  }, [adventureModules, certificatesPath, downloadsPath, reviewWeekNumber, trailWeeks]);

  const reviewWeekTrail = reviewWeekContext?.trailWeek ?? null;

  const reviewWeekMapNodes = useMemo(() => {
    if (!reviewWeekTrail) return [];
    const nodes = reviewWeekTrail.nodes.filter((node) =>
      WEEK_ONE_MISSION_KINDS.includes(node.kind as typeof WEEK_ONE_MISSION_KINDS[number]),
    );
    if (reviewWeekNumber === 1 && !baselineComplete && !CAMP_PILOT_UNLOCK_ALL) {
      return nodes.filter((node) => node.kind !== 'b4');
    }
    return nodes;
  }, [baselineComplete, reviewWeekNumber, reviewWeekTrail]);

  const reviewMapMissions = useMemo(() => {
    if (!reviewWeekNumber || !reviewWeekContext) return [];
    return resolveAdventureMapMissions({
      week: reviewWeekNumber,
      weekTitle: reviewWeekContext.trailWeek?.title ?? `Week ${reviewWeekNumber}`,
      cmsModule: reviewWeekContext.cmsModule,
      weekNodes: reviewWeekMapNodes,
      paths: trailPaths,
    });
  }, [reviewWeekContext, reviewWeekMapNodes, reviewWeekNumber, trailPaths]);

  const reviewCompletedMissionIds = useMemo(
    () => (reviewWeekNumber ? completedByWeek[reviewWeekNumber] ?? [] : []),
    [completedByWeek, reviewWeekNumber],
  );

  const reviewCachedProgress = useMemo(() => {
    if (!reviewWeekNumber || reviewWeekNumber !== heroWeekNumber) return null;
    return heroWeekProgress;
  }, [heroWeekNumber, heroWeekProgress, reviewWeekNumber]);

  const reviewWeeklyRewardClaimed = useMemo(() => {
    if (!reviewWeekNumber || reviewWeekNumber !== heroWeekNumber) return false;
    return quests.some((quest) => quest.period === 'weekly' && quest.claimed);
  }, [heroWeekNumber, quests, reviewWeekNumber]);

  useEffect(() => {
    void refresh();
  }, [location.pathname, refresh, activeChild?.participantId]);

  useEffect(() => {
    setChildSwitchLoading(false);
  }, [activeChild?.participantId]);

  useEffect(() => {
    const reviewParticipant = searchParams.get('participant')?.trim();
    if (!reviewParticipant || reviewParticipant === activeChild?.participantId) return;
    const match = selectableChildren.find((child) => child.participantId === reviewParticipant);
    if (match) selectChild(match);
  }, [activeChild?.participantId, searchParams, selectChild, selectableChildren]);

  useEffect(() => {
    if (childrenLoading || process.env.NODE_ENV !== 'development') return;
    void logFamilyChildProgressDebug({
      children,
      activeParticipantId: activeChild?.participantId,
      studentParticipants,
      programCode,
      moduleResults,
    });
  }, [
    activeChild?.participantId,
    children,
    childrenLoading,
    moduleResults,
    programCode,
    studentParticipants,
  ]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development' || adventureModules.length === 0) return;
    logFeaturedAdventureDiagnostics(adventureModules, featuredAdventureModule, heroWeekNumber);
  }, [adventureModules, featuredAdventureModule, heroWeekNumber]);

  useEffect(() => {
    if (!activeChild?.participantId || !showCourageHero) return;
    void ensureWeekGradeLevel(activeChild.participantId, heroWeekId);
  }, [activeChild?.participantId, heroWeekId, showCourageHero]);

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
  const handleSelectChild = (child: SelectableChild) => {
    if (child.participantId === activeChild?.participantId) return;
    setChildSwitchLoading(true);
    selectChild(child);
  };

  return (
    <div
      className={[
        'family-panel',
        showCourageHero ? 'family-panel--courageHub' : '',
        childSwitchLoading ? 'family-weeklyChildSwitchShimmer' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="family-weeklyTopBar">
        <h1 className="family-weeklyTopBarTitle">Weekly Adventures</h1>
      </div>

      {envWarning ? (
        <p className="family-weeklyEnvWarning" role="status">
          {envWarning}
        </p>
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

      {!hasActiveChild && hasChildren ? (
        <p className="family-panelHelper family-panelHelper--prominent" role="status">
          Choose your active player to save mission progress and rewards.
        </p>
      ) : null}

      {showCourageHero && heroWeek ? (
        <section
          id={`week-${heroWeekNumber}`}
          className="courageMapHubSection"
          aria-label={`Week ${heroWeekNumber} adventure hub`}
        >
          <CourageInTheDarkAdventureHub
            weekNodes={heroMapNodes}
            weekTitle={heroWeek.title}
            week={heroWeek.week}
            weekUnlockStatus={heroWeek.unlockStatus}
            selFocus={heroWeek.selFocus}
            baselineLocked={adventuresLocked}
            baselineLockedLabel={
              !hasActiveChild ? 'Select your child to begin' : BASELINE_LOCKED_LABEL
            }
            embeddedInFamilyPortal
            initialViewMode={initialHubView}
            week1ExtrasPaths={weekExtrasPaths}
            questPanel={questPanel}
            mapBackgroundSrc={mapBackgroundSrc}
            mapMissions={mapMissions}
            adminPreview={visibilityCtx.previewMode === 'admin'}
            comicThumbnailUrl={heroWeek.thumbnailUrl}
            headerTrailing={
              hasChildren ? (
                <PlayingAsSelector
                  children={selectableChildren}
                  activeParticipantId={activeChild?.participantId}
                  onSelect={handleSelectChild}
                  loading={childSwitchLoading || baselineLoading}
                />
              ) : null
            }
          />
        </section>
      ) : null}

      <div className="weeklyJourneySections" aria-label="Monthly adventure journey">
        {journeyMonthSections.map(({ month, cards }) => (
          <WeeklyAdventureJourneyMonth key={month.monthNumber} month={month} cards={cards} />
        ))}
      </div>

      {!allChildrenPlayReady && childrenNeedingSetup.length > 0 ? (
        <WeeklySetupReminderCard
          childrenNeedingSetup={childrenNeedingSetup}
          baselinePath={baselinePath}
        />
      ) : null}

      {unlockedWeek === 1 ? (
        <p className="family-emptyNote" role="status">
          Week 2 unlocks every 4 days or when Week 1 is fully complete.
        </p>
      ) : null}
      <RewardClaimModal
        result={rewardClaimResult}
        inventoryPath={inventoryPath}
        onClose={() => setRewardClaimResult(null)}
      />

      {reviewWeekNumber && reviewWeekContext ? (
        <Suspense fallback={null}>
          <WeekReviewPanel
            open
            onClose={handleCloseReviewWeek}
            weekNumber={reviewWeekNumber}
            participantId={activeChild?.participantId ?? null}
            childDisplayName={activeChild?.displayName ?? 'Your player'}
            trailWeek={reviewWeekContext.trailWeek}
            cmsModule={reviewWeekContext.cmsModule}
            mapMissions={reviewMapMissions}
            completedMissionIds={reviewCompletedMissionIds}
            pathname={location.pathname}
            weekExtrasPaths={reviewWeekContext.weekExtrasPaths}
            weeklyQuestReward={reviewWeekContext.weeklyQuestReward}
            inventoryHref={inventoryPath}
            cachedProgress={reviewCachedProgress}
            weeklyRewardClaimed={reviewWeeklyRewardClaimed}
          />
        </Suspense>
      ) : null}
    </div>
  );
}
