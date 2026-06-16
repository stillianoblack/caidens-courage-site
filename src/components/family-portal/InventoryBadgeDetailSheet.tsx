import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GENERIC_BADGE_PLACEHOLDER_SRC } from '../../lib/weeklyRewardDisplay';

export type InventoryBadgeDetail = {
  title: string;
  subtitle: string;
  imageSrc: string | null;
};

type InventoryBadgeDetailSheetProps = {
  badge: InventoryBadgeDetail | null;
  onClose: () => void;
};

export default function InventoryBadgeDetailSheet({
  badge,
  onClose,
}: InventoryBadgeDetailSheetProps) {
  useEffect(() => {
    if (!badge) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [badge]);

  if (!badge) return null;

  return createPortal(
    <div className="inventoryBadgeSheet" role="presentation">
      <button
        type="button"
        className="inventoryBadgeSheetBackdrop"
        aria-label="Close badge details"
        onClick={onClose}
      />
      <div
        className="inventoryBadgeSheetPanel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inventory-badge-sheet-title"
      >
        <button type="button" className="inventoryBadgeSheetClose" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="inventoryBadgeSheetArtWrap">
          <img
            src={badge.imageSrc ?? GENERIC_BADGE_PLACEHOLDER_SRC}
            alt=""
            className="inventoryBadgeSheetArt"
          />
        </div>
        <h2 id="inventory-badge-sheet-title" className="inventoryBadgeSheetTitle">
          {badge.title}
        </h2>
        <p className="inventoryBadgeSheetSubtitle">{badge.subtitle}</p>
        <p className="inventoryBadgeSheetEarned">Badge earned!</p>
      </div>
    </div>,
    document.body,
  );
}
