import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CourageHubViewMode } from './CourageHubViewToggle';
import type { CourageInTheDarkMission } from '../../data/courageInTheDarkMap';
import type { QuestProgressRow } from '../../lib/participantQuestService';
import { useToast } from '../portal-design-system/ToastProvider';
import { useCourageAdventureHub } from '../../hooks/useCourageAdventureHub';
import { useMobileHubLayout } from '../../hooks/useMobileHubLayout';
import { computeCourageMissionCardAnchor } from '../../lib/courageMapCardPosition';
import type { AdventureTrailNodeView } from '../../types/adventureTrail';
import CourageHubHeroBar from './CourageHubHeroBar';
import CourageHubHeaderCopy from './CourageHubHeaderCopy';
import CourageHubControls from './CourageHubControls';
import CourageB4WelcomeOverlay from './CourageB4WelcomeOverlay';
import { useCourageWeekWelcome } from '../../hooks/useCourageWeekWelcome';
import CourageMapCanvas from './CourageMapCanvas';
import CourageMapMissionCard, {
  type CourageMissionCardAnchor,
} from './CourageMapMissionCard';
import CourageMissionListPanel from './CourageMissionListPanel';
import CourageMissionListView from './CourageMissionListView';
import CourageQuestListPanel from './CourageQuestListPanel';
import CourageQuestListView from './CourageQuestListView';
import CourageActivitiesListView from './CourageActivitiesListView';
import CourageActivitiesPanel from './CourageActivitiesPanel';
import { type Week1ExtrasPaths } from './Week1ExtrasCards';
import { CourageHubAudioProvider } from './CourageHubAudioContext';
import './courage-in-the-dark-map.css';
import './courage-adventure-hub.css';
import './courage-b4-welcome.css';
import './courage-quest-list-panel.css';
import './courage-activities-panel.css';

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
};

export default function CourageInTheDarkAdventureHub({
  weekNodes,
  weekTitle = 'Courage in the Dark',
  week = 1,
  weekUnlockStatus,
  selFocus,
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
  } = useCourageAdventureHub({
    weekNodes,
    weekTitle,
    week,
    kidsBasePath,
    baselineLocked,
    mapLocked,
  });

  const { showWelcome, dismissWelcome } = useCourageWeekWelcome(week);

  useEffect(() => {
    if (initialViewMode) {
      setViewMode(initialViewMode);
    }
  }, [initialViewMode]);

  const showFamilyMobileControls = embeddedInFamilyPortal && isMobileLayout;
  const showQuestsTab = Boolean(questPanel);
  const showActivitiesTab = Boolean(week1ExtrasPaths);

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

  const handleViewModeChange = useCallback(
    (mode: CourageHubViewMode) => {
      setViewMode(mode);
      if (mode === 'explore') {
        deselectHotspot();
      }
    },
    [deselectHotspot],
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
      if (viewMode === 'explore' && !isMobileLayout) {
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
      viewMode,
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

  const desktopHeroBar = (
    <CourageHubHeroBar
      variant="overlay"
      week={week}
      weekTitle={weekTitle}
      selFocus={selFocus}
      weekUnlockStatus={weekUnlockStatus}
      viewMode={viewMode}
      onViewModeChange={handleViewModeChange}
      showQuestsTab={showQuestsTab}
      showActivitiesTab={showActivitiesTab}
    />
  );

  const missionCard = useMemo(() => {
    if (!selectedHotspot) return null;
    if (!isMobileLayout && viewMode !== 'explore') return null;

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
    isMobileLayout,
    locked,
    lockedReason,
    selectedHotspot,
    targetHref,
    viewMode,
  ]);

  const missionListPanel = (
    <CourageMissionListPanel
      week={week}
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

  const mapCanvas = (mapSize: 'full' | 'split', heroBar: React.ReactNode | null) => (
    <div className="courageAdventureHubMapWrap">
      <CourageMapCanvas
        ref={mapRef}
        variant="hub"
        mapSize={mapSize}
        week={week}
        weekTitle={weekTitle}
        weekUnlockStatus={weekUnlockStatus}
        selFocus={selFocus}
        mapLocked={mapLocked}
        baselineLocked={baselineLocked}
        selectedHotspotId={selectedHotspot?.id ?? null}
        heroBar={heroBar}
        mapBackgroundSrc={mapBackgroundSrc}
        adminPreviewBadge={adminPreview}
        isHotspotComplete={isHotspotComplete}
        isHotspotLocked={isHotspotLocked}
        animatingHotspotId={animatingHotspotId}
        onSelectHotspot={handleSelectMission}
      />
      <CourageB4WelcomeOverlay open={showWelcome && !mapLocked && !baselineLocked} onDismiss={dismissWelcome} />
      {!isMobileLayout && viewMode === 'explore' && cardLayout !== 'sheet' ? missionCard : null}
    </div>
  );

  const baselineHelper = baselineLocked ? (
    <p className="family-panelHelper" role="status">
      {baselineLockedLabel}
    </p>
  ) : null;

  const splitMapSlot = mapCanvas('split', desktopHeroBar);

  const desktopSplitView =
    viewMode === 'missions' ? (
      <CourageMissionListView
        week={week}
        viewMode={viewMode}
        mapSlot={splitMapSlot}
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
    ) : viewMode === 'activities' && week1ExtrasPaths ? (
      <CourageActivitiesListView
        viewMode={viewMode}
        mapSlot={splitMapSlot}
        completedMissionIds={completedMissionIds}
        paths={week1ExtrasPaths}
      />
    ) : viewMode === 'quests' && questListPanel ? (
      <CourageQuestListView
        viewMode={viewMode}
        mapSlot={splitMapSlot}
        quests={questPanel!.quests}
        loading={questPanel!.loading}
        claimingKey={questPanel!.claimingKey}
        onClaim={questPanel!.onClaim}
      />
    ) : null;

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
          {isMobileLayout ? (
            <div className="courageAdventureHubMobileStack">
              <CourageHubHeaderCopy
                week={week}
                weekTitle={weekTitle}
                selFocus={selFocus}
                variant="mobile"
              />

              <div
                id="courage-hub-panel-explore"
                role="tabpanel"
                aria-labelledby="courage-hub-tab-explore"
                className="courageAdventureHubView courageAdventureHubView--map"
              >
                {mapCanvas('full', null)}
                {cardLayout === 'sheet' ? missionCard : null}
              </div>

              {showFamilyMobileControls || !embeddedInFamilyPortal ? (
                <CourageHubControls
                  variant="mobileBar"
                  viewMode={viewMode}
                  onViewModeChange={handleViewModeChange}
                  weekUnlockStatus={weekUnlockStatus}
                  showQuestsTab={showQuestsTab}
                  showActivitiesTab={showActivitiesTab}
                />
              ) : null}

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
                  <CourageActivitiesPanel
                    completedMissionIds={completedMissionIds}
                    paths={week1ExtrasPaths}
                  />
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
          ) : viewMode === 'explore' ? (
            <div
              id="courage-hub-panel-explore"
              role="tabpanel"
              aria-labelledby="courage-hub-tab-explore"
              className="courageAdventureHubView courageAdventureHubView--map"
            >
              {mapCanvas('full', desktopHeroBar)}
              {cardLayout === 'sheet' ? missionCard : null}
            </div>
          ) : (
            desktopSplitView
          )}

          {!isMobileLayout ? baselineHelper : null}
        </div>
      </div>
    </CourageHubAudioProvider>
  );
}
