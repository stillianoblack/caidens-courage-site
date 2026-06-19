import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CourageHubViewMode } from './CourageHubViewToggle';
import type { CourageInTheDarkMission } from '../../data/courageInTheDarkMap';
import type { QuestProgressRow } from '../../lib/participantQuestService';
import { useToast } from '../portal-design-system/ToastProvider';
import { useCourageAdventureHub } from '../../hooks/useCourageAdventureHub';
import { useMobileHubLayout } from '../../hooks/useMobileHubLayout';
import { computeCourageMissionCardAnchor } from '../../lib/courageMapCardPosition';
import type { AdventureTrailNodeView } from '../../types/adventureTrail';
import CourageHubControls from './CourageHubControls';
import CourageHubWeekMetaRow from './CourageHubWeekMetaRow';
import CourageB4WelcomeOverlay from './CourageB4WelcomeOverlay';
import { useCourageWeekWelcome } from '../../hooks/useCourageWeekWelcome';
import CourageMapCanvas from './CourageMapCanvas';
import CourageMapMissionCard, {
  type CourageMissionCardAnchor,
} from './CourageMapMissionCard';
import CourageMissionListPanel from './CourageMissionListPanel';
import CourageQuestListPanel from './CourageQuestListPanel';
import { type Week1ExtrasPaths } from './Week1ExtrasCards';
import { CourageHubAudioProvider } from './CourageHubAudioContext';
import HeroCinematicPlayerHud from './HeroCinematicPlayerHud';
import CourageHubMissionControlOverlay from './CourageHubMissionControlOverlay';
import CourageHubBottomHudTray from './CourageHubBottomHudTray';
import {
  CourageHubHudActivitiesStrip,
  CourageHubHudMissionStrip,
  CourageHubHudQuestStrip,
} from './CourageHubBottomHudStrips';
import CourageHubHudExploreWeekStrip from './CourageHubHudExploreWeekStrip';
import HeroExploreOverlay from './HeroExploreOverlay';
import { BASELINE_GATE_MESSAGE } from '../../lib/launchWeeklyMission';
import { ENABLE_BOTTOM_HUD_TRAY } from '../../config/weeklyAdventureFeatures';
import type { HeroCinematicPlayerHudProps } from './HeroCinematicPlayerHud';
import type { WeeklyAdventureJourneyCardItem } from '../../lib/weeklyAdventureWeekCards';
import './courage-hub-week-meta-row.css';
import './hero-cinematic-player-hud.css';
import './courage-hub-mission-control.css';
import './courage-hub-bottom-hud-tray.css';
import './hero-explore-overlay.css';
import './courage-in-the-dark-map.css';
import './courage-adventure-hub.css';
import './courage-b4-welcome.css';
import './courage-quest-list-panel.css';
import './courage-activities-panel.css';

const LazyCourageActivitiesPanel = React.lazy(() => import('./CourageActivitiesPanel'));

const MOBILE_CARD_MQ = '(max-width: 767px)';
const TABLET_CARD_MQ = '(min-width: 768px) and (max-width: 1100px)';

type CardLayout = 'sheet' | 'tablet' | 'float';

function resolveCardLayout(): CardLayout {
  if (typeof window === 'undefined') return 'float';
  if (window.matchMedia(MOBILE_CARD_MQ).matches) return 'sheet';
  if (window.matchMedia(TABLET_CARD_MQ).matches) return 'tablet';
  return 'float';
}

export type CourageHubQuestPanelProps = {
  quests: QuestProgressRow[];
  loading?: boolean;
  claimingKey?: string | null;
  onClaim?: (questKey: string, period: QuestProgressRow['period']) => void;
};

