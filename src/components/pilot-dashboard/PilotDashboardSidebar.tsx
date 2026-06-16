import React from 'react';
import {
  PILOT_SIDEBAR_NAV,
  type PilotSidebarNavId,
} from '../../data/pilotDashboardContent';
import { useFacilitatorGalleryPendingCount } from '../../hooks/useGalleryNavCounts';
import { formatGalleryNavLabel } from '../../lib/galleryNavCounts';
import { programDashboardTabPath } from '../../lib/programDashboardNav';
import type { PilotPricingTier } from '../../types/pilotProgram';
import BrandLogo from '../../design-system/components/BrandLogo';
import PilotNavIcon from './PilotNavIcon';
import PilotPartnerSupportCard from './PilotPartnerSupportCard';
import PilotProgramSettingsCard from './PilotProgramSettingsCard';

type PilotSidebarNavItem = {
  id: PilotSidebarNavId;
  label: string;
  icon: PilotSidebarNavId;
};

type PilotDashboardSidebarProps = {
  activeId: PilotSidebarNavId;
  onSelect: (id: PilotSidebarNavId) => void;
  navItems?: PilotSidebarNavItem[];
  programCode?: string;
  pricingTier?: PilotPricingTier;
  showSupportCard?: boolean;
  showProgramSettings?: boolean;
};

export default function PilotDashboardSidebar({
  activeId,
  onSelect,
  navItems = PILOT_SIDEBAR_NAV,
  programCode,
  pricingTier,
  showSupportCard = false,
  showProgramSettings = true,
}: PilotDashboardSidebarProps) {
  const galleryPendingCount = useFacilitatorGalleryPendingCount(programCode);

  return (
    <aside className="pilot-rail" aria-label="Pilot dashboard navigation">
      <div className="pilot-railUpper">
        <div className="pilot-railBrand">
          <BrandLogo
            variant="facilitator"
            size="portalWordmark"
            className="pilot-railBrandLogo"
            decorative
          />
        </div>

        <nav className="pilot-railNav" role="tablist" aria-label="Dashboard sections">
          <ul className="pilot-railNavList">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={programDashboardTabPath(item.id)}
                  role="tab"
                  aria-selected={activeId === item.id}
                  className={`pilot-railNavBtn${activeId === item.id ? ' pilot-railNavBtn--active' : ''}`}
                  onClick={(event) => {
                    if (event.defaultPrevented) return;
                    onSelect(item.id);
                  }}
                >
                  <span className="pilot-railIcon">
                    <PilotNavIcon name={item.icon} />
                  </span>
                  <span>
                    {item.id === 'student-gallery'
                      ? formatGalleryNavLabel(item.label, galleryPendingCount)
                      : item.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {showProgramSettings ? (
        <PilotProgramSettingsCard programCode={programCode} pricingTier={pricingTier} />
      ) : showSupportCard ? (
        <PilotPartnerSupportCard pricingTier={pricingTier} />
      ) : null}

      <p className="pilot-railCopyright">© 2026 Caiden&apos;s Courage™ Pilot Materials</p>
    </aside>
  );
}
