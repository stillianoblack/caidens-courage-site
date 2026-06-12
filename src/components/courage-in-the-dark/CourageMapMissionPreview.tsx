import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import type { CourageMapHotspot } from '../../data/courageInTheDarkMap';

type CourageMapMissionPreviewProps = {
  hotspot: CourageMapHotspot;
  open: boolean;
  anchor?: { x: number; y: number } | null;
  comingSoon?: boolean;
  locked?: boolean;
  lockedReason?: string;
  startHref?: string | null;
  onClose: () => void;
  onStart: () => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  /** Full-screen backdrop only when preview is click-pinned — avoids hover flicker over hotspots. */
  showBackdrop?: boolean;
};

export default function CourageMapMissionPreview({
  hotspot,
  open,
  anchor,
  comingSoon = false,
  locked = false,
  lockedReason,
  startHref,
  onClose,
  onStart,
  onPointerEnter,
  onPointerLeave,
  showBackdrop = true,
}: CourageMapMissionPreviewProps) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open || typeof document === 'undefined') return null;

  const canStart = Boolean(startHref) && !locked && !comingSoon;
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
  const anchored = !isMobile && anchor;

  const cardStyle: React.CSSProperties | undefined = anchored
    ? {
        left: `${anchor.x}px`,
        top: `${anchor.y}px`,
      }
    : undefined;

  return createPortal(
    <>
      {showBackdrop ? (
        <button
          type="button"
          className="courageMapPreviewBackdrop"
          aria-label="Close mission preview"
          onClick={onClose}
        />
      ) : null}
      <div
        className={[
          'courageMapPreviewCard',
          anchored ? 'courageMapPreviewCard--anchored' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={cardStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`courage-map-preview-${hotspot.id}`}
        onMouseEnter={onPointerEnter}
        onMouseLeave={onPointerLeave}
      >
        <p className="courageMapPreviewEyebrow">{hotspot.characterName}</p>
        <h3 id={`courage-map-preview-${hotspot.id}`} className="courageMapPreviewTitle">
          {hotspot.label}
        </h3>
        <p className="courageMapPreviewDesc">{hotspot.description}</p>
        <p className="courageMapPreviewReward">{hotspot.rewardText}</p>
        {comingSoon ? (
          <p className="courageMapComingSoon" role="status">
            Adventure coming soon.
          </p>
        ) : null}
        {locked && lockedReason ? (
          <p className="courageMapPreviewLockedNote" role="status">
            {lockedReason}
          </p>
        ) : null}
        <div className="courageMapPreviewActions">
          {canStart ? (
            <Link
              to={startHref!}
              className="courageMapPreviewPrimary"
              onClick={onStart}
            >
              Start Adventure
            </Link>
          ) : (
            <button type="button" className="courageMapPreviewPrimary" disabled>
              Start Adventure
            </button>
          )}
          <button type="button" className="courageMapPreviewSecondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
