import React, { forwardRef, useCallback } from 'react';
import { useCourageHubAudio } from './CourageHubAudioContext';
import {
  COURAGE_IN_THE_DARK_BG,
  courageInTheDarkMissions,
  type CourageInTheDarkMission,
} from '../../data/courageInTheDarkMap';

type CourageMapCanvasProps = {
  variant?: 'hub' | 'embedded';
  mapSize?: 'full' | 'split';
  week?: number;
  weekTitle?: string;
  weekUnlockStatus?: string;
  selFocus?: string;
  mapLocked?: boolean;
  baselineLocked?: boolean;
  selectedHotspotId?: string | null;
  heroBar?: React.ReactNode;
  isHotspotComplete: (hotspot: CourageInTheDarkMission) => boolean;
  isHotspotLocked: (hotspot: CourageInTheDarkMission) => boolean;
  animatingHotspotId?: string | null;
  onSelectHotspot: (hotspot: CourageInTheDarkMission) => void;
};

const CourageMapCanvas = forwardRef<HTMLDivElement, CourageMapCanvasProps>(function CourageMapCanvas(
  {
  variant = 'hub',
  mapSize = 'full',
  week = 1,
  weekTitle = 'Courage in the Dark',
  weekUnlockStatus,
  selFocus,
  mapLocked = false,
  baselineLocked = false,
  selectedHotspotId = null,
  heroBar,
    isHotspotComplete,
    isHotspotLocked,
    animatingHotspotId = null,
    onSelectHotspot,
  },
  ref,
) {
  const isHub = variant === 'hub';
  const { playClick } = useCourageHubAudio();

  const handleHotspotClick = useCallback(
    (hotspot: CourageInTheDarkMission) => {
      playClick();
      onSelectHotspot(hotspot);
    },
    [onSelectHotspot, playClick],
  );

  return (
    <div
      ref={ref}
      className={[
        'courageMapCanvas',
        isHub ? 'courageMapCanvas--hub' : '',
        isHub && mapSize === 'split' ? 'courageMapCanvas--hubSplit' : '',
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

      {isHub && heroBar ? (
        <div className="courageMapCanvasHeroOverlay courageMapCanvasHeroOverlay--interactive">
          {heroBar}
        </div>
      ) : null}

      <div className="courageMapHotspots">
        {courageInTheDarkMissions.map((hotspot) => {
          const locked = isHotspotLocked(hotspot);
          const complete = isHotspotComplete(hotspot);
          const selected = selectedHotspotId === hotspot.id;
          const justCompleted = animatingHotspotId === hotspot.id;

          return (
            <button
              key={hotspot.id}
              type="button"
              className={[
                'courageMapHotspot',
                selected ? 'courageMapHotspot--selected' : '',
                complete ? 'courageMapHotspot--complete' : '',
                locked ? 'courageMapHotspot--locked' : '',
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
              aria-label={`${hotspot.label}${complete ? ', completed' : ''}${locked ? ', locked' : ''}`}
              aria-pressed={selected}
              title={
                locked
                  ? undefined
                  : complete
                    ? 'Mission Complete — Reward Earned'
                    : hotspot.label
              }
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
                  <img
                    src={hotspot.token}
                    alt=""
                    className="courageMapHotspotToken"
                    width={120}
                    height={180}
                    loading="lazy"
                    decoding="async"
                  />
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
      </div>
    </div>
  );
});

export default CourageMapCanvas;
