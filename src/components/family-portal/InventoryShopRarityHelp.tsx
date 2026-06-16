import React from 'react';

export function InventoryShopRarityHelp() {
  return (
    <div className="inventoryShopRarityHelp" role="note">
      <p className="inventoryShopRarityHelpTitle">Rarity guide</p>
      <ul className="inventoryShopRarityHelpList">
        <li>
          <strong>Common</strong> — simple cosmetic item
        </li>
        <li>
          <strong>Rare</strong> — special visual upgrade
        </li>
        <li>
          <strong>Epic</strong> — premium character/world cosmetic
        </li>
      </ul>
    </div>
  );
}
