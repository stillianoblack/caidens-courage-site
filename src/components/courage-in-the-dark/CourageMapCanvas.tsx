import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { useCourageHubAudio } from './CourageHubAudioContext';
import CourageMapHotspotTooltip from './CourageMapHotspotTooltip';
import { isKidShellDisplayImageUrl } from '../../lib/kidShellDisplayImages';
import {
  courageInTheDarkMissions,
  type CourageInTheDarkMission,
} from '../../data/courageInTheDarkMap';

function MapHotspotToken({ src, className }: { src: string; className: string }) {
  const [failed, setFailed] = useState(false);
  if (!isKidShellDisplayImageUrl(src) || failed) return null;
  return (
    <img
      src={src}
      alt=""
      className={className}
      width={120}
      height={180}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

type CourageMapCanvasProps = {
  variant?: 'hub' | 'embedded';
  mapSize?: 'full' | 'split';
  week?: number;
  weekTitle?: string;
  weekUnlockStatus?: string;
  selFocus?: string;
  mapLocked?: boolean;
  baselineLocked?: boolean;
  requiredHotspotId?: string | null;
  selectedHotspotId?: string | null;
  heroBar?: React.ReactNode;
  mapBackgroundSrc?: string;
  adminPreviewBadge?: boolean;
  mapMissions?: CourageInTheDarkMission[];
  isHotspotComplete: (hotspot: CourageInTheDarkMission) => boolean;
  isHotspotLocked: (hotspot: CourageInTheDarkMission) => boolean;
  getHotspotLockedReason?: (hotspot: CourageInTheDarkMission) => string | undefined;
  animatingHotspotId?: string | null;
  enableHotspotTooltips?: boolean;
  onSelectHotspot: (hotspot: CourageInTheDarkMission) => void;
};

const CourageMapCanvas = forwardRef<HTMLDivElement, CourageMapCanvasProps>(function CourageMapCanvas(
  {
    variant = 'hub',
    mapSize = 'full',
    week = 1,
    weekTitle = 'Courage in the Dark',
    mapLocked = false,
    baselineLocked = false,
    requiredHotspotId = null,
    selectedHotspotId = null,
    heroBar,
    mapBackgroundSrc,
    adminPreviewBadge = false,
    mapMissions = courageInTheDarkMissions,
    isHotspotComplete,
    isHotspotLocked,
    getHotspotLockedReason,
    animatingHotspotId = null,
    enableHotspotTooltips = false,
    onSelectHotspot,
  },
  ref,
) {
  const isHub = variant === 'hub';
  const { playClick } = useCourageHubAudio();
  const [imageFailed, setImageFailed] = useState(false);
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);
  const [focusedHotspotId, setFocusedHotspotId] = useState<string | null>(null);
  const tooltipCloseTimerRef = useRef<number | null>(null);
  const resolvedBackground = mapBackgroundSrc?.trim() ?? '';
  const showImage = Boolean(resolvedBackground) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [resolvedBackground]);

  const handleImageError = useCallback(() => {
    setImageFailed(true);
    if (process.env.NODE_ENV === 'development') {
      console.warn('[WEEKLY_ADVENTURE_MAP] Failed to load map background:', resolvedBackground);
    }
  }, [resolvedBackground]);

  const handleHotspotClick = useCallback(
    (hotspot: CourageInTheDarkMission) => {
      playClick();
      onSelectHotspot(hotspot);
    },
    [onSelectHotspot, playClick],
  );

  const clearTooltipCloseTimer = useCallback(() => {
    if (tooltipCloseTimerRef.current !== null) {
      window.clearTimeout(tooltipCloseTimerRef.current);
      tooltipCloseTimerRef.current = null;
    }
  }, []);

  const scheduleTooltipClose = useCallback(() => {
    clearTooltipCloseTimer();
    tooltipCloseTimerRef.current = window.setTimeout(() => {
      setHoveredHotspotId(null);
    }, 180);
  }, [clearTooltipCloseTimer]);

  useEffect(() => () => clearTooltipCloseTimer(), [clearTooltipCloseTimer]);

  const tooltipHotspot = enableHotspotTooltips
    ? mapMissions.find((row) => row.id === (hoveredHotspotId ?? focusedHotspotId)) ?? null
    : null;

  return (
    <div
      ref={ref}
      className={[
        'courageMapCanvas',
        isHub ? 'courageMapCanvas--hub' : '',
        isHub && mapSize === 'split' ? 'courageMapCanvas--hubSplit' : '',
        showImage ? 'courageMapCanvas--hasImage' : '',
        mapLocked || baselineLocked ? 'courageMapCanvas--locked' : '',
        baselineLocked ? 'courageMapCanvas--baselineGate' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {showImage ? (
        <img
          key={resolvedBackground}
          src={resolvedBackground}
          alt=""
          className="courageMapBg"
          width={1600}
          height={900}
          decoding="async"
          loading="eager"
          onError={handleImageError}
        />
      ) : (
        <div className="courageMapBg courageMapBg--placeholder" aria-hidden="true" />
      )}

      {adminPreviewBadge ? (
        <span className="courageMapAdminPreviewBadge" role="status">
          ADMIN PREVIEW
        </span>
      ) : null}

      {isHub && heroBar ? (
        <div className="courageMapCanvasHeroOverlay courageMapCanvasHeroOverlay--interactive">
          {heroBar}
        </div>
      ) : null}

      <div className="courageMapHotspots">
        {mapMissions.map((hotspot) => {
          const locked = isHotspotLocked(hotspot);
          const required = baselineLocked && requiredHotspotId === hotspot.id;
          const complete = isHotspotComplete(hotspot);
          const selected = selectedHotspotId === hotspot.id;
          const justCompleted = animatingHotspotId === hotspot.id;
          const tooltipId = `courage-map-hotspot-tip-${hotspot.id}`;

          return (
            <button
              key={hotspot.id}
              type="button"
              className={[
                'courageMapHotspot',
                selected ? 'courageMapHotspot--selected' : '',
                complete ? 'courageMapHotspot--complete' : '',
                locked ? 'courageMapHotspot--locked' : '',
                required ? 'courageMapHotspot--required' : '',
                justCompleted ? 'courageMapHotspot--justComplete' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              data-color={hotspot.color}
              style={{
                left: `${hotspot.position.x}%`,
                top: `${hotspot.position.y}%`,
                width: `${hotspot.size.width}%`,
              }}
              onClick={() => handleHotspotClick(hotspot)}
              onMouseEnter={() => {
                if (!enableHotspotTooltips) return;
                clearTooltipCloseTimer();
                setHoveredHotspotId(hotspot.id);
              }}
              onMouseLeave={() => {
                if (!enableHotspotTooltips) return;
                scheduleTooltipClose();
              }}
              onFocus={() => {
                if (!enableHotspotTooltips) return;
                setFocusedHotspotId(hotspot.id);
              }}
              onBlur={() => {
                if (!enableHotspotTooltips) return;
                setFocusedHotspotId((current) => (current === hotspot.id ? null : current));
              }}
              aria-label={`${hotspot.label}${complete ? ', completed' : ''}${locked ? ', locked' : ''}`}
              aria-pressed={selected}
              aria-describedby={enableHotspotTooltips ? tooltipId : undefined}
              title={enableHotspotTooltips ? undefined : locked ? undefined : complete ? 'Mission Complete — Reward Earned' : hotspot.label}
            >
              <span
                className={[
                  'courageMapHotspotRing',
                  complete ? 'courageMapHotspotRing--complete' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                data-color={hotspot.color}
                aria-hidden="true"
              />
              <span className="courageMapHotspotTokenWrap">
                <span className="courageMapHotspotFloat">
                  <span
                    className="courageMapHotspotGlow"
                    data-color={hotspot.color}
                    aria-hidden="true"
                  />
                  <MapHotspotToken src={hotspot.token} className="courageMapHotspotToken" />
                  {complete ? (
                    <>
                      <span className="courageMapHotspotBadge" aria-hidden="true">
                        ✓
                      </span>
                      <span className="courageMapHotspotReward" aria-hidden="true">
                        🎁
                      </span>
                    </>
                  ) : null}
                  {locked ? (
                    <span className="courageMapHotspotLock" aria-hidden="true">
                      🔒
                    </span>
                  ) : null}
                </span>
              </span>
              <span className="courageMapHotspotLabel">{hotspot.label}</span>
            </button>
          );
        })}
        {tooltipHotspot ? (
          <CourageMapHotspotTooltip
            hotspot={tooltipHotspot}
            complete={isHotspotComplete(tooltipHotspot)}
            locked={isHotspotLocked(tooltipHotspot)}
            lockedReason={getHotspotLockedReason?.(tooltipHotspot)}
            style={{
              left: `${tooltipHotspot.position.x}%`,
              top: `${tooltipHotspot.position.y}%`,
            }}
          />
        ) : null}
      </div>
    </div>
  );
});

export default CourageMapCanvas;
