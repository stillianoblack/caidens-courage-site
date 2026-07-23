import React, { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import PlayingAsSelector from '../PlayingAsSelector';
import StartChildGameButton from '../StartChildGameButton';
import '../start-child-game-button.css';
import WeeklySetupReminderCard from '../WeeklySetupReminderCard';
import CourageInTheDarkAdventureHub from '../../courage-in-the-dark/CourageInTheDarkAdventureHub';
import WeeklyAdventureJourneyMonth from '../../../design-system/components/WeeklyAdventureJourneyMonth';
import WeeklyAdventureMonthSelector from '../../../design-system/components/WeeklyAdventureMonthSelector';
import MyAdventuresDrawer from '../../kid-play-shell/MyAdventuresDrawer';
import RewardClaimModal from '../../rewards/RewardClaimModal';
import { readActivePilotProgram } from '../../../config/activePilotProgram';
import { kidPlayShellNavigate } from '../../../lib/kidShellNav';
import {
  BASELINE_GATE_MESSAGE,
  launchWeeklyMission,
  resolveLaunchMissionForWeek,
} from '../../../lib/launchWeeklyMission';
import {
  WEEKLY_VIEW_ACTIVITIES_VALUE,
  WEEKLY_VIEW_EXPLORE_VALUE,
  WEEKLY_VIEW_MISSIONS_VALUE,
  WEEKLY_VIEW_QUESTS_VALUE,
  WEEKLY_VIEW_MAP_VALUE,
  WEEKLY_VIEW_LIST_VALUE,
  WEEKLY_VIEW_PARAM,
  WEEKLY_MONTH_PARAM,
  parseWeeklyAdventureMonthParam,
  WEEKLY_WEEK_PARAM,
  parseWeeklyAdventureWeekParam,
  weeklyAdventureHeroAnchor,
} from '../../../lib/weeklyAdventureRouteContext';
import { resolveSelectableWeekNumber } from '../../../lib/resolveSelectableWeekNumber';
import { logWeekSelectionDebug } from '../../../lib/weekSelectionDebug';
import {
  ENABLE_CINEMATIC_ADVENTURE_MODE,
  ENABLE_CINEMATIC_WEEK_SELECTOR,
  ENABLE_DARK_ADVENTURE_CENTER,
  ENABLE_LEGACY_WEEK_GRID,
} from '../../../config/weeklyAdventureFeatures';
import { useFocusCoinWallet } from '../../../hooks/useFocusCoinWallet';
import { resolveAdventureComicThumbnailUrl } from '../../../lib/adventureThumbnail';
import { resolveHeroWeekNumber } from '../../../lib/resolveHeroWeekNumber';
import type { CourageHubViewMode } from '../../courage-in-the-dark/CourageHubViewToggle';
import {
  PREVIEW_ADVENTURE_PARAM,
  readAdventureVisibilityContext,
  resolveCurrentFeaturedAdventure,
  resolveHeroDisplayWeekNumber,
} from '../../../lib/adventureVisibility';
import { logFeaturedAdventureDiagnostics } from '../../../lib/getFeaturedAdventure';
import { resolveAdventureMapMissions } from '../../../lib/adventureMapMissions';
import { resolveAdventureMonthHeroSrc } from '../../../lib/adventureMonthHero';
import {
  resolveDefaultMonthNumber,
  resolveMonthForWeek,
} from '../../../lib/adventureMonthService';
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
import '../weekly-adventure-dark-center.css';
import { useBaselineGate } from '../../../hooks/useBaselineGate';
import {
  resolveWeeklyAdventureBaselineLocked,
  resolveWeeklyAdventurePlayerHudWeekLabel,
  resolveWeeklyAdventureProgressSignal,
} from '../../../lib/weeklyAdventureBaselineGate';
import { useFamilyDashboardMetrics } from '../../../hooks/useFamilyDashboardMetrics';
import { useAdventureWeekCompletions } from '../../../hooks/useAdventureWeekCompletions';
import { useWeeklyAdventureTrail } from '../../../hooks/useWeeklyAdventureTrail';
import { useCourageInTheDarkProgress } from '../../../hooks/useCourageInTheDarkProgress';
import { useChildRewardCompletion } from '../../../hooks/useChildRewardCompletion';
import { useParticipantQuests } from '../../../hooks/useParticipantQuests';
import { useAdventureModules } from '../../../hooks/useAdventureModules';
import { useAdventureMonths } from '../../../hooks/useAdventureMonths';
import { resolveTrackingProgramCode } from '../../../lib/activeProgramContext';
import { resolveFamilyBasePath } from '../../../lib/familyPortalNav';
import { familyPortalPath } from '../../../lib/familyPortalPaths';
import { resolveWeekMissionProgressFromSnapshot } from '../../../lib/childRewardCompletionSnapshot';
import { getPortalRoute, resolvePortalKidsBasePath } from '../../../lib/portalGamePaths';
import type { QuestPeriod } from '../../../lib/participantQuestService';
import { resolveReviewWeekContext } from '../../../lib/weekReviewPanelData';
import { resolveCourageWeekId } from '../../../lib/courageInTheDarkProgress';
import { resolvePilotStartDate } from '../../../lib/pilotWeekUnlock';
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

const BASELINE_LOCKED_LABEL = BASELINE_GATE_MESSAGE;
const WEEK_ONE_MISSION_KINDS = ['caiden', 'miranda', 'b4', 'charlie', 'zeke'] as const;

type FamilyContinueLearningPanelProps = {
  /** Facilitator shared-device kid play shell — weekly adventures only, no family portal chrome. */
  kidPlayShell?: boolean;
};

export default function FamilyContinueLearningPanel({ kidPlayShell = false }: FamilyContinueLearningPanelProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeProgram = readActivePilotProgram();
  const programCode = resolveTrackingProgramCode() ?? undefined;
  const pilotStartDate = resolvePilotStartDate(activeProgram);
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

  const { modules: adventureModules } = useAdventureModules(
    visibilityCtx.previewMode === 'admin' ? 'all' : 'family',
  );

  const { completedByWeek, loading: adventureCompletionsLoading } = useAdventureWeekCompletions(
    activeChild?.participantId,
  );

  const mapCompletedWeekNumbers = useMemo(
    () =>
      resolveFullyCompletedWeekNumbers({
        completedByWeek,
        cmsModules: adventureModules,
        paths: trailPaths,
      }),
    [adventureModules, completedByWeek, trailPaths],
  );

  const requestedWeek = parseWeeklyAdventureWeekParam(searchParams.get(WEEKLY_WEEK_PARAM));
  const requestedMonth = parseWeeklyAdventureMonthParam(searchParams.get(WEEKLY_MONTH_PARAM));

  const adventureProgress = useMemo(
    () =>
      resolveWeeklyAdventureProgressSignal({
        completedByWeek,
        completedWeekNumbers: mapCompletedWeekNumbers,
        requestedWeek,
      }),
    [completedByWeek, mapCompletedWeekNumbers, requestedWeek],
  );

  const adventuresLocked = useMemo(
    () =>
      resolveWeeklyAdventureBaselineLocked({
        hasActiveChild,
        baselineComplete,
        isAdminPreview: visibilityCtx.previewMode === 'admin',
        completedWeekCount: adventureProgress.completedWeekCount,
        currentWeek: adventureProgress.currentWeek,
        hasAnyMissionCompletion: adventureProgress.hasAnyMissionCompletion,
        adventureProgressLoading: adventureCompletionsLoading,
      }),
    [
      adventureCompletionsLoading,
      adventureProgress.completedWeekCount,
      adventureProgress.currentWeek,
      adventureProgress.hasAnyMissionCompletion,
      baselineComplete,
      hasActiveChild,
      visibilityCtx.previewMode,
    ],
  );

  const { snapshot: rewardSnapshot } = useChildRewardCompletion({
    participantId: activeChild?.participantId,
    cmsModules: adventureModules,
    paths: trailPaths,
  });

  const { months: adventureMonths } = useAdventureMonths(
    visibilityCtx.previewMode === 'admin' ? 'all' : 'family',
  );

  const initialHubView = ((): CourageHubViewMode | undefined => {
    const view = searchParams.get(WEEKLY_VIEW_PARAM);
    if (view === WEEKLY_VIEW_EXPLORE_VALUE || view === WEEKLY_VIEW_MAP_VALUE) return 'explore';
    if (view === WEEKLY_VIEW_MISSIONS_VALUE || view === WEEKLY_VIEW_LIST_VALUE) return 'missions';
    if (view === WEEKLY_VIEW_ACTIVITIES_VALUE) return kidPlayShell ? 'explore' : 'activities';
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
      cmsMonths: adventureMonths,
      visibilityCtx,
      mapCompletedWeekNumbers,
      pilotStartDate,
    },
  );

  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number | null>(requestedWeek);

  useEffect(() => {
    if (requestedWeek) {
      setSelectedWeekNumber(requestedWeek);
    }
  }, [requestedWeek]);

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

  const explicitSelectedWeek = useMemo(
    () =>
      resolveSelectableWeekNumber(
        selectedWeekNumber ?? requestedWeek,
        trailWeeks,
        visibilityCtx,
      ),
    [requestedWeek, selectedWeekNumber, trailWeeks, visibilityCtx],
  );

  const heroWeekNumber = useMemo(
    () =>
      resolveHeroDisplayWeekNumber({
        playableWeekNumber,
        featuredAdventure: featuredAdventureModule,
        cmsModules: adventureModules,
        visibilityCtx,
        completedWeekNumbers: mapCompletedWeekNumbers,
        selectedWeek: explicitSelectedWeek,
      }),
    [
      adventureModules,
      explicitSelectedWeek,
      featuredAdventureModule,
      mapCompletedWeekNumbers,
      playableWeekNumber,
      visibilityCtx,
    ],
  );

  const handleSelectWeek = useCallback(
    (weekNumber: number) => {
      const selectable = resolveSelectableWeekNumber(weekNumber, trailWeeks, visibilityCtx);
      if (!selectable) return;

      const previousSelectedWeek = selectedWeekNumber ?? explicitSelectedWeek ?? heroWeekNumber;
      const cmsModule = adventureModules.find((row) => row.week_number === selectable) ?? null;
      const trailWeek = trailWeeks.find((row) => row.week === selectable);
      const headerTitle = cmsModule?.title?.trim() || trailWeek?.title || `Week ${selectable}`;
      const headerThumbnail = resolveAdventureComicThumbnailUrl(cmsModule, selectable);

      setSelectedWeekNumber(selectable);

      const params = new URLSearchParams(searchParams);
      params.set(WEEKLY_VIEW_PARAM, WEEKLY_VIEW_EXPLORE_VALUE);
      params.set(WEEKLY_WEEK_PARAM, String(selectable));
      params.set(WEEKLY_MONTH_PARAM, String(resolveDefaultMonthNumber(selectable)));
      const heroHash = weeklyAdventureHeroAnchor(selectable);
      const nextLocation = {
        pathname: location.pathname,
        search: `?${params.toString()}`,
        hash: heroHash,
      };

      if (kidPlayShell) {
        kidPlayShellNavigate(navigate, nextLocation);
      } else {
        navigate(nextLocation, { replace: false });
      }

      requestAnimationFrame(() => {
        const target = document.getElementById(heroHash);
        const scrollTriggered = Boolean(target);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        logWeekSelectionDebug({
          clickedWeek: weekNumber,
          previousSelectedWeek,
          newSelectedWeek: selectable,
          headerTitle,
          headerThumbnail,
          scrollTriggered,
        });
      });
    },
    [
      adventureModules,
      explicitSelectedWeek,
      heroWeekNumber,
      kidPlayShell,
      location.pathname,
      navigate,
      searchParams,
      selectedWeekNumber,
      trailWeeks,
      visibilityCtx,
    ],
  );

  const handleHighlightWeek = useCallback(
    (weekNumber: number) => {
      const selectable = resolveSelectableWeekNumber(weekNumber, trailWeeks, visibilityCtx);
      if (!selectable) return;
      setSelectedWeekNumber(selectable);
    },
    [trailWeeks, visibilityCtx],
  );

  const heroCmsModule = useMemo(() => {
    if (visibilityCtx.previewAdventureId && visibilityCtx.isAdmin) {
      const preview = adventureModules.find((row) => row.id === visibilityCtx.previewAdventureId);
      if (preview) return preview;
    }
    return adventureModules.find((row) => row.week_number === heroWeekNumber) ?? null;
  }, [adventureModules, heroWeekNumber, visibilityCtx]);

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
          cmsMonths: adventureMonths,
          pathname: location.pathname,
          adminPreview: visibilityCtx.previewMode === 'admin',
          pilotStartDate,
          visibilityCtx,
          onReviewWeek: handleReviewWeek,
          onSelectWeek: handleSelectWeek,
          monthComingSoon: month.comingSoon,
          completedByWeek,
        }),
      })),
    [
      adventureModules,
      adventureMonths,
      handleReviewWeek,
      handleSelectWeek,
      heroWeekNumber,
      journeyMonths,
      location.pathname,
      mapCompletedWeekNumbers,
      completedByWeek,
      pilotStartDate,
      trailWeeks,
      visibilityCtx,
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
      (kidPlayShell || heroWeek.weekStatus !== 'locked' || visibilityCtx.previewMode === 'admin'),
  );

  const heroMapNodes = useMemo(() => {
    return (
      heroWeek?.nodes.filter((node) =>
        WEEK_ONE_MISSION_KINDS.includes(node.kind as typeof WEEK_ONE_MISSION_KINDS[number]),
      ) ?? []
    );
  }, [heroWeek?.nodes]);

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

  const resolveWeekLaunchContext = useCallback(
    (weekNumber: number) => {
      const selectable = resolveSelectableWeekNumber(weekNumber, trailWeeks, visibilityCtx);
      if (!selectable) return null;

      const trailWeek = trailWeeks.find((row) => row.week === selectable);
      if (!trailWeek || trailWeek.weekStatus === 'locked') return null;

      const cmsModule = adventureModules.find((row) => row.week_number === selectable) ?? null;
      const weekTitle = cmsModule?.title?.trim() || trailWeek.title || `Week ${selectable}`;
      const weekNodes = trailWeek.nodes.filter((node) =>
        WEEK_ONE_MISSION_KINDS.includes(node.kind as typeof WEEK_ONE_MISSION_KINDS[number]),
      );
      const missions = resolveAdventureMapMissions({
        week: selectable,
        weekTitle,
        cmsModule,
        weekNodes,
        paths: trailPaths,
      });
      const completedMissionIds =
        completedByWeek[selectable] ??
        (selectable === heroWeekNumber ? heroWeekProgress.completedMissionIds : []);

      return {
        weekNumber: selectable,
        weekTitle,
        monthId: cmsModule?.month_number ?? null,
        missions,
        completedMissionIds,
      };
    },
    [
      adventureModules,
      completedByWeek,
      heroWeekNumber,
      heroWeekProgress.completedMissionIds,
      trailPaths,
      trailWeeks,
      visibilityCtx,
    ],
  );

  const handleLaunchWeek = useCallback(
    (weekNumber: number, source: 'week-card' | 'week-card-cta') => {
      if (!hasActiveChild) return false;

      const context = resolveWeekLaunchContext(weekNumber);
      if (!context) return false;

      if (adventuresLocked && context.weekNumber !== 1) {
        return false;
      }

      const mission = resolveLaunchMissionForWeek(context.missions, {
        week: context.weekNumber,
        baselineLocked: adventuresLocked,
        completedMissionIds: context.completedMissionIds,
      });
      if (!mission) return false;

      return launchWeeklyMission({
        mission,
        weekId: context.weekNumber,
        monthId: context.monthId,
        weekTitle: context.weekTitle,
        kidsBasePath: kidsBase,
        pathname: location.pathname,
        characterId: mission.id,
        missionId: mission.targetGameSlug,
        selectedChildId: activeChild?.participantId,
        source,
        baselineLocked: adventuresLocked,
        completedMissionIds: context.completedMissionIds,
        navigate,
      });
    },
    [
      activeChild?.participantId,
      adventuresLocked,
      hasActiveChild,
      kidsBase,
      location.pathname,
      navigate,
      resolveWeekLaunchContext,
    ],
  );

  const completedWeekMissions = useMemo(() => {
    if (rewardSnapshot) {
      return resolveWeekMissionProgressFromSnapshot(rewardSnapshot, heroWeekNumber).completed;
    }
    return countCompletedMapMissions(mapMissions, heroWeekProgress.completedMissionIds);
  }, [heroWeekNumber, heroWeekProgress.completedMissionIds, mapMissions, rewardSnapshot]);

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
  const inventoryPath = familyPortalPath('collections', location.pathname);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development' || !activeChild?.participantId) return;
    const daily = quests.find((quest) => quest.period === 'daily');
    const weekly = quests.find((quest) => quest.period === 'weekly');
    const monthly = quests.find((quest) => quest.period === 'monthly');
    console.info('[QUEST_PROGRESS_DEBUG]', {
      childId: activeChild.participantId,
      weekId: heroWeekId,
      completedMissionIds: completedWeekMissions,
      daily: daily?.progressCount ?? 0,
      weekly: weekly?.progressCount ?? 0,
      monthly: monthly?.progressCount ?? 0,
    });
  }, [activeChild?.participantId, completedWeekMissions, heroWeekId, quests]);

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
        heroCmsModule?.month_number,
      ),
    [adventureMonths, heroCmsModule?.month_number, heroWeekNumber],
  );

  const heroMonthStableWeekModule = useMemo(() => {
    if (!heroMonth) return heroCmsModule;
    const monthSection = journeyMonthSections.find(
      (section) => section.month.monthNumber === heroMonth.month_number,
    );
    const firstWeekNumber = monthSection?.month.weekNumbers[0] ?? heroWeekNumber;
    return (
      adventureModules.find((row) => row.week_number === firstWeekNumber) ?? heroCmsModule
    );
  }, [adventureModules, heroCmsModule, heroMonth, heroWeekNumber, journeyMonthSections]);

  const heroMonthExploreCards = useMemo(() => {
    if (!ENABLE_CINEMATIC_WEEK_SELECTOR || !heroMonth) return [];
    const section = journeyMonthSections.find(
      (row) => row.month.monthNumber === heroMonth.month_number,
    );
    return section?.cards ?? [];
  }, [heroMonth, journeyMonthSections]);

  const currentMonthNumber = resolveDefaultMonthNumber(playableWeekNumber);
  const selectedMonthNumber = heroMonth?.month_number ?? currentMonthNumber;
  const monthSelectorItems = useMemo(
    () =>
      journeyMonthSections.map((section) => ({
        month: section.month,
        cards: section.cards,
        locked:
          visibilityCtx.previewMode !== 'admin' &&
          section.cards.every((card) => card.disabled || card.variant === 'locked'),
      })),
    [journeyMonthSections, visibilityCtx.previewMode],
  );

  const handleSelectMonth = useCallback(
    (monthNumber: number) => {
      const item = monthSelectorItems.find((row) => row.month.monthNumber === monthNumber);
      if (!item || item.locked) return;

      const selectedWeekStillInMonth = item.month.weekNumbers.includes(heroWeekNumber)
        ? item.cards.find((card) => card.weekNumber === heroWeekNumber && !card.disabled)
        : null;
      const targetCard =
        selectedWeekStillInMonth ??
        item.cards.find((card) => !card.disabled && card.variant !== 'locked');
      if (!targetCard) return;

      setSelectedWeekNumber(targetCard.weekNumber);
      const params = new URLSearchParams(searchParams);
      params.set(WEEKLY_MONTH_PARAM, String(monthNumber));
      params.set(WEEKLY_WEEK_PARAM, String(targetCard.weekNumber));
      const nextLocation = {
        pathname: location.pathname,
        search: `?${params.toString()}`,
        hash: weeklyAdventureHeroAnchor(targetCard.weekNumber),
      };

      if (kidPlayShell) {
        kidPlayShellNavigate(navigate, nextLocation);
      } else {
        navigate(nextLocation, { replace: false });
      }
    },
    [heroWeekNumber, kidPlayShell, location.pathname, monthSelectorItems, navigate, searchParams],
  );

  const handleHubViewModeChange = useCallback(
    (mode: CourageHubViewMode) => {
      const params = new URLSearchParams(searchParams);
      params.set(WEEKLY_VIEW_PARAM, mode);
      const nextLocation = {
        pathname: location.pathname,
        search: `?${params.toString()}`,
        hash: location.hash,
      };
      if (kidPlayShell) {
        kidPlayShellNavigate(navigate, nextLocation, { replace: true });
      } else {
        navigate(nextLocation, { replace: true });
      }
    },
    [kidPlayShell, location.hash, location.pathname, navigate, searchParams],
  );

  useEffect(() => {
    if (!requestedMonth || requestedWeek) return;
    if (requestedMonth === selectedMonthNumber) return;
    const item = monthSelectorItems.find((row) => row.month.monthNumber === requestedMonth);
    if (!item || item.locked) return;
    const targetCard = item.cards.find((card) => !card.disabled && card.variant !== 'locked');
    if (targetCard) setSelectedWeekNumber(targetCard.weekNumber);
  }, [monthSelectorItems, requestedMonth, requestedWeek, selectedMonthNumber]);

  const hideLegacyWeekGrid =
    ENABLE_CINEMATIC_WEEK_SELECTOR && !ENABLE_LEGACY_WEEK_GRID && !ENABLE_DARK_ADVENTURE_CENTER;
  const showDarkBottomWeekCards =
    ENABLE_DARK_ADVENTURE_CENTER && ENABLE_CINEMATIC_WEEK_SELECTOR && !ENABLE_LEGACY_WEEK_GRID;

  const mapBackgroundSrc = useMemo(() => {
    const weekModuleForHero = ENABLE_CINEMATIC_WEEK_SELECTOR
      ? heroMonthStableWeekModule
      : heroCmsModule;
    const weekNumberForHero = ENABLE_CINEMATIC_WEEK_SELECTOR
      ? (heroMonthStableWeekModule?.week_number ?? heroWeekNumber)
      : heroWeekNumber;
    const resolution = resolveAdventureMonthHeroSrc({
      month: heroMonth,
      heroWeekModule: weekModuleForHero,
      weekNumber: weekNumberForHero,
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
  }, [heroCmsModule, heroMonth, heroMonthStableWeekModule, heroWeekNumber]);

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
    return reviewWeekTrail.nodes.filter((node) =>
      WEEK_ONE_MISSION_KINDS.includes(node.kind as typeof WEEK_ONE_MISSION_KINDS[number]),
    );
  }, [reviewWeekTrail]);

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
    if (!hash.startsWith('week-hero-') && !hash.startsWith('week-')) return;
    const target = document.getElementById(hash);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash, heroWeekNumber, trailWeeks.length]);

  const hasChildren = selectableChildren.length > 0;
  const showClaimPrompt = !childrenLoading && claimRequired;
  const showAddChildPrompt = !childrenLoading && !claimRequired && !hasChildren;
  const handleSelectChild = useCallback((child: SelectableChild) => {
    if (child.participantId === activeChild?.participantId) return;
    setChildSwitchLoading(true);
    selectChild(child);
  }, [activeChild?.participantId, selectChild]);

  const { totalCoins: focusCoins, loading: focusCoinsLoading } = useFocusCoinWallet();

  const heroPlayerHud = useMemo(() => {
    if (!ENABLE_CINEMATIC_ADVENTURE_MODE || !activeChild) return null;
    return {
      displayName: activeChild.displayName,
      firstName: activeChild.firstName,
      focusCoins,
      focusCoinsLoading: kidPlayShell ? false : focusCoinsLoading,
      weekLabel: resolveWeeklyAdventurePlayerHudWeekLabel({
        weekNumber: heroWeekNumber,
        baselineLocked: adventuresLocked,
      }),
      children: kidPlayShell ? [] : selectableChildren,
      activeParticipantId: activeChild.participantId,
      onSelectChild: kidPlayShell ? undefined : handleSelectChild,
      childSwitchLoading: kidPlayShell ? false : childSwitchLoading || baselineLoading,
    };
  }, [
    activeChild,
    adventuresLocked,
    baselineLoading,
    childSwitchLoading,
    focusCoins,
    focusCoinsLoading,
    heroWeekNumber,
    kidPlayShell,
    selectableChildren,
    handleSelectChild,
  ]);

  return (
    <div
      className={[
        'family-panel',
        kidPlayShell ? 'family-panel--kidPlayShellWorld' : '',
        showCourageHero || kidPlayShell ? 'family-panel--courageHub' : '',
        (ENABLE_DARK_ADVENTURE_CENTER && showCourageHero) || kidPlayShell
          ? 'family-panel--darkAdventureCenter'
          : '',
        (ENABLE_CINEMATIC_ADVENTURE_MODE && showCourageHero) || kidPlayShell
          ? 'family-panel--cinematicAdventure'
          : '',
        !kidPlayShell && childSwitchLoading ? 'family-weeklyChildSwitchShimmer' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {!(ENABLE_CINEMATIC_ADVENTURE_MODE && showCourageHero) && !kidPlayShell ? (
        <div className="family-weeklyTopBar family-weeklyTopBar--withChildLaunch">
          <h1 className="family-weeklyTopBarTitle">Weekly Adventures</h1>
          {hasActiveChild && activeChild ? (
            <div className="family-weeklyTopBarActions">
              <StartChildGameButton
                participantId={activeChild.participantId}
                displayName={activeChild.displayName}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {ENABLE_CINEMATIC_ADVENTURE_MODE && showCourageHero && !kidPlayShell && hasActiveChild && activeChild ? (
        <div className="family-weeklyTopBarActions family-weeklyTopBarActions--cinematic">
          <StartChildGameButton
            participantId={activeChild.participantId}
            displayName={activeChild.displayName}
          />
        </div>
      ) : null}

      {envWarning && !kidPlayShell ? (
        <p className="family-weeklyEnvWarning" role="status">
          {envWarning}
        </p>
      ) : null}

      {showClaimPrompt && !kidPlayShell ? (
        <p className="family-panelHelper family-panelHelper--prominent" role="status">
          Enter Parent/Guardian Email to Find Your Child.
        </p>
      ) : null}

      {showAddChildPrompt && !kidPlayShell ? (
        <p className="family-panelHelper family-panelHelper--prominent" role="status">
          Add your child to begin.
        </p>
      ) : null}

      {!hasActiveChild && hasChildren && !kidPlayShell ? (
        <p className="family-panelHelper family-panelHelper--prominent" role="status">
          Choose your active player to save mission progress and rewards.
        </p>
      ) : null}

      {showCourageHero && heroWeek ? (
        <>
          {!kidPlayShell ? (
            <WeeklyAdventureMonthSelector
              months={monthSelectorItems}
              selectedMonthNumber={selectedMonthNumber}
              currentMonthNumber={currentMonthNumber}
              onSelectMonth={handleSelectMonth}
            />
          ) : null}
          {kidPlayShell && activeChild ? (
            <MyAdventuresDrawer
              participantId={activeChild.participantId}
              displayName={activeChild.displayName}
              currentWeek={heroWeekNumber}
              focusCoins={focusCoins}
              focusCoinsLoading={focusCoinsLoading}
              months={monthSelectorItems}
              selectedMonthNumber={selectedMonthNumber}
              currentMonthNumber={currentMonthNumber}
              selectedMonthRecord={heroMonth}
              onSelectMonth={handleSelectMonth}
            />
          ) : null}
          <section
            id={weeklyAdventureHeroAnchor(heroWeekNumber)}
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
            hideActivitiesTab={kidPlayShell}
            kidPlayShell={kidPlayShell}
            initialViewMode={initialHubView}
            week1ExtrasPaths={weekExtrasPaths}
            questPanel={questPanel}
            mapBackgroundSrc={mapBackgroundSrc}
            mapMissions={mapMissions}
            kidsBasePath={kidsBase}
            adminPreview={visibilityCtx.previewMode === 'admin'}
            comicThumbnailUrl={heroWeek.thumbnailUrl}
            headerTrailing={
              kidPlayShell || ENABLE_CINEMATIC_ADVENTURE_MODE || !hasChildren ? null : (
                <PlayingAsSelector
                  children={selectableChildren}
                  activeParticipantId={activeChild?.participantId}
                  onSelect={handleSelectChild}
                  loading={childSwitchLoading || baselineLoading}
                />
              )
            }
            cinematicAdventureMode={kidPlayShell || ENABLE_CINEMATIC_ADVENTURE_MODE}
            playerHud={kidPlayShell ? null : heroPlayerHud}
            playerHudPlacement="outside"
            monthHeroOverlay={null}
            cinematicWeekSelectorEnabled={ENABLE_CINEMATIC_WEEK_SELECTOR}
            weekSelectorCards={heroMonthExploreCards}
            onWeekSelectorSelectWeek={handleSelectWeek}
            onWeekPillSelectWeek={handleHighlightWeek}
            onWeekSelectorReviewWeek={handleReviewWeek}
            onWeekSelectorLaunchWeek={handleLaunchWeek}
            onViewModeChange={handleHubViewModeChange}
          />
          </section>
        </>
      ) : null}

      {!kidPlayShell && !ENABLE_CINEMATIC_WEEK_SELECTOR ? (
        <div
          className={[
            'weeklyJourneySections',
            showDarkBottomWeekCards ? 'weeklyJourneySections--darkCenter' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-label="Monthly adventure journey"
        >
          {journeyMonthSections.map(({ month, cards }) => {
            const recentlyCompletedCards =
              hideLegacyWeekGrid && !showDarkBottomWeekCards
                ? cards.filter((card) => card.variant === 'complete')
                : [];
            return (
              <WeeklyAdventureJourneyMonth
                key={month.monthNumber}
                month={month}
                cards={cards}
                hideWeekSelectorGrid={hideLegacyWeekGrid}
                recentlyCompletedCards={recentlyCompletedCards}
                darkGlass={showDarkBottomWeekCards}
              />
            );
          })}
        </div>
      ) : null}

      {!kidPlayShell && !allChildrenPlayReady && childrenNeedingSetup.length > 0 ? (
        <WeeklySetupReminderCard
          childrenNeedingSetup={childrenNeedingSetup}
          baselinePath={baselinePath}
        />
      ) : null}

      <RewardClaimModal
        result={rewardClaimResult}
        inventoryPath={inventoryPath}
        inventoryLabel="Collections"
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
