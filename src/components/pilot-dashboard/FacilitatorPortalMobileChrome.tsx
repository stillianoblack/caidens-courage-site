import React from 'react';
import { useFacilitatorBottomNavBadges } from '../../hooks/useFacilitatorBottomNavBadges';
import type { PilotPricingTier } from '../../types/pilotProgram';
import FacilitatorMobileBottomNav from './FacilitatorMobileBottomNav';
import FacilitatorMobileMoreDrawer from './FacilitatorMobileMoreDrawer';
import '../navigation/mobile-bottom-navigation.css';
import './facilitator-mobile-nav.css';
import './facilitator-mobile-dashboard.css';

type FacilitatorPortalMobileChromeProps = {
  isMobileNav: boolean;
  moreOpen: boolean;
  onOpenMore: () => void;
  onCloseMore: () => void;
  programCode?: string;
  pricingTier?: PilotPricingTier;
};

export default function FacilitatorPortalMobileChrome({
  isMobileNav,
  moreOpen,
  onOpenMore,
  onCloseMore,
  programCode,
  pricingTier,
}: FacilitatorPortalMobileChromeProps) {
  const badges = useFacilitatorBottomNavBadges(programCode);

  if (!isMobileNav) {
    return null;
  }

  return (
    <>
      <FacilitatorMobileBottomNav onOpenMore={onOpenMore} badges={badges} />
      <FacilitatorMobileMoreDrawer
        open={moreOpen}
        onClose={onCloseMore}
        onOpenMore={onOpenMore}
        programCode={programCode}
        pricingTier={pricingTier}
      />
    </>
  );
}

export function facilitatorMobileNavShellClass(enabled: boolean, isMobileNav: boolean): string | undefined {
  if (!enabled || !isMobileNav) return undefined;
  return 'portal-shell--facilitatorMobileNav';
}
