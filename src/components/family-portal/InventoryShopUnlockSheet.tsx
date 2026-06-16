import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { RewardShopItem } from '../../data/rewardShopItems';
import type { InventoryShopState } from '../../design-system/kids-adventure/InventoryItemCard';
import FocusCoinIcon from '../rewards/FocusCoinIcon';

type InventoryShopUnlockSheetProps = {
  item: RewardShopItem | null;
  shopState: InventoryShopState | null;
  onClose: () => void;
  onStartMission: () => void;
  onConfirmUnlock: () => void;
  purchasesEnabled?: boolean;
};

export default function InventoryShopUnlockSheet({
  item,
  shopState,
  onClose,
  onStartMission,
  onConfirmUnlock,
  purchasesEnabled = false,
}: InventoryShopUnlockSheetProps) {
  useEffect(() => {
    if (!item) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [item]);

  if (!item || !shopState || shopState === 'owned' || shopState === 'locked') {
    return null;
  }

  const needCoins = shopState === 'need_coins';

  return createPortal(
    <div className="inventoryShopUnlockSheet" role="presentation">
      <button
        type="button"
        className="inventoryShopUnlockSheetBackdrop"
        aria-label="Close shop unlock dialog"
        onClick={onClose}
      />
      <div
        className="inventoryShopUnlockSheetPanel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inventory-shop-unlock-title"
      >
        <button
          type="button"
          className="inventoryShopUnlockSheetClose"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        {needCoins ? (
          <>
            <h2 id="inventory-shop-unlock-title" className="inventoryShopUnlockSheetTitle">
              Need more Focus Coins
            </h2>
            <p className="inventoryShopUnlockSheetBody">
              Earn more Focus Coins by completing missions.
            </p>
            <div className="inventoryShopUnlockSheetActions">
              <button type="button" className="inventoryShopUnlockSheetSecondary" onClick={onClose}>
                Not now
              </button>
              <button type="button" className="inventoryShopUnlockSheetPrimary" onClick={onStartMission}>
                Start a Mission
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 id="inventory-shop-unlock-title" className="inventoryShopUnlockSheetTitle">
              Unlock {item.name}?
            </h2>
            <p className="inventoryShopUnlockSheetBody">
              Unlock <strong>{item.name}</strong> for{' '}
              <span className="inventoryShopUnlockSheetCost">
                <FocusCoinIcon size={16} />
                {item.cost}
              </span>{' '}
              Focus Coins?
            </p>
            {!purchasesEnabled ? (
              <p className="inventoryShopUnlockSheetNotice" role="status">
                Shop purchases are coming soon.
              </p>
            ) : null}
            <div className="inventoryShopUnlockSheetActions">
              <button type="button" className="inventoryShopUnlockSheetSecondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="inventoryShopUnlockSheetPrimary"
                onClick={onConfirmUnlock}
                disabled={!purchasesEnabled}
              >
                Unlock
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
