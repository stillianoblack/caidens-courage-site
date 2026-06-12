import React, { useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { CourageMapHotspot } from '../../data/courageInTheDarkMap';
import type { CourageMissionCardAnchor } from '../../lib/courageMapCardPosition';
import { useCourageHubAudio } from './CourageHubAudioContext';

export type { CourageMissionCardAnchor };

type CourageMapMissionCardProps = {
  hotspot: CourageMapHotspot;
  variant: 'float' | 'sheet' | 'tablet';
  anchor?: CourageMissionCardAnchor | null;
  comingSoon?: boolean;
  locked?: boolean;
  lockedReason?: string;
  startHref?: string | null;
  onClose: () => void;
};

function MissionCardContent({
  hotspot,
  comingSoon,
  locked,
  lockedReason,
  startHref,
  onClose,
  onStart,
  showSheetHandle,
}: {
  hotspot: CourageMapHotspot;
  comingSoon?: boolean;
  locked?: boolean;
  lockedReason?: string;
  startHref?: string | null;
  onClose: () => void;
  onStart: () => void;
  showSheetHandle?: boolean;
}) {
  const canStart = Boolean(startHref) && !locked && !comingSoon;
  return (
    <div
      className="courageMissionCard"
      data-color={hotspot.color}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`courage-mission-card-${hotspot.id}`}
    >
      <div className="courageMissionCardShine" aria-hidden="true" />
      <div
        className={['courageBrandDots', `courageBrandDots--${hotspot.color}`].join(' ')}
        aria-hidden="true"
      />

      {showSheetHandle ? (
        <button
          type="button"
          className="courageMissionCardSheetHandle"
          aria-label="Close mission card"
          onClick={onClose}
        />
      ) : null}

      <button
        type="button"
        className="courageMissionCardClose"
        aria-label="Close mission card"
        onClick={onClose}
      >
        ×
      </button>

      <div className="courageMissionCardPortrait">
        <img
          src={hotspot.thumbnail}
          alt=""
          width={96}
          height={96}
          decoding="async"
        />
      </div>

      <p className="courageMissionCardCharacter">{hotspot.characterName}</p>
      <h3 id={`courage-mission-card-${hotspot.id}`} className="courageMissionCardTitle">
        {hotspot.label}
      </h3>
      <p className="courageMissionCardDesc">{hotspot.description}</p>

      <span className="courageMissionCardRewardChip">{hotspot.rewardText}</span>

      {comingSoon ? (
        <p className="courageMissionCardComingSoon" role="status">
          Adventure coming soon.
        </p>
      ) : null}

      {locked && lockedReason ? (
        <p className="courageMissionCardLockedNote" role="status">
          {lockedReason}
        </p>
      ) : null}

      <div className="courageMissionCardActions">
        {canStart ? (
          <Link
            to={startHref!}
            className="courageMissionCardPrimary"
            data-color={hotspot.color}
            onClick={onStart}
          >
            Start Adventure
          </Link>
        ) : (
          <button
            type="button"
            className="courageMissionCardPrimary"
            data-color={hotspot.color}
            disabled
          >
            Start Adventure
          </button>
        )}
        <button type="button" className="courageMissionCardSecondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default function CourageMapMissionCard({
  hotspot,
  variant,
  anchor,
  comingSoon = false,
  locked = false,
  lockedReason,
  startHref,
  onClose,
}: CourageMapMissionCardProps) {
  const { playClick } = useCourageHubAudio();

  const handleClose = useCallback(() => {
    playClick();
    onClose();
  }, [onClose, playClick]);

  const handleStartAudio = useCallback(() => {
    playClick();
  }, [playClick]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  if (variant === 'sheet') {
    return (
      <>
        <button
          type="button"
          className="courageMissionCardBackdrop"
          aria-label="Close mission card"
          onClick={handleClose}
        />
        <div className="courageMissionCardSheet courageMissionCardSheet--open">
          <MissionCardContent
            hotspot={hotspot}
            comingSoon={comingSoon}
            locked={locked}
            lockedReason={lockedReason}
            startHref={startHref}
            onClose={handleClose}
            onStart={handleStartAudio}
            showSheetHandle
          />
        </div>
      </>
    );
  }

  const floatStyle: React.CSSProperties | undefined =
    variant === 'float' && anchor
      ? { left: `${anchor.left}px`, top: `${anchor.top}px` }
      : undefined;

  return (
    <div
      className={[
        'courageMissionCardFloat',
        variant === 'tablet' ? 'courageMissionCardFloat--tablet' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={floatStyle}
    >
      <MissionCardContent
        hotspot={hotspot}
        comingSoon={comingSoon}
        locked={locked}
        lockedReason={lockedReason}
        startHref={startHref}
        onClose={handleClose}
        onStart={handleStartAudio}
      />
    </div>
  );
}
