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
import './courage-hub-week-meta-row.css';
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
  week1ExtrasPaths?: Week1ExtrasPaths;
  questPanel?: CourageHubQuestPanelProps;
  mapMissions?: CourageInTheDarkMission[];
  headerTrailing?: React.ReactNode;
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
  baselineLockedLabel = 'Complete B-4 Check-In to unlock',
  mapLocked = false,
  mapBackgroundSrc,
  adminPreview = false,
  initialViewMode,
  embeddedInFamilyPortal = false,
  week1ExtrasPaths,
  questPanel,
  mapMissions,
  headerTrailing,
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
  const showActivitiesTab = embeddedInFamilyPortal || Boolean(week1ExtrasPaths);

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

  const desktopMapPills = useMemo(
    () => (
      <CourageHubControls
        variant="overlay"
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        showQuestsTab={showQuestsTab}
        showActivitiesTab={showActivitiesTab}
        hideUnlockStatus={embeddedInFamilyPortal}
      />
    ),
    [
      embeddedInFamilyPortal,
      handleViewModeChange,
      showActivitiesTab,
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
        iconOnActiveOnly
      />
    ),
    [
      embeddedInFamilyPortal,
      handleViewModeChange,
      showActivitiesTab,
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

  const handleSelectMission = useCallback(
    (mission: CourageInTheDarkMission) => {
      setListComingSoonId(null);
      selectHotspot(mission);
      if (isHotspotLocked(mission)) {
        showToast(getMissionUnlockState(mission).reason, 'info');
      }
      if (!isMobileLayout) {
        updateCardAnchor(mission);
      }
    },
    [
      getMissionUnlockState,
      isHotspotLocked,
      isMobileLayout,
      selectHotspot,
      showToast,
      updateCardAnchor,
    ],
  );

  const handleLaunchFromList = useCallback(
    (mission: CourageInTheDarkMission) => {
      setListComingSoonId(null);
      const launched = launchMission(mission);
      if (!launched && !isHotspotLocked(mission)) {
        setListComingSoonId(mission.id);
      }
    },
    [isHotspotLocked, launchMission],
  );

  const comingSoon = Boolean(selectedHotspot && (!targetHref || comingSoonSlug));
  const locked = selectedHotspot ? isHotspotLocked(selectedHotspot) : false;
  const lockedReason = selectedHotspot ? getMissionUnlockState(selectedHotspot).reason : undefined;

  const missionCard = useMemo(() => {
    if (!selectedHotspot) return null;

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
        selectedHotspotId={selectedHotspot?.id ?? null}
        heroBar={null}
        mapBackgroundSrc={mapBackgroundSrc}
        adminPreviewBadge={adminPreview}
        mapMissions={resolvedMapMissions}
        isHotspotComplete={isHotspotComplete}
        isHotspotLocked={isHotspotLocked}
        animatingHotspotId={animatingHotspotId}
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
      mapBackgroundSrc,
      mapLocked,
      resolvedMapMissions,
      selectedHotspot?.id,
      week,
      weekTitle,
    ],
  );

  const mapWrap = (
    <div className="courageAdventureHubMapWrap">
      {sharedMapCanvas}
      {!isMobileLayout ? (
        <div className="courageMapCanvasHeroOverlay courageMapCanvasHeroOverlay--pillsOnly">
          {desktopMapPills}
        </div>
      ) : null}
      <CourageB4WelcomeOverlay open={showWelcome && !mapLocked && !baselineLocked} onDismiss={dismissWelcome} />
      {!isMobileLayout && cardLayout !== 'sheet' ? missionCard : null}
    </div>
  );

  const baselineHelper = baselineLocked ? (
    <p className="family-panelHelper" role="status">
      {baselineLockedLabel}
    </p>
  ) : null;

  const desktopSidePanel =
    viewMode === 'missions' ? (
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

  const weekMetaRow = (
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
                {cardLayout === 'sheet' ? missionCard : null}
              </div>

              {mobileControlsBar}

              {viewMode === 'missions' ? (
                <div
                  id="courage-hub-panel-missions"
                  role="tabpanel"
                  aria-labelledby="courage-hub-tab-missions"
                  className="courageAdventureHubMobileList"
                >
                  {missionListPanel}
                </div>
              ) : null}

              {viewMode === 'activities' && week1ExtrasPaths ? (
                <div
                  id="courage-hub-panel-activities"
                  role="tabpanel"
                  aria-labelledby="courage-hub-tab-activities"
                  className="courageAdventureHubMobileActivities"
                >
                  {activitiesPanel}
                </div>
              ) : null}

              {viewMode === 'quests' && questListPanel ? (
                <div
                  id="courage-hub-panel-quests"
                  role="tabpanel"
                  aria-labelledby="courage-hub-tab-quests"
                  className="courageAdventureHubMobileQuests"
                >
                  {questListPanel}
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
                viewMode === 'explore' ? 'courageAdventureHubSplit--mapOnly' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              data-view={viewMode}
            >
              <div className="courageAdventureHubSplitMap">
                {mapWrap}
                {cardLayout === 'sheet' ? missionCard : null}
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
