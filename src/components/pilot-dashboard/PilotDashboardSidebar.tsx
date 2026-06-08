import React from 'react';
import {
  BLUE_RIBBON_PILOT_BRAND,
  BLUE_RIBBON_PILOT_SUBBRAND,
  PILOT_SIDEBAR_NAV,
  type PilotSidebarNavId,
} from '../../data/pilotDashboardContent';
import { useFacilitatorGalleryPendingCount } from '../../hooks/useGalleryNavCounts';
import { formatGalleryNavLabel } from '../../lib/galleryNavCounts';
import type { PilotPricingTier } from '../../types/pilotProgram';
import PilotNavIcon from './PilotNavIcon';
import PilotPartnerSupportCard from './PilotPartnerSupportCard';

type PilotSidebarNavItem = {
  id: PilotSidebarNavId;
  label: string;
  icon: PilotSidebarNavId;
};

type PilotDashboardSidebarProps = {
  activeId: PilotSidebarNavId;
  onSelect: (id: PilotSidebarNavId) => void;
  brandTitle?: string;
  brandSubtitle?: string;
  navItems?: PilotSidebarNavItem[];
  programCode?: string;
  pricingTier?: PilotPricingTier;
  showSupportCard?: boolean;
};

export default function PilotDashboardSidebar({
  activeId,
  onSelect,
  brandTitle = BLUE_RIBBON_PILOT_BRAND,
  brandSubtitle = BLUE_RIBBON_PILOT_SUBBRAND,
  navItems = PILOT_SIDEBAR_NAV,
  programCode,
  pricingTier,
  showSupportCard = false,
}: PilotDashboardSidebarProps) {
  const galleryPendingCount = useFacilitatorGalleryPendingCount(programCode);

  return (
    <aside className="pilot-rail" aria-label="Pilot dashboard navigation">
      <div className="pilot-railBrand">
        <p className="pilot-railBrandTitle">{brandTitle}</p>
        <p className="pilot-railBrandSub">{brandSubtitle}</p>
      </div>

      <nav className="pilot-railNav" role="tablist" aria-label="Dashboard sections">
        <ul className="pilot-railNavList">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                role="tab"
                aria-selected={activeId === item.id}
                className={`pilot-railNavBtn${activeId === item.id ? ' pilot-railNavBtn--active' : ''}`}
                onClick={() => onSelect(item.id)}
              >
                <span className="pilot-railIcon">
                  <PilotNavIcon name={item.icon} />
                </span>
                <span>
                  {item.id === 'student-gallery'
                    ? formatGalleryNavLabel(item.label, galleryPendingCount)
                    : item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {showSupportCard ? <PilotPartnerSupportCard pricingTier={pricingTier} /> : null}
    </aside>
  );
}
