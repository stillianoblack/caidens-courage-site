import React from 'react';
import KidsAdventureIcon from '../../design-system/kids-adventure/KidsAdventureIcon';
import { INVENTORY_REWARDS_EMPTY_MESSAGE } from '../../lib/inventoryEmptyState';

export default function InventoryEarnedRewardsCallout() {
  return (
    <div className="inventoryEarnedRewardsCallout" role="status">
      <span className="inventoryEarnedRewardsCalloutIcon" aria-hidden="true">
        <KidsAdventureIcon name="gift" size={22} filled />
      </span>
      <p className="inventoryEarnedRewardsCalloutText">{INVENTORY_REWARDS_EMPTY_MESSAGE}</p>
    </div>
  );
}
