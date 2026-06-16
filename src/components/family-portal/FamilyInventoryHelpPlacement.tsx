import React from 'react';
import './inventory-help-rail.css';
import InventoryHelpCard from './InventoryHelpCard';

/** “How rewards work” card in the portal right utility rail (desktop inventory). */
export function FamilyInventoryHelpRail() {
  return (
    <div className="portal-rightRailCoach portal-rightRailCoach--rail portal-rightRailInventoryHelp">
      <InventoryHelpCard variant="rail" showRarityGuide />
    </div>
  );
}
