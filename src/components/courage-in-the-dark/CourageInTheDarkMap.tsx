import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  COURAGE_IN_THE_DARK_BG,
  courageMapHotspots,
  type CourageMapHotspot,
  type CourageMapHotspotId,
} from '../../data/courageInTheDarkMap';
import { resolveCourageMapTargetHref } from '../../lib/courageInTheDarkRoutes';
import { isCourageMapHotspotComplete, resolveCourageWeekId } from '../../lib/courageInTheDarkProgress';
import { getWeek1MissionUnlockState } from '../../lib/week1MissionUnlock';
import { useCourageInTheDarkProgress } from '../../hooks/useCourageInTheDarkProgress';
import { useToast } from '../portal-design-system/ToastProvider';
import { resolvePortalKidsBasePath } from '../../lib/portalGamePaths';
import type { AdventureTrailNodeView } from '../../types/adventureTrail';
import TrailNode from '../../design-system/components/TrailNode';
import CourageMapMissionPreview from './CourageMapMissionPreview';
import CourageInTheDarkAdventureHub from './CourageInTheDarkAdventureHub';
import './courage-in-the-dark-map.css';

type CourageInTheDarkMapProps = {
  variant?: 'embedded' | 'hero';
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

function resolveTrailNodeForHotspot(
  hotspotId: CourageMapHotspotId,
  nodes: AdventureTrailNodeView[],
): AdventureTrailNodeView | undefined {
  return nodes.find((node) => node.characterId === hotspotId);
}

export default function CourageInTheDarkMap({
  variant = 'embedded',
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
}: CourageInTheDarkMapProps) {
  const isHero = variant === 'hero';

  if (isHero) {
    return (
      <CourageInTheDarkAdventureHub
        weekNodes={weekNodes}
        supplementaryNodes={supplementaryNodes}
        weekTitle={weekTitle}
        week={week}
        weekUnlockStatus={weekUnlockStatus}
        selFocus={selFocus}
        kidsBasePath={kidsBasePath}
        baselineLocked={baselineLocked}
        baselineLockedLabel={baselineLockedLabel}
        mapLocked={mapLocked}
      />
    );
  }

  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const previewCloseTimerRef = useRef<number | null>(null);
  const previewPinnedRef = useRef(false);
  const [selectedHotspot, setSelectedHotspot] = useState<CourageMapHotspot | null>(null);
  const [previewPinned, setPreviewPinned] = useState(false);
  const [previewAnchor, setPreviewAnchor] = useState<{ x: number; y: number } | null>(null);
  const weekId = resolveCourageWeekId(week);
  const { progress } = useCourageInTheDarkProgress(weekId);
  const { showToast } = useToast();

  const resolvedKidsBase =
    kidsBasePath?.replace(/\/+$/, '') ??
    resolvePortalKidsBasePath(
      typeof window !== 'undefined' ? window.location.pathname : '',
    );

  const isHotspotComplete = useCallback(
    (hotspot: CourageMapHotspot) => {
      const trailNode = resolveTrailNodeForHotspot(hotspot.id, weekNodes);
      if (trailNode?.state === 'complete') return true;
      return isCourageMapHotspotComplete(hotspot.id, progress.completedMissionIds);
    },
    [progress.completedMissionIds, weekNodes],
  );

  const getHotspotUnlockState = useCallback(
    (hotspot: CourageMapHotspot) => {
      if (mapLocked || baselineLocked) {
        return { unlocked: false, reason: 'Complete check-in to begin' };
      }
      if (week === 1) {
        return getWeek1MissionUnlockState(hotspot.targetGameSlug, progress.completedMissionIds);
      }
      return { unlocked: !hotspot.locked, reason: hotspot.locked ? 'Locked' : 'Available now' };
    },
    [baselineLocked, mapLocked, progress.completedMissionIds, week],
  );

  const isHotspotLocked = useCallback(
    (hotspot: CourageMapHotspot) => !getHotspotUnlockState(hotspot).unlocked,
    [getHotspotUnlockState],
  );

  const resolvePreviewAnchor = useCallback((hotspot: CourageMapHotspot) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: rect.left + (rect.width * hotspot.position.x) / 100,
      y: rect.top + (rect.height * hotspot.position.y) / 100,
    };
  }, []);

  const openPreview = useCallback(
    (hotspot: CourageMapHotspot, pinned = false) => {
      const locked = isHotspotLocked(hotspot);
      previewPinnedRef.current = pinned;
      setSelectedHotspot(hotspot);
      setPreviewPinned(pinned);
      setPreviewAnchor(resolvePreviewAnchor(hotspot));
      if (locked) {
        showToast(getHotspotUnlockState(hotspot).reason, 'info');
      }
    },
    [getHotspotUnlockState, isHotspotLocked, resolvePreviewAnchor, showToast],
  );

  const closePreview = useCallback(() => {
    if (previewCloseTimerRef.current) {
      window.clearTimeout(previewCloseTimerRef.current);
      previewCloseTimerRef.current = null;
    }
    previewPinnedRef.current = false;
    setSelectedHotspot(null);
    setPreviewPinned(false);
    setPreviewAnchor(null);
  }, []);

  const scheduleHoverPreviewClose = useCallback(() => {
    if (previewPinnedRef.current) return;
    if (previewCloseTimerRef.current) {
      window.clearTimeout(previewCloseTimerRef.current);
    }
    previewCloseTimerRef.current = window.setTimeout(() => {
      if (!previewPinnedRef.current) {
        closePreview();
      }
    }, 320);
  }, [closePreview]);

  const cancelHoverPreviewClose = useCallback(() => {
    if (previewCloseTimerRef.current) {
      window.clearTimeout(previewCloseTimerRef.current);
      previewCloseTimerRef.current = null;
    }
  }, []);

  const targetHref = useMemo(() => {
    if (!selectedHotspot) return null;
    return resolveCourageMapTargetHref(
      selectedHotspot.targetGameSlug,
      resolvedKidsBase,
      week,
      weekTitle,
    );
  }, [resolvedKidsBase, selectedHotspot, week, weekTitle]);

  const handleStartAdventure = useCallback(() => {
    if (!selectedHotspot || isHotspotLocked(selectedHotspot)) return;

    if (!targetHref) {
      if (process.env.NODE_ENV === 'development') {
        console.info('[COURAGE_MAP] Adventure coming soon:', selectedHotspot.targetGameSlug);
      }
      return;
    }

    closePreview();
    navigate(targetHref);
  }, [closePreview, isHotspotLocked, navigate, selectedHotspot, targetHref]);

  const comingSoon = Boolean(selectedHotspot && !targetHref);

  return (
    <div
      className={[
        'courageMapShell',
        'portal-gameFrame',
        isHero ? 'courageMapShell--hero' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Courage in the Dark adventure map"
    >
      {!isHero ? (
        <header className="courageMapShellHeader">
          <h3 className="courageMapShellTitle">Courage in the Dark</h3>
          <p className="courageMapShellSubtitle">Choose your adventure.</p>
        </header>
      ) : null}

      <div
        ref={canvasRef}
        className={[
          'courageMapCanvas',
          isHero ? 'courageMapCanvas--hero' : '',
          mapLocked || baselineLocked ? 'courageMapCanvas--locked' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <img
          src={COURAGE_IN_THE_DARK_BG}
          alt=""
          className="courageMapBg"
          width={1600}
          height={900}
          decoding="async"
        />

        {isHero ? (
          <div className="courageMapCanvasHeroOverlay">
            <div className="courageMapCanvasHeroCopy">
              <p className="courageMapCanvasEyebrow">Week {week}</p>
              <h2 className="courageMapCanvasTitle">{weekTitle}</h2>
              <p className="courageMapCanvasSubtitle">Choose your adventure.</p>
              {selFocus ? (
                <p className="courageMapCanvasSelFocus">SEL Focus: {selFocus}</p>
              ) : null}
            </div>
            {weekUnlockStatus ? (
              <span className="courageMapCanvasStatus" role="status">
                {weekUnlockStatus}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="courageMapHotspots">
          {courageMapHotspots.map((hotspot) => {
            const locked = isHotspotLocked(hotspot);
            const complete = isHotspotComplete(hotspot);
            const selected = selectedHotspot?.id === hotspot.id;

            return (
              <button
                key={hotspot.id}
                type="button"
                className={[
                  'courageMapHotspot',
                  selected ? 'courageMapHotspot--selected' : '',
                  locked ? 'courageMapHotspot--locked' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{
                  left: `${hotspot.position.x}%`,
                  top: `${hotspot.position.y}%`,
                  width: `${hotspot.size.width}%`,
                }}
                onClick={() => openPreview(hotspot, true)}
                onMouseEnter={() => {
                  if (window.matchMedia('(hover: hover)').matches && !locked) {
                    cancelHoverPreviewClose();
                    openPreview(hotspot, false);
                  }
                }}
                onMouseLeave={() => {
                  if (window.matchMedia('(hover: hover)').matches) {
                    scheduleHoverPreviewClose();
                  }
                }}
                disabled={false}
                aria-label={`${hotspot.label}${complete ? ', completed' : ''}${locked ? ', locked' : ''}`}
              >
                <span
                  className={[
                    'courageMapHotspotRing',
                    complete ? 'courageMapHotspotRing--complete' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden="true"
                />
                <span className="courageMapHotspotTokenWrap">
                  <span className="courageMapHotspotFloat">
                    <span className="courageMapHotspotGlow" aria-hidden="true" />
                    <img
                      src={hotspot.token}
                      alt=""
                      className="courageMapHotspotToken"
                      style={
                        isHero ? undefined : { width: '100%', height: 'auto', maxHeight: 'min(22vh, 9rem)' }
                      }
                      width={120}
                      height={180}
                      loading="lazy"
                      decoding="async"
                    />
                    {complete ? (
                      <span className="courageMapHotspotBadge" aria-hidden="true">
                        ✓
                      </span>
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
        </div>
      </div>

      {baselineLocked ? (
        <p className="family-panelHelper" role="status">
          {baselineLockedLabel}
        </p>
      ) : null}

      {selectedHotspot ? (
        <CourageMapMissionPreview
          hotspot={selectedHotspot}
          open
          anchor={previewAnchor}
          comingSoon={comingSoon}
          locked={isHotspotLocked(selectedHotspot)}
          lockedReason={getHotspotUnlockState(selectedHotspot).reason}
          showBackdrop={previewPinned}
          onClose={closePreview}
          onStart={handleStartAdventure}
          onPointerEnter={cancelHoverPreviewClose}
          onPointerLeave={scheduleHoverPreviewClose}
        />
      ) : null}

      {supplementaryNodes.length > 0 ? (
        <div
          className={[
            'courageMapSupplementary',
            isHero ? 'courageMapSupplementary--hero' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
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
      ) : null}
    </div>
  );
}
