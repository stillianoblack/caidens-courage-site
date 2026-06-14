import React, { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import PlayingAsSelector from '../PlayingAsSelector';
import WeeklySetupReminderCard from '../WeeklySetupReminderCard';
import CourageInTheDarkAdventureHub from '../../courage-in-the-dark/CourageInTheDarkAdventureHub';
import WeeklyAdventureWeekRow from '../../../design-system/components/WeeklyAdventureWeekRow';
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
  resolveFeaturedAdventureModule,
  resolveHeroDisplayWeekNumber,
} from '../../../lib/adventureVisibility';
import { resolveAdventureHeroMapSrc, resolveAdventureMapMissions } from '../../../lib/adventureMapMissions';
import { resolveAdventureComicThumbnailUrl } from '../../../lib/adventureThumbnail';
import { normalizeSelFocusLabel } from '../../../lib/adventureSelFocus';
import {
  countCompletedMapMissions,
  resolveCompletedWeekNumbers,
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
  buildCompletedWeeklyAdventureCards,
  buildUpcomingWeeklyAdventureCards,
} from '../../../lib/weeklyAdventureWeekCards';
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
    () => resolveFeaturedAdventureModule(adventureModules, visibilityCtx),
    [adventureModules, visibilityCtx],
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
    return (
      adventureModules.find((row) => row.week_number === heroWeekNumber) ?? featuredAdventureModule
    );
  }, [adventureModules, featuredAdventureModule, heroWeekNumber, visibilityCtx]);

  const heroWeek = useMemo(() => {
    const base = trailWeeks.find((week) => week.week === heroWeekNumber);
    if (!base) return undefined;
    if (!heroCmsModule) return base;
    return {
      ...base,
      title: heroCmsModule.title || base.title,
      selFocus: normalizeSelFocusLabel(heroCmsModule.subtitle) || base.selFocus,
      previewActivities: heroCmsModule.preview_activities ?? base.previewActivities,
      thumbnailUrl: resolveAdventureComicThumbnailUrl(heroCmsModule, heroWeekNumber),
    };
  }, [heroCmsModule, heroWeekNumber, trailWeeks]);

  const completedWeekNumbers = useMemo(
    () =>
      resolveCompletedWeekNumbers({
        completedByWeek,
        cmsModules: adventureModules,
        heroWeekNumber,
        paths: trailPaths,
      }),
    [adventureModules, completedByWeek, heroWeekNumber, trailPaths],
  );

  const upcomingWeekCards = useMemo(
    () =>
      buildUpcomingWeeklyAdventureCards({
        weeks: trailWeeks,
        heroWeekNumber,
        completedWeekNumbers: mapCompletedWeekNumbers,
        cmsModules: adventureModules,
        pathname: location.pathname,
        adminPreview: visibilityCtx.previewMode === 'admin',
      }),
    [
      adventureModules,
      heroWeekNumber,
      location.pathname,
      mapCompletedWeekNumbers,
      trailWeeks,
      visibilityCtx.previewMode,
    ],
  );

  const completedWeekCards = useMemo(
    () =>
      buildCompletedWeeklyAdventureCards({
        weeks: trailWeeks,
        completedWeekNumbers,
        cmsModules: adventureModules,
        pathname: location.pathname,
        participantId: activeChild?.participantId,
        onReviewWeek: handleReviewWeek,
      }),
    [
      activeChild?.participantId,
      adventureModules,
      completedWeekNumbers,
      handleReviewWeek,
      location.pathname,
      trailWeeks,
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
    heroWeek && (heroWeek.weekStatus !== 'locked' || visibilityCtx.previewMode === 'admin'),
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

  const mapBackgroundSrc = useMemo(
    () => resolveAdventureHeroMapSrc(heroCmsModule, heroWeekNumber),
    [heroCmsModule, heroWeekNumber],
  );

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

      <WeeklyAdventureWeekRow
        title="Upcoming Weeks"
        items={upcomingWeekCards}
        emptyMessage="More adventures coming soon."
      />

      <WeeklyAdventureWeekRow
        title="Completed Weeks"
        items={completedWeekCards}
        emptyMessage="Complete your first weekly adventure to see it here."
      />

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
