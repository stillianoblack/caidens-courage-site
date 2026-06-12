import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CourageInTheDarkMission } from '../../data/courageInTheDarkMap';
import { useToast } from '../portal-design-system/ToastProvider';
import { useCourageAdventureHub } from '../../hooks/useCourageAdventureHub';
import { useMobileHubLayout } from '../../hooks/useMobileHubLayout';
import { computeCourageMissionCardAnchor } from '../../lib/courageMapCardPosition';
import type { AdventureTrailNodeView } from '../../types/adventureTrail';
import TrailNode from '../../design-system/components/TrailNode';
import CourageHubHeroBar from './CourageHubHeroBar';
import CourageHubHeaderCopy from './CourageHubHeaderCopy';
import CourageHubControls from './CourageHubControls';
import CourageB4WelcomeOverlay from './CourageB4WelcomeOverlay';
import type { CourageHubViewMode } from './CourageHubViewToggle';
import { useCourageWeekWelcome } from '../../hooks/useCourageWeekWelcome';
import CourageMapCanvas from './CourageMapCanvas';
import CourageMapMissionCard, {
  type CourageMissionCardAnchor,
} from './CourageMapMissionCard';
import CourageMissionListPanel from './CourageMissionListPanel';
import CourageMissionListView from './CourageMissionListView';
import { CourageHubAudioProvider } from './CourageHubAudioContext';
import './courage-in-the-dark-map.css';
import './courage-adventure-hub.css';
import './courage-b4-welcome.css';

const MOBILE_CARD_MQ = '(max-width: 767px)';
const TABLET_CARD_MQ = '(min-width: 768px) and (max-width: 1100px)';

type CardLayout = 'sheet' | 'tablet' | 'float';

function resolveCardLayout(): CardLayout {
  if (typeof window === 'undefined') return 'float';
  if (window.matchMedia(MOBILE_CARD_MQ).matches) return 'sheet';
  if (window.matchMedia(TABLET_CARD_MQ).matches) return 'tablet';
  return 'float';
}

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
};

export default function CourageInTheDarkAdventureHub({
  weekNodes,
  supplementaryNodes = [],
  weekTitle = 'Courage in the Dark',
  week = 1,
  weekUnlockStatus,
  selFocus,
  kidsBasePath,
  baselineLocked = false,
  baselineLockedLabel = 'Complete B-4 Check-In to unlock',
  mapLocked = false,
}: CourageInTheDarkAdventureHubProps) {
  const isMobileLayout = useMobileHubLayout();
  const { showToast } = useToast();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [viewMode, setViewMode] = useState<CourageHubViewMode>('map');
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
    startAdventure,
    targetHref,
    animatingHotspotId,
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
    if (viewMode === 'map') {
      setListComingSoonId(null);
    }
  }, [viewMode]);

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
      if (viewMode === 'map' && !isMobileLayout) {
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
      onViewModeChange={setViewMode}
    />
  );

  const missionCard = useMemo(() => {
    if (!selectedHotspot) return null;
    if (!isMobileLayout && viewMode !== 'map') return null;

    return (
      <CourageMapMissionCard
        hotspot={selectedHotspot}
        variant={cardLayout}
        anchor={cardAnchor}
        comingSoon={comingSoon}
        locked={locked}
        lockedReason={lockedReason}
        onClose={deselectHotspot}
        onStart={startAdventure}
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
    startAdventure,
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
      onSelectMission={handleSelectMission}
      onLaunchMission={handleLaunchFromList}
      comingSoonMissionId={listComingSoonId}
    />
  );

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
        isHotspotComplete={isHotspotComplete}
        isHotspotLocked={isHotspotLocked}
        animatingHotspotId={animatingHotspotId}
        onSelectHotspot={handleSelectMission}
      />
      <CourageB4WelcomeOverlay open={showWelcome && !mapLocked && !baselineLocked} onDismiss={dismissWelcome} />
      {!isMobileLayout && viewMode === 'map' && cardLayout !== 'sheet' ? missionCard : null}
    </div>
  );

  const supplementarySection =
    supplementaryNodes.length > 0 ? (
      <div className="courageMapSupplementary courageMapSupplementary--hero">
        {supplementaryNodes.map((node) => (
          <TrailNode
            key={node.id}
            node={node}
            lockedHelperText={
              node.state === 'locked' && baselineLocked ? baselineLockedLabel : undefined
            }
          />
        ))}
      </div>
    ) : null;

  const baselineHelper = baselineLocked ? (
    <p className="family-panelHelper" role="status">
      {baselineLockedLabel}
    </p>
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
                id="courage-hub-panel-map"
                role="tabpanel"
                aria-labelledby="courage-hub-tab-map"
                className="courageAdventureHubView courageAdventureHubView--map"
              >
                {mapCanvas('full', null)}
                {cardLayout === 'sheet' ? missionCard : null}
              </div>

              <CourageHubControls
                variant="mobileBar"
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                weekUnlockStatus={weekUnlockStatus}
              />

              {viewMode === 'list' ? (
                <div
                  id="courage-hub-panel-list"
                  role="tabpanel"
                  aria-labelledby="courage-hub-tab-list"
                  className="courageAdventureHubMobileList"
                >
                  {missionListPanel}
                </div>
              ) : null}

              {baselineHelper}
              {supplementarySection}
            </div>
          ) : viewMode === 'map' ? (
            <div
              id="courage-hub-panel-map"
              role="tabpanel"
              aria-labelledby="courage-hub-tab-map"
              className="courageAdventureHubView courageAdventureHubView--map"
            >
              {mapCanvas('full', desktopHeroBar)}
              {cardLayout === 'sheet' ? missionCard : null}
            </div>
          ) : (
            <div className="courageAdventureHubView courageAdventureHubView--list">
              <CourageMissionListView
                week={week}
                viewMode={viewMode}
                mapSlot={mapCanvas('split', desktopHeroBar)}
                completedCount={completedCount}
                totalAdventures={totalAdventures}
                selectedMissionId={selectedHotspot?.id ?? null}
                isMissionComplete={isHotspotComplete}
                isMissionLocked={isHotspotLocked}
                getMissionUnlockReason={(mission) => getMissionUnlockState(mission).reason}
                onSelectMission={handleSelectMission}
                onLaunchMission={handleLaunchFromList}
                comingSoonMissionId={listComingSoonId}
              />
            </div>
          )}

          {!isMobileLayout ? (
            <>
              {baselineHelper}
              {supplementarySection}
            </>
          ) : null}
        </div>
      </div>
    </CourageHubAudioProvider>
  );
}
