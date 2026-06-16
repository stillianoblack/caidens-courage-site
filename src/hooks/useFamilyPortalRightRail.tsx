import React from 'react';
import { useLocation } from 'react-router-dom';
import { FamilyInventoryHelpRail } from '../components/family-portal/FamilyInventoryHelpPlacement';
import { FamilyJourneyCoachRail } from '../components/family-portal/FamilyJourneyCoachPlacement';
import { isFamilyHubHomePath, isFamilyPortalHomePath } from '../lib/familyPortalHomeRoute';
import { isFamilyPortalInventoryPath } from '../lib/familyPortalInventoryRoute';
import { useInventoryHelpPlacement } from './useInventoryHelpPlacement';

/**
 * Portal right utility rail for family portal + family hub layouts.
 * Returns undefined when no rail should mount (so PortalLayout stays single-column).
 */
export function useFamilyPortalRightRail(disabled = false): React.ReactNode {
  const location = useLocation();
  const inventoryHelpPlacement = useInventoryHelpPlacement();

  if (disabled) {
    return undefined;
  }

  const onInventory = isFamilyPortalInventoryPath(location.pathname);
  const onHome =
    isFamilyPortalHomePath(location.pathname) || isFamilyHubHomePath(location.pathname);

  if (onInventory && inventoryHelpPlacement === 'rail') {
    return <FamilyInventoryHelpRail />;
  }

  if (onHome) {
    return <FamilyJourneyCoachRail />;
  }

  return undefined;
}