type CourageInTheDarkAdventureHubProps = {
  weekNodes: AdventureTrailNodeView[];
  supplementaryNodes?: AdventureTrailNodeView[];
  weekTitle?: string;
  week?: number;
  weekUnlockStatus?: string;
  selFocus?: string;
  comicThumbnailUrl?: string | null;
  kidsBasePath?: string;
  baselineLocked?: boolean;
  baselineLockedLabel?: string;
  mapLocked?: boolean;
  mapBackgroundSrc?: string;
  adminPreview?: boolean;
  initialViewMode?: CourageHubViewMode;
  embeddedInFamilyPortal?: boolean;
  hideActivitiesTab?: boolean;
  /** @deprecated Use hideActivitiesTab */
  kidPlayShell?: boolean;
  week1ExtrasPaths?: Week1ExtrasPaths;
  questPanel?: CourageHubQuestPanelProps;
  mapMissions?: CourageInTheDarkMission[];
  headerTrailing?: React.ReactNode;
  cinematicWeekSelectorEnabled?: boolean;
  cinematicAdventureMode?: boolean;
  bottomHudTrayEnabled?: boolean;
  playerHud?: HeroCinematicPlayerHudProps | null;
  weekSelectorCards?: WeeklyAdventureJourneyCardItem[];
  onWeekSelectorSelectWeek?: (weekNumber: number) => void;
  onWeekPillSelectWeek?: (weekNumber: number) => void;
  onWeekSelectorReviewWeek?: (weekNumber: number) => void;
  onWeekSelectorLaunchWeek?: (
    weekNumber: number,
    source: 'week-card' | 'week-card-cta',
  ) => boolean;
  /** @deprecated Legacy large Explore overlay — use cinematicWeekSelectorEnabled */
  heroExploreOverlayEnabled?: boolean;
  exploreOverlayWeekCards?: WeeklyAdventureJourneyCardItem[];
  onExploreSelectWeek?: (weekNumber: number) => void;
  onExploreReviewWeek?: (weekNumber: number) => void;
};

