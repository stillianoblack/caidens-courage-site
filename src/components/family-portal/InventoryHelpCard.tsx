import React from 'react';
import KidsAdventureIcon from '../../design-system/kids-adventure/KidsAdventureIcon';
import { InventoryShopRarityHelp } from './InventoryShopRarityHelp';

type InventoryHelpCardProps = {
  variant?: 'rail' | 'sheet';
  className?: string;
  showRarityGuide?: boolean;
};

const HELP_ROWS = [
  {
    icon: 'coin' as const,
    label: 'Missions',
    detail: 'Coins + discoveries',
    tone: 'coin',
  },
  {
    icon: 'badge' as const,
    label: 'Weeks',
    detail: 'Badges',
    tone: 'badge',
  },
  {
    icon: 'gift' as const,
    label: 'Month',
    detail: 'Certificate',
    tone: 'month',
  },
];

export default function InventoryHelpCard({
  variant = 'rail',
  className,
  showRarityGuide = true,
}: InventoryHelpCardProps) {
  return (
    <aside
      className={[
        'inventoryHelpCard',
        variant === 'rail' ? 'inventoryHelpCard--rail' : 'inventoryHelpCard--sheet',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-labelledby="inventory-help-title"
    >
      <h2 id="inventory-help-title" className="inventoryHelpCardTitle">
        How rewards work
      </h2>
      <ul className="inventoryHelpCardRows">
        {HELP_ROWS.map((row) => (
          <li key={row.label} className={`inventoryHelpCardRow inventoryHelpCardRow--${row.tone}`}>
            <span className={`inventoryHelpCardRowIcon inventoryHelpCardRowIcon--${row.tone}`} aria-hidden="true">
              <KidsAdventureIcon name={row.icon} size={18} filled />
            </span>
            <span className="inventoryHelpCardRowCopy">
              <span className="inventoryHelpCardRowLabel">{row.label}</span>
              <span className="inventoryHelpCardRowDetail">{row.detail}</span>
            </span>
          </li>
        ))}
      </ul>
      {showRarityGuide ? (
        <div className="inventoryHelpCardRarity">
          <InventoryShopRarityHelp />
        </div>
      ) : null}
    </aside>
  );
}