export default function CourageInTheDarkAdventureHub({
  weekNodes,
  weekTitle = 'Courage in the Dark',
  week = 1,
  weekUnlockStatus,
  selFocus,
  comicThumbnailUrl,
  kidsBasePath,
  baselineLocked = false,
  baselineLockedLabel = BASELINE_GATE_MESSAGE,
  mapLocked = false,
  mapBackgroundSrc,
  adminPreview = false,
  initialViewMode,
  embeddedInFamilyPortal = false,
  week1ExtrasPaths,
  questPanel,
  mapMissions,
  headerTrailing,
  cinematicWeekSelectorEnabled = false,
  cinematicAdventureMode = false,
  bottomHudTrayEnabled = ENABLE_BOTTOM_HUD_TRAY,
  playerHud = null,
  weekSelectorCards,
  onWeekSelectorSelectWeek,
  onWeekPillSelectWeek,
  onWeekSelectorReviewWeek,
  onWeekSelectorLaunchWeek,
  heroExploreOverlayEnabled = false,
  exploreOverlayWeekCards,
  onExploreSelectWeek,
  onExploreReviewWeek,
  hideActivitiesTab = false,
  kidPlayShell = false,
}: CourageInTheDarkAdventureHubProps) {
  const isMobileLayout = useMobileHubLayout();
  const { showToast } = useToast();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [viewMode, setViewMode] = useState<CourageHubViewMode>(initialViewMode ?? 'explore');
  const [cardLayout, setCardLayout] = useState<CardLayout>(resolveCardLayout);
  const [cardAnchor, setCardAnchor] = useState<CourageMissionCardAnchor | null>(null);
  const [listComingSoonId, setListComingSoonId] = useState<string | null>(null);

  const {
    selectedHotspot,
    comingSoonSlug,
    completedCount,
    totalAdventures,
    isHotspotComplete,
    isHotspotLocked,
    getMissionUnlockState,
    selectHotspot,
    deselectHotspot,
    launchMission,
    resolveMissionHref,
    targetHref,
    animatingHotspotId,
    completedMissionIds,
    mapMissions: resolvedMapMissions,
  } = useCourageAdventureHub({
    weekNodes,
    weekTitle,
    week,
    kidsBasePath,
    baselineLocked,
    mapLocked,
    mapMissions,
  });

  const { showWelcome, dismissWelcome } = useCourageWeekWelcome(week);

  useEffect(() => {
    if (initialViewMode) {
      setViewMode(initialViewMode);
    }
  }, [initialViewMode]);

  const showQuestsTab = Boolean(questPanel);
  const showActivitiesTab =
    !hideActivitiesTab && !kidPlayShell && (embeddedInFamilyPortal || Boolean(week1ExtrasPaths));

  useEffect(() => {
    if (viewMode === 'quests' && !showQuestsTab) {
      setViewMode('explore');
    }
    if (viewMode === 'activities' && !showActivitiesTab) {
      setViewMode('explore');
    }
  }, [viewMode, showQuestsTab, showActivitiesTab]);

  useEffect(() => {
    if (viewMode === 'explore') {
      setListComingSoonId(null);
    }
  }, [viewMode]);

  const handleViewModeChange = useCallback((mode: CourageHubViewMode) => {
    setViewMode(mode);
  }, []);

  const showPlayerHud = Boolean(cinematicAdventureMode && playerHud);

  const desktopMapPills = useMemo(
    () => (
      <CourageHubControls
        variant="overlay"
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        showQuestsTab={showQuestsTab}
        showActivitiesTab={showActivitiesTab}
        hideUnlockStatus={embeddedInFamilyPortal}
        hideCoinBadge={showPlayerHud}
      />
    ),
    [
      embeddedInFamilyPortal,
      handleViewModeChange,
      showActivitiesTab,
      showPlayerHud,
      showQuestsTab,
      viewMode,
    ],
  );

  const mobileControlsBar = useMemo(
    () => (
      <CourageHubControls
        variant="mobileBar"
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        showQuestsTab={showQuestsTab}
        showActivitiesTab={showActivitiesTab}
        hideUnlockStatus={embeddedInFamilyPortal}
        hideCoinBadge={showPlayerHud}
        iconOnActiveOnly
      />
    ),
    [
      embeddedInFamilyPortal,
      handleViewModeChange,
      showActivitiesTab,
      showPlayerHud,
      showQuestsTab,
      viewMode,
    ],
  );

  const updateCardAnchor = useCallback((hotspot: CourageInTheDarkMission | null) => {
    if (!hotspot || !mapRef.current) {
      setCardAnchor(null);
      return;
    }

    const layout = resolveCardLayout();
    if (layout !== 'float') {
      setCardAnchor(null);
      return;
    }

    const rect = mapRef.current.getBoundingClientRect();
    setCardAnchor(computeCourageMissionCardAnchor(hotspot, rect.width, rect.height));
  }, []);

  useEffect(() => {
    const mobileMq = window.matchMedia(MOBILE_CARD_MQ);
    const tabletMq = window.matchMedia(TABLET_CARD_MQ);

    const updateLayout = () => {
      setCardLayout(resolveCardLayout());
      updateCardAnchor(selectedHotspot);
    };

    updateLayout();
    mobileMq.addEventListener('change', updateLayout);
    tabletMq.addEventListener('change', updateLayout);
    window.addEventListener('resize', updateLayout);

    return () => {
      mobileMq.removeEventListener('change', updateLayout);
      tabletMq.removeEventListener('change', updateLayout);
      window.removeEventListener('resize', updateLayout);
    };
  }, [selectedHotspot, updateCardAnchor]);

  useEffect(() => {
    updateCardAnchor(selectedHotspot);
  }, [selectedHotspot, updateCardAnchor]);

  const exploreDirectLaunch = Boolean(cinematicAdventureMode && viewMode === 'explore');
  const showHotspotTooltips = Boolean(exploreDirectLaunch && !isMobileLayout);

  const handleSelectMission = useCallback(
    (mission: CourageInTheDarkMission) => {
      setListComingSoonId(null);

      if (isHotspotLocked(mission)) {
        showToast(getMissionUnlockState(mission).reason, 'info');
        if (!exploreDirectLaunch) {
          selectHotspot(mission);
          if (!isMobileLayout && !cinematicAdventureMode) {
            updateCardAnchor(mission);
          }
        }
        return;
      }

      if (exploreDirectLaunch || cinematicAdventureMode) {
        const launched = launchMission(mission, 'character-hotspot');
        if (!launched) {
          if (exploreDirectLaunch) {
            showToast('Adventure coming soon.', 'info');
            return;
          }
          selectHotspot(mission);
          if (!isMobileLayout) {
            updateCardAnchor(mission);
          }
        }
        return;
      }

      selectHotspot(mission);
      if (!isMobileLayout) {
        updateCardAnchor(mission);
      }
    },
    [
      cinematicAdventureMode,
      exploreDirectLaunch,
      getMissionUnlockState,
      isHotspotLocked,
      isMobileLayout,
      launchMission,
      selectHotspot,
      showToast,
      updateCardAnchor,
    ],
  );

  const handleLaunchFromList = useCallback(
    (mission: CourageInTheDarkMission) => {
      setListComingSoonId(null);
      const launched = launchMission(mission, 'mission-list');
      if (!launched && !isHotspotLocked(mission)) {
        setListComingSoonId(mission.id);
      }
    },
    [isHotspotLocked, launchMission],
  );

  const comingSoon = Boolean(selectedHotspot && (!targetHref || comingSoonSlug));
  const locked = selectedHotspot ? isHotspotLocked(selectedHotspot) : false;
  const lockedReason = selectedHotspot ? getMissionUnlockState(selectedHotspot).reason : undefined;

  const showMissionCard = Boolean(selectedHotspot && !exploreDirectLaunch);

  const missionCard = useMemo(() => {
    if (!showMissionCard || !selectedHotspot) return null;

    return (
      <CourageMapMissionCard
        hotspot={selectedHotspot}
        variant={cardLayout}
        anchor={cardAnchor}
        comingSoon={comingSoon}
        locked={locked}
        lockedReason={lockedReason}
        startHref={targetHref}
        onClose={deselectHotspot}
      />
    );
  }, [
    cardAnchor,
    cardLayout,
    comingSoon,
    deselectHotspot,
    locked,
    lockedReason,
    selectedHotspot,
    showMissionCard,
    targetHref,
  ]);

  const missionListPanel = (
    <CourageMissionListPanel
      week={week}
      mapMissions={resolvedMapMissions}
      completedCount={completedCount}
      totalAdventures={totalAdventures}
      selectedMissionId={selectedHotspot?.id ?? null}
      isMissionComplete={isHotspotComplete}
      isMissionLocked={isHotspotLocked}
      getMissionUnlockReason={(mission) => getMissionUnlockState(mission).reason}
      getMissionHref={resolveMissionHref}
      onSelectMission={handleSelectMission}
      onLaunchMission={handleLaunchFromList}
      comingSoonMissionId={listComingSoonId}
    />
  );

  const questListPanel = questPanel ? (
    <CourageQuestListPanel
      quests={questPanel.quests}
      loading={questPanel.loading}
      claimingKey={questPanel.claimingKey}
      onClaim={questPanel.onClaim}
    />
  ) : null;

  const activitiesPanel =
    viewMode === 'activities' && week1ExtrasPaths ? (
      <Suspense fallback={<p className="courageActivitiesPanelLoading">Loading activities…</p>}>
        <LazyCourageActivitiesPanel
          completedMissionIds={completedMissionIds}
          paths={week1ExtrasPaths}
        />
      </Suspense>
    ) : null;

  const sharedMapCanvas = useMemo(
    () => (
      <CourageMapCanvas
        ref={mapRef}
        variant="hub"
        mapSize="full"
        week={week}
        weekTitle={weekTitle}
        mapLocked={mapLocked}
        baselineLocked={baselineLocked}
        requiredHotspotId={baselineLocked ? 'b4' : null}
        selectedHotspotId={selectedHotspot?.id ?? null}
        heroBar={null}
        mapBackgroundSrc={mapBackgroundSrc}
        adminPreviewBadge={adminPreview}
        mapMissions={resolvedMapMissions}
        isHotspotComplete={isHotspotComplete}
        isHotspotLocked={isHotspotLocked}
        getHotspotLockedReason={(mission) => getMissionUnlockState(mission).reason}
        animatingHotspotId={animatingHotspotId}
        enableHotspotTooltips={showHotspotTooltips}
        onSelectHotspot={handleSelectMission}
      />
    ),
    [
      adminPreview,
      animatingHotspotId,
      baselineLocked,
      handleSelectMission,
      isHotspotComplete,
      isHotspotLocked,
      getMissionUnlockState,
      mapBackgroundSrc,
      mapLocked,
      resolvedMapMissions,
      selectedHotspot?.id,
      showHotspotTooltips,
      week,
      weekTitle,
    ],
  );

  const showCinematicSelector = Boolean(
    cinematicWeekSelectorEnabled &&
      weekSelectorCards &&
      weekSelectorCards.length > 0 &&
      viewMode === 'explore' &&
      onWeekSelectorSelectWeek &&
      onWeekSelectorReviewWeek,
  );

  const handleWeekCardLaunch = useCallback(
    (weekNumber: number, source: 'week-card' | 'week-card-cta') => {
      if (isMobileLayout) {
        if (weekNumber !== week) {
          onWeekSelectorSelectWeek?.(weekNumber);
        }
        setViewMode('missions');
        return true;
      }

      if (onWeekSelectorLaunchWeek?.(weekNumber, source)) {
        return true;
      }
      return false;
    },
    [isMobileLayout, onWeekSelectorLaunchWeek, onWeekSelectorSelectWeek, week],
  );

  const exploreWeekStrip =
    showCinematicSelector && weekSelectorCards && onWeekSelectorSelectWeek && onWeekSelectorReviewWeek ? (
      <CourageHubHudExploreWeekStrip
        cards={weekSelectorCards}
        selectedWeekNumber={week}
        baselineLocked={baselineLocked}
        onSelectWeek={onWeekSelectorSelectWeek}
        onPillSelectWeek={onWeekPillSelectWeek}
        onReviewWeek={onWeekSelectorReviewWeek}
        onLaunchWeek={onWeekSelectorLaunchWeek ? handleWeekCardLaunch : undefined}
      />
    ) : null;

  const bottomHudTrayContent =
    viewMode === 'explore'
      ? exploreWeekStrip
      : viewMode === 'missions'
        ? (
            <CourageHubHudMissionStrip
              mapMissions={resolvedMapMissions}
              isMissionComplete={isHotspotComplete}
              isMissionLocked={isHotspotLocked}
              onLaunchMission={handleLaunchFromList}
              comingSoonMissionId={listComingSoonId}
            />
          )
        : viewMode === 'activities' && week1ExtrasPaths
          ? (
              <CourageHubHudActivitiesStrip
                completedMissionIds={completedMissionIds}
                paths={week1ExtrasPaths}
              />
            )
          : viewMode === 'quests' && questPanel
            ? (
                <CourageHubHudQuestStrip
                  quests={questPanel.quests}
                  loading={questPanel.loading}
                  claimingKey={questPanel.claimingKey}
                  onClaim={questPanel.onClaim}
                />
              )
            : null;

  const missionControlContent =
    viewMode === 'missions'
      ? missionListPanel
      : viewMode === 'activities' && week1ExtrasPaths
        ? activitiesPanel
        : viewMode === 'quests' && questListPanel
          ? questListPanel
          : null;

  const showBottomHudTray = Boolean(
    bottomHudTrayEnabled &&
      cinematicAdventureMode &&
      !isMobileLayout &&
      bottomHudTrayContent,
  );

  const showMissionControlOverlay = Boolean(
    !bottomHudTrayEnabled &&
      cinematicAdventureMode &&
      !isMobileLayout &&
      viewMode !== 'explore' &&
      missionControlContent,
  );

  const missionControlTitle =
    viewMode === 'missions'
      ? 'Mission Control'
      : viewMode === 'activities'
        ? 'Activities & Resources'
        : viewMode === 'quests'
          ? 'Focus Quests'
          : '';

  const missionControlSubtitle =
    viewMode === 'missions'
      ? `${completedCount}/${totalAdventures} complete`
      : undefined;

  const hudPillAriaLabel =
    viewMode === 'explore'
      ? 'Week adventures'
      : viewMode === 'missions'
        ? 'Week missions'
        : viewMode === 'activities'
          ? 'Week activities'
          : viewMode === 'quests'
            ? 'Focus quests'
            : '';

  const useHudPills = Boolean(bottomHudTrayEnabled && cinematicAdventureMode);

  const showExploreOverlay = Boolean(
    !cinematicWeekSelectorEnabled &&
      heroExploreOverlayEnabled &&
      exploreOverlayWeekCards &&
      exploreOverlayWeekCards.length > 0 &&
      viewMode === 'explore' &&
      onExploreSelectWeek &&
      onExploreReviewWeek,
  );

  const exploreOverlayPanel =
    showExploreOverlay && exploreOverlayWeekCards && onExploreSelectWeek && onExploreReviewWeek ? (
      <HeroExploreOverlay
        cards={exploreOverlayWeekCards}
        selectedWeekNumber={week}
        onSelectWeek={onExploreSelectWeek}
        onReviewWeek={onExploreReviewWeek}
        layout={isMobileLayout ? 'stacked' : 'overlay'}
      />
    ) : null;

  const hideWeekMetaHeader = showCinematicSelector || (cinematicAdventureMode && showPlayerHud);

  const mapWrap = (
    <div
      className={[
        'courageAdventureHubMapWrap',
        cinematicAdventureMode ? 'courageAdventureHubMapWrap--cinematic' : '',
        showCinematicSelector ? 'courageAdventureHubMapWrap--cinematic' : '',
        showBottomHudTray ? 'courageAdventureHubMapWrap--bottomTray' : '',
        showExploreOverlay && !isMobileLayout ? 'courageAdventureHubMapWrap--exploreOverlay' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {sharedMapCanvas}
      {!isMobileLayout ? (
        <div className="courageMapCanvasHeroOverlay courageMapCanvasHeroOverlay--pillsOnly">
          {desktopMapPills}
        </div>
      ) : null}
      {showPlayerHud && playerHud ? (
        <div className="courageMapCanvasHeroOverlay courageMapCanvasHeroOverlay--playerHud">
          <HeroCinematicPlayerHud {...playerHud} />
        </div>
      ) : null}
      {!showPlayerHud && hideWeekMetaHeader && headerTrailing ? (
        <div className="courageMapCanvasHeroOverlay courageMapCanvasHeroOverlay--playingAs">
          {headerTrailing}
        </div>
      ) : null}
      <CourageB4WelcomeOverlay open={showWelcome && !mapLocked && !baselineLocked} onDismiss={dismissWelcome} />
      {!isMobileLayout &&
      cardLayout !== 'sheet' &&
      showMissionCard &&
      (!cinematicAdventureMode || (selectedHotspot && (locked || comingSoon)))
        ? missionCard
        : null}
      {showExploreOverlay && !isMobileLayout ? exploreOverlayPanel : null}
      {showBottomHudTray && bottomHudTrayContent ? (
        <CourageHubBottomHudTray
          ariaLabel={hudPillAriaLabel}
          className={viewMode === 'explore' ? 'courageHubHudPillDock--explore' : ''}
        >
          {bottomHudTrayContent}
        </CourageHubBottomHudTray>
      ) : null}
      {showMissionControlOverlay && missionControlContent ? (
        <CourageHubMissionControlOverlay
          title={missionControlTitle}
          subtitle={missionControlSubtitle}
          onBackToExplore={() => handleViewModeChange('explore')}
        >
          {missionControlContent}
        </CourageHubMissionControlOverlay>
      ) : null}
    </div>
  );

  const baselineHelper = baselineLocked ? (
    <p className="family-panelHelper" role="status">
      {baselineLockedLabel}
    </p>
  ) : null;

  const desktopSidePanel =
    cinematicAdventureMode || viewMode === 'explore' ? null : viewMode === 'missions' ? (
      missionListPanel
    ) : viewMode === 'activities' && week1ExtrasPaths ? (
      activitiesPanel
    ) : viewMode === 'quests' && questListPanel ? (
      questListPanel
    ) : null;

  const desktopPanelId =
    viewMode === 'explore'
      ? 'courage-hub-panel-explore'
      : viewMode === 'missions'
        ? 'courage-hub-panel-missions'
        : viewMode === 'activities'
          ? 'courage-hub-panel-activities'
          : viewMode === 'quests'
            ? 'courage-hub-panel-quests'
            : undefined;

  const desktopPanelLabelledBy =
    viewMode === 'explore'
      ? 'courage-hub-tab-explore'
      : viewMode === 'missions'
        ? 'courage-hub-tab-missions'
        : viewMode === 'activities'
          ? 'courage-hub-tab-activities'
          : viewMode === 'quests'
            ? 'courage-hub-tab-quests'
            : undefined;

  const weekMetaRow =
    hideWeekMetaHeader ? null : (
      <CourageHubWeekMetaRow
        week={week}
        weekTitle={weekTitle}
        selFocus={selFocus}
        comicThumbnailUrl={comicThumbnailUrl}
        headerTrailing={headerTrailing}
      />
    );

  return (
    <CourageHubAudioProvider>
      <div
        className={[
          'courageAdventureHub',
          'portal-gameFrame',
          cinematicWeekSelectorEnabled || cinematicAdventureMode ? 'courageAdventureHub--cinematic' : '',
          cinematicAdventureMode ? 'courageAdventureHub--adventureMode' : '',
          isMobileLayout ? 'courageAdventureHub--mobileStack' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label="Courage in the Dark adventure hub"
      >
        <div className="courageAdventureHubMapCol">
          {weekMetaRow}

          {isMobileLayout ? (
            <div className="courageAdventureHubMobileStack">
              <div
                id="courage-hub-panel-map"
                className="courageAdventureHubView courageAdventureHubView--map"
              >
                {mapWrap}
                {showMissionCard && cardLayout === 'sheet' ? missionCard : null}
              </div>

              {mobileControlsBar}

              {showExploreOverlay ? exploreOverlayPanel : null}

              {viewMode === 'explore' && showCinematicSelector && exploreWeekStrip ? (
                <div
                  id="courage-hub-panel-explore"
                  role="tabpanel"
                  aria-labelledby="courage-hub-tab-explore"
                  className="courageHubMobileHudPills courageHubMobileHudPills--explore"
                >
                  {exploreWeekStrip}
                </div>
              ) : null}

              {viewMode === 'missions' ? (
                <div
                  id="courage-hub-panel-missions"
                  role="tabpanel"
                  aria-labelledby="courage-hub-tab-missions"
                  className={
                    useHudPills
                      ? 'courageHubMobileHudPills'
                      : cinematicAdventureMode
                        ? 'courageHubMobileDarkSection'
                        : 'courageAdventureHubMobileList'
                  }
                >
                  {useHudPills ? bottomHudTrayContent : missionListPanel}
                </div>
              ) : null}

              {viewMode === 'activities' && week1ExtrasPaths ? (
                <div
                  id="courage-hub-panel-activities"
                  role="tabpanel"
                  aria-labelledby="courage-hub-tab-activities"
                  className={
                    useHudPills
                      ? 'courageHubMobileHudPills'
                      : cinematicAdventureMode
                        ? 'courageHubMobileDarkSection'
                        : 'courageAdventureHubMobileActivities'
                  }
                >
                  {useHudPills ? bottomHudTrayContent : activitiesPanel}
                </div>
              ) : null}

              {viewMode === 'quests' && (useHudPills ? bottomHudTrayContent : questListPanel) ? (
                <div
                  id="courage-hub-panel-quests"
                  role="tabpanel"
                  aria-labelledby="courage-hub-tab-quests"
                  className={
                    useHudPills
                      ? 'courageHubMobileHudPills'
                      : cinematicAdventureMode
                        ? 'courageHubMobileDarkSection'
                        : 'courageAdventureHubMobileQuests'
                  }
                >
                  {useHudPills ? bottomHudTrayContent : questListPanel}
                </div>
              ) : null}

              {baselineHelper}
            </div>
          ) : (
            <div
              id={desktopPanelId}
              role="tabpanel"
              aria-labelledby={desktopPanelLabelledBy}
              className={[
                'courageAdventureHubSplit',
                viewMode === 'explore' || cinematicAdventureMode
                  ? 'courageAdventureHubSplit--mapOnly'
                  : '',
                cinematicAdventureMode ? 'courageAdventureHubSplit--cinematic' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              data-view={viewMode}
            >
              <div className="courageAdventureHubSplitMap">
                {mapWrap}
                {showMissionCard && cardLayout === 'sheet' ? missionCard : null}
              </div>
              {desktopSidePanel}
            </div>
          )}

          {!isMobileLayout ? baselineHelper : null}
        </div>
      </div>
    </CourageHubAudioProvider>
  );
}
